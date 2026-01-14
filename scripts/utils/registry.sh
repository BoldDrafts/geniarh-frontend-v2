#!/bin/bash
# Descripción: Script para gestionar registro Docker
# Uso: ./registry.sh --action [login|push] --app-image NOMBRE --app-version VERSIÓN

# Activar modo de error estricto
set -e
set -o pipefail

# Cargar scripts commons
source "$(dirname "${BASH_SOURCE[0]}")/../commons/log.sh"
source "$(dirname "${BASH_SOURCE[0]}")/../commons/validate.sh"
source "$(dirname "${BASH_SOURCE[0]}")/../commons/get.sh"

# Configurar módulo para logs
MODULE_NAME="registry.sh"

script_dir=$(get_script_dir)

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --action ACTION       Acción a ejecutar: login, push (default: login)"
    echo "  --profile PROFILE      Perfil a utilizar (default: master)"
    echo "  --app-image IMAGE     Nombre de la imagen Docker (default: valor de ENV_APP_IMAGE)"
    echo "  --app-version VERSION Versión de la aplicación (default: valor de ENV_APP_VERSION)"
    echo "  --app-name IMAGE      Nombre de la imagen (alias para --app-image)"
    echo "  --help, -h            Muestra esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 --action login --profile develop"
    echo "  $0 --action push --app-version 1.0.0 --app-image myapp"
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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --action)
        P_ACTION=$(validate_param_value "action" "$1" "$2" "[login|push]")
        shift 2
        ;;
    --profile)
        P_PROFILE=$(validate_param_value "profile" "$1" "$2" "[master|develop|otro_perfil]")
        shift 2
        ;;
    --branch)
        log "WARNING" "El parámetro --branch está obsoleto. Use --profile en su lugar."
        P_PROFILE=$(validate_param_value "branch" "$1" "$2" "[master|develop|otro_perfil]")
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
    --app-name)
        P_APP_IMAGE=$(validate_param_value "app-name" "$1" "$2" "nombre_imagen")
        shift 2
        ;;
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        log "ERROR" "Parámetro desconocido: $1"
        echo "Use --help para ver las opciones disponibles"
        exit 1
        ;;
  esac
done

P_PROFILE=${P_PROFILE:-"master"}

# Cargar variables de entorno usando función común (solo del perfil específico)
# NOTA: No cargamos profile.env.example ya que solo contiene valores de ejemplo
load_env_vars "$P_PROFILE" "$script_dir"

P_ACTION=${P_ACTION:-"login"}
P_APP_IMAGE=$(set_with_fallback "APP_IMAGE" "geniarh-frontend-v2")
P_APP_VERSION=$(set_with_fallback "APP_VERSION" "1.0.0")
P_IMG_REGISTRY_DOMAIN=$(set_with_fallback "IMG_REGISTRY_DOMAIN" "registry.cmaconsulting.org")

# Variables adicionales para login/push
REGISTRY_USER=$(set_with_fallback "REGISTRY_USER" "")
REGISTRY_TOKEN=$(set_with_fallback "REGISTRY_TOKEN" "")

# Validar variables requeridas
validate_required "REGISTRY_USER" "${REGISTRY_USER}" "El usuario del registro no está definido"
validate_required "REGISTRY_TOKEN" "${REGISTRY_TOKEN}" "El token del registro no está definido"
validate_required "P_APP_IMAGE" "${P_APP_IMAGE}" "El nombre de la imagen no está definido"
validate_required "P_APP_VERSION" "${P_APP_VERSION}" "La versión de la imagen no está definida"

log "INFO" "REGISTRY_DOMAIN: ${P_IMG_REGISTRY_DOMAIN}"
log "INFO" "IMAGE: ${P_APP_IMAGE}:${P_APP_VERSION}"

case "${P_ACTION}" in
    "login")
        log "INFO" "Iniciando sesión en registry..."
        
        # Detectar motor de contenedores disponible
        local container_cmd="docker"
        if command -v podman &> /dev/null; then
            container_cmd="podman"
            log "INFO" "Usando Podman para el login"
        else
            log "INFO" "Usando Docker para el login"
        fi
        
        # Validar que el comando esté disponible
        if ! command -v "${container_cmd}" &> /dev/null; then
            handle_error "No se encontró ${container_cmd}. Por favor instale Docker o Podman."
        fi
        
        echo "${REGISTRY_TOKEN}" | ${container_cmd} login "${P_IMG_REGISTRY_DOMAIN}" -u "${REGISTRY_USER}" --password-stdin
        log "SUCCESS" "Sesión iniciada correctamente"
        ;;
    "push")
        log "INFO" "Etiquetando y publicando imagen..."
        
        # Detectar motor de contenedores disponible
        local container_cmd="docker"
        if command -v podman &> /dev/null; then
            container_cmd="podman"
            log "INFO" "Usando Podman para el push"
        else
            log "INFO" "Usando Docker para el push"
        fi
        
        # Validar que el comando esté disponible
        if ! command -v "${container_cmd}" &> /dev/null; then
            handle_error "No se encontró ${container_cmd}. Por favor instale Docker o Podman."
        fi
        
        # Validar que la imagen exista localmente
        if ! ${container_cmd} image inspect "${P_APP_IMAGE}:${P_APP_VERSION}" &> /dev/null; then
            handle_error "La imagen ${P_APP_IMAGE}:${P_APP_VERSION} no existe localmente. Por favor, construya la imagen primero."
        fi
        
        # Etiquetar y publicar
        ${container_cmd} tag "${P_APP_IMAGE}:${P_APP_VERSION}" "${P_IMG_REGISTRY_DOMAIN}/${P_APP_IMAGE}:${P_APP_VERSION}"
        ${container_cmd} push "${P_IMG_REGISTRY_DOMAIN}/${P_APP_IMAGE}:${P_APP_VERSION}"
        
        # También etiquetar y publicar como latest si estamos en el perfil principal
        if [[ "master" == "${P_PROFILE}" || "main" == "${P_PROFILE}" ]]; then
            log "INFO" "Etiquetando y publicando como latest..."
            ${container_cmd} tag "${P_IMG_REGISTRY_DOMAIN}/${P_APP_IMAGE}:${P_APP_VERSION}" "${P_IMG_REGISTRY_DOMAIN}/${P_APP_IMAGE}:latest"
            ${container_cmd} push "${P_IMG_REGISTRY_DOMAIN}/${P_APP_IMAGE}:latest"
        fi
        
        log "SUCCESS" "Imagen publicada correctamente"
        ;;
    *)
        handle_error "Acción desconocida: ${P_ACTION}. Acciones disponibles: login, push"
        ;;
esac

log "SUCCESS" "Proceso completado exitosamente"
exit 0