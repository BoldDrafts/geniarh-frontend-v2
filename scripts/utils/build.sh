#!/bin/bash
# ==================================================================================================
# Script de Construcción y Despliegue
# Autor: Tu Equipo
# ==================================================================================================
set -e  # Detener ejecución al encontrar errores

# Cargar funciones commons
# --------------------------------------------------------------------------------------------------
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
COMMONS_DIR=$(dirname "${SCRIPT_DIR}")/commons

# Cargar scripts commons
source "$(dirname "${BASH_SOURCE[0]}")/../commons/log.sh"
source "$(dirname "${BASH_SOURCE[0]}")/../commons/validate.sh"
source "$(dirname "${BASH_SOURCE[0]}")/../commons/get.sh"

# Configurar MODULE_NAME para logs
MODULE_NAME="build.sh"

function validate_version() {
    log "INFO" "Validando versión del proyecto..."
    
    # Para proyecto frontend, validar package.json en lugar de pom.xml
    local project_root
    project_root=$(get_project_dir)
    local package_json_path="${project_root}/package.json"
    
    validate_file "${package_json_path}" "package.json no encontrado en ${package_json_path}"
    
    local package_version
    package_version=$(jq -r .version <"${package_json_path}")
    
    if [[ "${P_APP_VERSION}" != "${package_version}" ]]; then
        handle_error "La versión especificada (${P_APP_VERSION}) no coincide con la versión del package.json (${package_version}). Por favor, actualice la versión en el package.json o especifique la versión correcta con --app-version"
    else
        log "SUCCESS" "✅ Versión validada correctamente: ${P_APP_VERSION}"
    fi
}

function run_tests() {
    log "INFO" "Ejecutando pruebas..."
    local project_root=$(get_project_dir)
    
    cd "${project_root}"
    
    # Validar package.json para npm/pnpm
    validate_file "package.json" "package.json no encontrado"
    validate_file "package-lock.json" "package-lock.json no encontrado"
    
    # Instalar dependencias y ejecutar pruebas
    if command -v pnpm &> /dev/null; then
        log "INFO" "Usando pnpm para instalar dependencias y ejecutar pruebas..."
        pnpm install
        pnpm test
    else
        log "INFO" "Usando npm para instalar dependencias y ejecutar pruebas..."
        npm install
        npm test
    fi
    
    log "SUCCESS" "✅ Pruebas completadas exitosamente"
}

function show_version() {
    local project_root=$(get_project_dir)
    local package_json_path="${project_root}/package.json"
    
    validate_file "${package_json_path}" "package.json no encontrado"
    
    jq -r .version <"${package_json_path}"
}

function build_image() {
    log "INFO" "Construyendo aplicación frontend..."
    validate_version

    local project_root=$(get_project_dir)
    cd "${project_root}"
    
    # Validar archivos necesarios para el build
    validate_file "package.json" "package.json no encontrado"
    validate_file "Dockerfile" "Dockerfile no encontrado"
    
    log "INFO" "Instalando dependencias y construyendo aplicación..."
    
    # Determinar gestor de paquetes preferido
    if command -v pnpm &> /dev/null; then
        log "INFO" "Usando pnpm para el build..."
        pnpm install
        pnpm build
    elif command -v yarn &> /dev/null; then
        log "INFO" "Usando yarn para el build..."
        yarn install
        yarn build
    else
        log "INFO" "Usando npm para el build..."
        npm install
        npm run build
    fi

    log "INFO" "Construyendo imagen Docker ${P_APP_IMAGE}:${P_APP_VERSION}..."

    # Detectar motor de contenedores disponible
    local container_cmd="docker"
    if command -v podman &> /dev/null; then
        container_cmd="podman"
        log "INFO" "Usando Podman para construir la imagen"
    else
        log "INFO" "Usando Docker para construir la imagen"
    fi

    # Construir imagen con soporte para buildkit en Docker
    if [[ "${container_cmd}" == "docker" ]]; then
        DOCKER_BUILDKIT=1 ${container_cmd} build -f Dockerfile -t "${P_APP_IMAGE}:${P_APP_VERSION}" .
    else
        ${container_cmd} build -f Dockerfile -t "${P_APP_IMAGE}:${P_APP_VERSION}" .
    fi

    log "SUCCESS" "✅ Imagen construida exitosamente: ${P_APP_IMAGE}:${P_APP_VERSION}"

    # También etiquetar como latest si estamos en el perfil principal
    if [[ "master" == "${P_PROFILE}" || "main" == "${P_PROFILE}" ]]; then
        log "INFO" "Etiquetando imagen como latest..."
        ${container_cmd} tag "${P_APP_IMAGE}:${P_APP_VERSION}" "${P_APP_IMAGE}:latest"
    fi
}

# Banner de inicio
echo "===================================================================================================="
echo "🚀 Herramienta de Construcción y Despliegue Frontend"
echo "===================================================================================================="

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --profile PROFILE      Perfil a utilizar (default: master)"
    echo "  --action ACTION       Acción a ejecutar: build, test, version (default: build)"
    echo "  --app-image IMAGE     Nombre de la imagen Docker (default: valor de ENV_APP_IMAGE)"
    echo "  --app-version VERSION Versión de la aplicación (default: valor de ENV_APP_VERSION)"
    echo "  --help, -h            Muestra esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 --action test --profile develop"
    echo "  $0 --action build --app-version 1.0.0 --app-image myapp"
}

# Función para validar parámetro con valor
validate_param_value() {
    local param_name="$1"
    local param_value="$2"
    local next_arg="$3"
    local usage_example="$4"
    
    if [[ -z "$next_arg" || "$next_arg" == --* ]]; then
        handle_error "El parámetro --${param_name} requiere un valor. Uso: ${usage_example}"
    fi
    echo "$next_arg"
}

# Procesar argumentos
# --------------------------------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
    case "$1" in
        --profile)
            P_PROFILE=$(validate_param_value "profile" "$1" "$2" "[master|develop|otro_perfil]")
            shift 2
            ;;
    --branch)
            log "WARNING" "El parámetro --branch está obsoleto. Use --profile en su lugar."
            P_PROFILE=$(validate_param_value "branch" "$1" "$2" "[master|develop|otro_perfil]")
            shift 2
            ;;
        --action)
            P_ACTION=$(validate_param_value "action" "$1" "$2" "[build|test|version]")
            shift 2
            ;;
        --app-image)
            P_APP_IMAGE=$(validate_param_value "app-image" "$1" "$2" "nombre_imagen")
            shift 2
            ;;
        --app-version)
            P_APP_VERSION=$(validate_param_value "app-version" "$1" "$2" "version")
            shift 2
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            handle_error "Parámetro desconocido: $1. Use --help para ver las opciones disponibles"
            ;;
    esac
done

# Configuración inicial
# --------------------------------------------------------------------------------------------------
# Establecer valores por defecto
P_PROFILE=${P_PROFILE:-"master"}

# Cargar variables de entorno usando función común
utils_dir=$(get_script_dir)
load_env_vars "$P_PROFILE" "$utils_dir"

# Establecer valores por defecto con prioridad: variable local -> ENV_* del perfil -> valor inline
P_ACTION=${P_ACTION:-"build"}
P_APP_IMAGE=$(set_with_fallback "APP_IMAGE" "geniarh-frontend-v2")
P_APP_VERSION=$(set_with_fallback "APP_VERSION" "1.0.0")

# Validar configuración requerida usando funciones commons
validate_required "P_APP_IMAGE" "${P_APP_IMAGE}" "El nombre de la imagen de la aplicación no está definido"
validate_required "P_APP_VERSION" "${P_APP_VERSION}" "La versión de la aplicación no está definido"

# Ejecutar acción solicitada
# --------------------------------------------------------------------------------------------------
log "INFO" "Ejecutando acción: ${P_ACTION}"

case "${P_ACTION}" in
    "test")
        run_tests
        ;;
    "version")
        show_version
        ;;
    "build")
        build_image
        ;;
    *)
        handle_error "Acción desconocida: ${P_ACTION}. Acciones disponibles: build, test, version"
        ;;
esac

log "SUCCESS" "Proceso completado exitosamente"
exit 0