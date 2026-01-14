#!/bin/bash
# ==================================================================================================
# DEPLOYMENT AUTOMATION SCRIPT - VERSIÓN OPTIMIZADA
# ==================================================================================================
# Descripción: Script automatizado para gestión de builds, deployments y contenedores
# Basado en: https://tomd.xyz/camel-maven/
# Versión: 4.0.0 - Optimización para frontend GenIA-HR
# ==================================================================================================

set -euo pipefail  # Modo estricto mejorado
IFS=$'\n\t'        # Separador de campos seguro

# Cargar funciones commons
COMMONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/commons" && pwd)"
source "${COMMONS_DIR}/log.sh"
source "${COMMONS_DIR}/validate.sh"
source "${COMMONS_DIR}/get.sh"

# Configurar módulo para logs
MODULE_NAME="run.sh"

# Obtener directorios usando funciones commons
script_dir=$(get_script_dir)
project_dir=$(get_project_dir)

# ==================================================================================================
# CONFIGURACIÓN GLOBAL
# ==================================================================================================

readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
readonly SCRIPT_VERSION="4.0.0"
readonly LOG_FILE="${script_dir}/deployment.log"

# Configuración de timeouts y reintentos
readonly DEFAULT_TIMEOUT=300
readonly MAX_RETRY_ATTEMPTS=3
readonly RETRY_DELAY=2

# ==================================================================================================
# CONFIGURACIÓN DE COLORES E ICONOS
# ==================================================================================================

# Detección automática de soporte de colores
if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && [[ "${TERM:-}" != "dumb" ]]; then
    readonly COLOR_SUPPORT=true
    readonly RED="$(tput setaf 1)" GREEN="$(tput setaf 2)" YELLOW="$(tput setaf 3)"
    readonly BLUE="$(tput setaf 4)" PURPLE="$(tput setaf 5)" CYAN="$(tput setaf 6)"
    readonly WHITE="$(tput setaf 7)" GRAY="$(tput setaf 8)" BOLD="$(tput bold)" NC="$(tput sgr0)"
else
    readonly COLOR_SUPPORT=false
    readonly RED="" GREEN="" YELLOW="" BLUE="" PURPLE="" CYAN="" WHITE="" GRAY="" BOLD="" NC=""
fi

# Iconos adaptativos según terminal
if [[ "${TERM:-}" =~ (xterm|screen|tmux) ]] && [[ "${LC_ALL:-${LANG:-}}" =~ UTF-8 ]]; then
    readonly ICON_SUCCESS="✅" ICON_ERROR="❌" ICON_WARNING="⚠️" ICON_INFO="ℹ️"
    readonly ICON_ROCKET="🚀" ICON_BUILD="🔨" ICON_DEPLOY="🚀" ICON_DOCKER="🐳"
    readonly ICON_K8S="☸️" ICON_GIT="🌿" ICON_GEAR="⚙️" ICON_PACKAGE="📦"
    readonly ICON_LOG="📝" ICON_TIME="⏰" ICON_CONFIG="🔧"
else
    readonly ICON_SUCCESS="[OK]" ICON_ERROR="[ERR]" ICON_WARNING="[WARN]" ICON_INFO="[INFO]"
    readonly ICON_ROCKET="[DEPLOY]" ICON_BUILD="[BUILD]" ICON_DEPLOY="[DEPLOY]" ICON_DOCKER="[DOCKER]"
    readonly ICON_K8S="[K8S]" ICON_GIT="[GIT]" ICON_GEAR="[ACTION]" ICON_PACKAGE="[PKG]"
    readonly ICON_LOG="[LOG]" ICON_TIME="[TIME]" ICON_CONFIG="[CFG]"
fi

# ==================================================================================================
# VARIABLES GLOBALES
# ==================================================================================================

declare -A CONFIG=(
    [action]=""
    [profile]="master"
    [app_image]=""
    [app_version]=""
    [app_container]=""
    [k8s_namespace]=""
    [argocd_path]=""
    [container_engine]=""
    [profile]="master"
    [verbose]=false
    [dry_run]=false
    [force]=false
    [quiet]=false
)

declare -A ENV_CONFIG=()
declare -A CONTAINER_ENGINE_INFO=()
declare -a CLEANUP_FILES=()
declare -i EXIT_CODE=0

# ==================================================================================================
# FUNCIONES DE MEJORAS
# ==================================================================================================

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

# Función para validar valor de parámetro
validate_param_option() {
    local param_name="$1"
    local param_value="$2"
    local valid_values="$3"
    
    if [[ -n "$valid_values" && "$valid_values" != *"$param_value"* ]]; then
        handle_error "Valor inválido para --${param_name}: '$param_value'. Valores válidos: $valid_values"
    fi
}

# Función para ejecutar con reintentos
execute_with_retry() {
    local command="$1"
    local description="$2"
    local attempt=1
    
    log "INFO" "${description}..."
    
    while [[ ${attempt} -le ${MAX_RETRY_ATTEMPTS} ]]; do
        log "DEBUG" "Intento ${attempt}/${MAX_RETRY_ATTEMPTS}: ${command}"
        
        if [[ "${CONFIG[dry_run]}" == true ]]; then
            log "INFO" "[DRY RUN] ${command}"
            return 0
        fi
        
        if eval "${command}"; then
            log "SUCCESS" "${description} completado"
            return 0
        else
            local exit_code=$?
            log "WARNING" "${description} falló (intento ${attempt}/${MAX_RETRY_ATTEMPTS})"
            
            if [[ ${attempt} -lt ${MAX_RETRY_ATTEMPTS} ]]; then
                log "INFO" "Reintentando en ${RETRY_DELAY}s..."
                sleep ${RETRY_DELAY}
            fi
            ((attempt++))
        fi
    done
    
    log "ERROR" "${description} falló después de ${MAX_RETRY_ATTEMPTS} intentos"
    return 1
}

# Función para verificar scripts
check_script_exists() {
    local script="$1"
    local description="$2"
    
    if [[ ! -f "${script}" ]]; then
        log "ERROR" "${description} no encontrado: ${script}"
        return 1
    fi
    
    if [[ ! -x "${script}" ]]; then
        log "WARNING" "${description} no tiene permisos de ejecución: ${script}"
        chmod +x "${script}" 2>/dev/null || {
            log "ERROR" "No se pueden otorgar permisos de ejecución a: ${script}"
            return 1
        }
        log "INFO" "Permisos de ejecución otorgados a: ${script}"
    fi
    
    return 0
}

# ==================================================================================================
# FUNCIONES DE DETECCIÓN DE MOTOR DE CONTENEDORES
# ==================================================================================================

detect_container_engine() {
    log "INFO" "Detectando motor de contenedores..."
    
    # Si ya está configurado, validarlo
    if [[ -n "${CONFIG[container_engine]}" ]]; then
        if validate_container_engine "${CONFIG[container_engine]}"; then
            log "SUCCESS" "Motor configurado: ${CONFIG[container_engine]}"
            return 0
        else
            log "WARNING" "Motor configurado no funcional: ${CONFIG[container_engine]}"
        fi
    fi
    
    # Auto-detección (Podman primero por mejor seguridad)
    local -a engines=("podman" "docker")
    for engine in "${engines[@]}"; do
        if command -v "${engine}" >/dev/null 2>&1 && validate_container_engine "${engine}"; then
            CONFIG[container_engine]="${engine}"
            get_container_engine_info "${engine}"
            log "SUCCESS" "Motor detectado: ${engine} v${CONTAINER_ENGINE_INFO[version]}"
            return 0
        fi
    done
    
    log "ERROR" "No hay motores de contenedores funcionales (docker/podman)"
    return 1
}

validate_container_engine() {
    local engine="$1"
    log "DEBUG" "Validando motor: ${engine}"
    
    case "${engine}" in
        "docker")
            if docker version >/dev/null 2>&1; then
                return 0
            else
                log "WARNING" "Docker no está ejecutándose. Intenta: sudo systemctl start docker"
                return 1
            fi
            ;;
        "podman")
            if podman version >/dev/null 2>&1; then
                return 0
            else
                log "WARNING" "Podman no está funcionando correctamente"
                return 1
            fi
            ;;
        *)
            log "ERROR" "Motor no soportado: ${engine}"
            return 1
            ;;
    esac
}

get_container_engine_info() {
    local engine="$1"
    case "${engine}" in
        "docker")
            CONTAINER_ENGINE_INFO[version]="$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
            CONTAINER_ENGINE_INFO[socket]="/var/run/docker.sock"
            ;;
        "podman")
            CONTAINER_ENGINE_INFO[version]="$(podman --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
            CONTAINER_ENGINE_INFO[socket]="/run/user/$(id -u)/podman/podman.sock"
            ;;
    esac
}

container_cmd() {
    local engine="${CONFIG[container_engine]}"
    log "DEBUG" "Ejecutando: ${engine} $*"
    
    if [[ "${CONFIG[dry_run]}" == true ]]; then
        log "INFO" "[DRY RUN] ${engine} $*"
        return 0
    fi
    
    "${engine}" "$@"
}

# ==================================================================================================
# FUNCIONES DE VALIDACIÓN Y CONFIGURACIÓN
# ==================================================================================================

load_env_config() {
    local env_file="${script_dir}/utils/env/${CONFIG[profile]}.env"
    
    log "INFO" "Cargando configuración: ${env_file}"
    
    if [[ ! -f "${env_file}" ]]; then
        log "WARNING" "Archivo de configuración no encontrado: ${env_file}"
        return 1
    fi
    
    # Cargar variables de entorno usando función commons
    load_env_vars "${CONFIG[profile]}" "${script_dir}/utils"
    
    log "SUCCESS" "Configuración cargada correctamente"
    return 0
}

apply_env_defaults() {
    log "INFO" "Aplicando valores por defecto..."
    
    # Variables locales para el fallback
    local ACTION="${CONFIG[action]:-build}"
    local PROFILE="${CONFIG[profile]:-master}"
    
    # Usar funciones commons para aplicar defaults con fallback
    # Prioridad: variable CLI → ENV_* del perfil → valor por defecto
    P_PROFILE="$PROFILE"
    P_ACTION="$ACTION"
    
    # Aplicar directamente desde ENV_CONFIG usando los nombres correctos
    # Las variables del archivo .env ya están cargadas en ENV_CONFIG
    P_APP_IMAGE="${CONFIG[app_image]:-${ENV_CONFIG[ENV_APP_IMAGE]:-geniarh-frontend-v2}}"
    P_APP_VERSION="${CONFIG[app_version]:-${ENV_CONFIG[ENV_APP_VERSION]:-1.0.0}}"
    P_APP_CONTAINER="${CONFIG[app_container]:-${ENV_CONFIG[ENV_APP_CONTAINER]:-geniarh-frontend-v2-${PROFILE}}}"
    P_HOST_PORT="${CONFIG[host_port]:-${ENV_CONFIG[ENV_HOST_PORT]:-8080}}"
    P_K8S_NAMESPACE="${CONFIG[k8s_namespace]:-${ENV_CONFIG[ENV_NAMESPACE]:-synopsis-ws}}"
    P_ARGOCD_PATH="${CONFIG[argocd_path]:-${ENV_CONFIG[ENV_ARGOCD_PATH]:-}}"
    P_CONTAINER_ENGINE="${CONFIG[container_engine]:-${ENV_CONFIG[ENV_CONTAINER_ENGINE]:-}}"
}

validate_config() {
    log "INFO" "Validando configuración..."
    local -a errors=()
    
    # Validaciones por acción
    case "${CONFIG[action]}" in
        "build"|"publish")
            [[ -z "${CONFIG[app_image]}" ]] && errors+=("app_image requerido para ${CONFIG[action]}")
            [[ -z "${CONFIG[app_version]}" ]] && errors+=("app_version requerido para ${CONFIG[action]}")
            ;;
        "k8s-run")
            [[ -z "${CONFIG[host_port]}" ]] && errors+=("host_port requerido para k8s-run")
            ;;
        "export-yaml")
            [[ -z "${CONFIG[argocd_path]}" ]] && errors+=("argocd_path requerido para export-yaml")
            ;;
        "container-"*)
            [[ -z "${CONFIG[app_container]}" ]] && errors+=("app_container requerido para ${CONFIG[action]}")
            if [[ "${CONFIG[action]}" == "container-run" ]]; then
                [[ -z "${CONFIG[app_image]}" ]] && errors+=("app_image requerido para container-run")
                [[ -z "${CONFIG[app_version]}" ]] && errors+=("app_version requerido para container-run")
            fi
            ;;
    esac
    
    if [[ ${#errors[@]} -gt 0 ]]; then
        log "ERROR" "Errores de validación:"
        printf '%s\n' "${errors[@]}" | while read -r error; do
            log "ERROR" "  - ${error}"
        done
        return 1
    fi
    
    log "SUCCESS" "Configuración válida"
    return 0
}

validate_dependencies() {
    log "INFO" "Validando dependencias del sistema..."
    
    # Detectar motor de contenedores
    detect_container_engine || return 1
    
    # Validar kubectl solo si se usan acciones de K8s
    if [[ "${CONFIG[action]}" =~ ^k8s- ]] && ! command -v kubectl >/dev/null 2>&1; then
        log "ERROR" "kubectl es requerido para acciones de Kubernetes"
        return 1
    fi
    
    log "SUCCESS" "Dependencias validadas correctamente"
    return 0
}

# ==================================================================================================
# FUNCIONES DE PROCESAMIENTO DE ARGUMENTOS
# ==================================================================================================

show_help() {
    cat << EOF
${ICON_INFO} ${BOLD}${SCRIPT_NAME} v${SCRIPT_VERSION}${NC}
${BOLD}Uso:${NC} ${SCRIPT_NAME} [OPCIONES]

${YELLOW}${BOLD}OPCIONES PRINCIPALES:${NC}
  ${GREEN}--action ACTION${NC}          Acción a realizar (requerido)
  ${GREEN}--profile PROFILE${NC}       Perfil de configuración (default: master)
  ${GREEN}--app-name NAME${NC}          Nombre de la imagen de la aplicación
  ${GREEN}--app-version VERSION${NC}    Versión de la aplicación
  ${GREEN}--container-name NAME${NC}    Nombre del contenedor
  ${GREEN}--k8s-namespace NS${NC}       Namespace de Kubernetes
  ${GREEN}--host-port PORT${NC}         Puerto del host
  ${GREEN}--argocd-path PATH${NC}       Ruta para ArgoCD
  ${GREEN}--container-engine ENGINE${NC} Motor de contenedores (docker|podman)

${YELLOW}${BOLD}OPCIONES DE CONTROL:${NC}
  ${GREEN}--verbose, -v${NC}            Modo verboso (debug)
  ${GREEN}--dry-run${NC}                Mostrar comandos sin ejecutar
  ${GREEN}--force${NC}                  Forzar ejecución sin confirmaciones
  ${GREEN}--quiet, -q${NC}              Modo silencioso (solo errores)
  ${GREEN}--help, -h${NC}               Mostrar esta ayuda

${YELLOW}${BOLD}ACCIONES DISPONIBLES:${NC}
  ${CYAN}version${NC}                  ${ICON_INFO} Mostrar información de versión
  ${CYAN}build${NC}                    ${ICON_BUILD} Construir la aplicación
  ${CYAN}test${NC}                     ${ICON_BUILD} Ejecutar pruebas
  ${CYAN}publish${NC}                  ${ICON_PACKAGE} Publicar imagen en registry
  ${CYAN}k8s-run${NC}                  ${ICON_K8S} Ejecutar en Kubernetes
  ${CYAN}k8s-remove${NC}               ${ICON_K8S} Remover de Kubernetes
  ${CYAN}k8s-restart${NC}              ${ICON_K8S} Reiniciar pods en Kubernetes
  ${CYAN}k8s-tail${NC}                 ${ICON_LOG} Ver logs de Kubernetes
  ${CYAN}k8s-events${NC}               ${ICON_LOG} Ver eventos de Kubernetes
  ${CYAN}export-yaml${NC}              ${ICON_PACKAGE} Exportar YAML para ArgoCD
  ${CYAN}container-run${NC}            ${ICON_DOCKER} Ejecutar contenedor localmente
  ${CYAN}container-stop${NC}           ${ICON_DOCKER} Detener contenedor local
  ${CYAN}container-remove${NC}         ${ICON_DOCKER} Remover contenedor local
  ${CYAN}container-logs${NC}           ${ICON_LOG} Ver logs de contenedor local
  ${CYAN}container-restart${NC}        ${ICON_DOCKER} Reiniciar contenedor local

${YELLOW}${BOLD}EJEMPLOS:${NC}
  ${SCRIPT_NAME} --action version
  ${SCRIPT_NAME} --action build --app-name geniarh-frontend-v2 --app-version 1.2.3
  ${SCRIPT_NAME} --action k8s-run --branch develop --host-port 8080
  ${SCRIPT_NAME} --action container-run --app-name geniarh-frontend-v2 --app-version latest --container-name geniarh-dev
  ${SCRIPT_NAME} --container-engine podman --action publish --dry-run

${YELLOW}${BOLD}ARCHIVOS DE CONFIGURACIÓN:${NC}
  utils/env/\${BRANCH}.env          Variables de entorno por rama
  ${LOG_FILE}                        Log de ejecuciones

Para más información: https://tomd.xyz/camel-maven/
EOF
}

parse_arguments() {
    log "DEBUG" "Procesando argumentos: $*"
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --help|-h)
                show_help
                exit 0
                ;;
            --action)
                CONFIG[action]=$(validate_param_value "action" "$1" "$2" "[version|build|test|publish|k8s-run|k8s-remove|k8s-restart|k8s-tail|k8s-events|export-yaml|container-run|container-stop|container-remove|container-logs|container-restart]")
                shift 2
                ;;
            --profile)
                CONFIG[profile]=$(validate_param_value "profile" "$1" "$2" "[master|develop|otro_perfil]")
                shift 2
                ;;
            --app-name)
                CONFIG[app_image]=$(validate_param_value "app-name" "$1" "$2" "nombre_imagen")
                shift 2
                ;;
            --app-version)
                CONFIG[app_version]=$(validate_param_value "app-version" "$1" "$2" "version")
                shift 2
                ;;
            --container-name)
                CONFIG[app_container]=$(validate_param_value "container-name" "$1" "$2" "nombre_contenedor")
                shift 2
                ;;
            --k8s-namespace)
                CONFIG[k8s_namespace]=$(validate_param_value "k8s-namespace" "$1" "$2" "namespace")
                shift 2
                ;;
            --host-port)
                local port_value=$(validate_param_value "host-port" "$1" "$2" "puerto")
                if [[ ! "$port_value" =~ ^[0-9]+$ ]] || [[ "$port_value" -lt 1 ]] || [[ "$port_value" -gt 65535 ]]; then
                    log "ERROR" "Puerto debe ser un número entre 1-65535"
                    exit 1
                fi
                CONFIG[host_port]="$port_value"
                shift 2
                ;;
            --argocd-path)
                CONFIG[argocd_path]=$(validate_param_value "argocd-path" "$1" "$2" "ruta")
                shift 2
                ;;
            --container-engine)
                local engine_value=$(validate_param_value "container-engine" "$1" "$2" "[docker|podman]")
                validate_param_option "container-engine" "$engine_value" "docker podman"
                CONFIG[container_engine]="$engine_value"
                shift 2
                ;;
            --verbose|-v)
                CONFIG[verbose]=true
                shift
                ;;
            --dry-run)
                CONFIG[dry_run]=true
                shift
                ;;
            --force)
                CONFIG[force]=true
                shift
                ;;
            --quiet|-q)
                CONFIG[quiet]=true
                shift
                ;;
            -*)
                log "WARNING" "Opción desconocida: $1"
                shift
                ;;
            *)
                log "WARNING" "Argumento no reconocido: $1"
                shift
                ;;
        esac
    done
    
    # Validar acción requerida
    if [[ -z "${CONFIG[action]}" ]]; then
        log "ERROR" "La opción --action es requerida"
        echo
        show_help
        exit 1
    fi
}

# ==================================================================================================
# FUNCIONES DE ACCIONES PRINCIPALES
# ==================================================================================================

action_version() {
    log "INFO" "Obteniendo información de versión..."
    local build_script="${script_dir}/utils/build.sh"
    check_script_exists "${build_script}" "Script de build" || return 1
    execute_with_retry "${build_script} --action version" "Obtención de versión"
}

action_build() {
    log "INFO" "Iniciando construcción de ${CONFIG[app_image]}:${CONFIG[app_version]}..."
    local build_script="${script_dir}/utils/build.sh"
    check_script_exists "${build_script}" "Script de build" || return 1
    
    execute_with_retry \
        "${build_script} --app-image '${CONFIG[app_image]}' --app-version '${CONFIG[app_version]}' --branch '${CONFIG[profile]}'" \
        "Construcción de aplicación"
}

action_test() {
    log "INFO" "Iniciando pruebas de ${CONFIG[app_image]}..."
    local build_script="${script_dir}/utils/build.sh"
    check_script_exists "${build_script}" "Script de build" || return 1
    
    execute_with_retry \
        "${build_script} --action test --branch '${CONFIG[profile]}'" \
        "Ejecución de pruebas"
}

action_publish() {
    log "INFO" "Publicando ${CONFIG[app_image]}:${CONFIG[app_version]}..."
    local registry_script="${script_dir}/utils/registry.sh"
    check_script_exists "${registry_script}" "Script de registry" || return 1
    
    # Login al registry
    execute_with_retry \
        "${registry_script} --branch '${CONFIG[profile]}' --action login" \
        "Autenticación en registry" || return 1
    
    # Push de imagen
    execute_with_retry \
        "${registry_script} --branch '${CONFIG[profile]}' --app-name '${CONFIG[app_image]}' --app-version '${CONFIG[app_version]}' --action push" \
        "Push de imagen"
}

action_k8s_run() {
    log "INFO" "Desplegando en Kubernetes (puerto: ${CONFIG[host_port]})..."
    local k8s_script="${script_dir}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[profile]}' --k8s-host-port '${CONFIG[host_port]}' --action run" \
        "Deployment en Kubernetes"
}

action_k8s_remove() {
    log "INFO" "Removiendo de Kubernetes..."
    if [[ "${CONFIG[force]}" != true ]]; then
        read -p "¿Confirmas la remoción de la aplicación de Kubernetes? (y/N): " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && { log "INFO" "Operación cancelada"; return 0; }
    fi
    
    local k8s_script="${script_dir}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[profile]}' --action remove" \
        "Remoción de Kubernetes"
}

action_k8s_restart() {
    log "INFO" "Reiniciando pods..."
    local k8s_script="${script_dir}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[profile]}' --action restart" \
        "Reinicio de pods"
}

action_k8s_tail() {
    log "INFO" "Siguiendo logs de Kubernetes (Ctrl+C para salir)..."
    local k8s_script="${script_dir}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    if [[ "${CONFIG[dry_run]}" == true ]]; then
        log "INFO" "[DRY RUN] ${k8s_script} --branch '${CONFIG[profile]}' --action tail"
        return 0
    fi
    
        "${k8s_script}" --branch "${CONFIG[profile]}" --action tail
}

action_k8s_events() {
    log "INFO" "Obteniendo eventos de Kubernetes..."
    local k8s_script="${script_dir}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[profile]}' --action events" \
        "Obtención de eventos"
}

action_export_yaml() {
    log "INFO" "Exportando YAML para ArgoCD..."
    local k8s_script="${script_dir}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[profile]}' --action export-yaml --argocd-path '${CONFIG[argocd_path]}'" \
        "Exportación de YAML"
}

# ==================================================================================================
# FUNCIONES DE CONTENEDORES LOCALES
# ==================================================================================================

action_container_run() {
    log "INFO" "Ejecutando contenedor ${CONFIG[app_container]}..."
    
    local image_tag="${CONFIG[app_image]}:${CONFIG[app_version]}"
    local env_file="${script_dir}/k8s/secret/${CONFIG[profile]}.env"
    local host_port="${CONFIG[host_port]:-8080}"
    
    # Verificar si el contenedor ya existe
    if container_cmd ps -a --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log "WARNING" "Contenedor '${CONFIG[app_container]}' ya existe"
        if [[ "${CONFIG[force]}" != true ]]; then
            read -p "¿Remover contenedor existente? (y/N): " -n 1 -r
            echo
            [[ ! $REPLY =~ ^[Yy]$ ]] && { log "INFO" "Operación cancelada"; return 0; }
        fi
        action_container_remove || return 1
    fi
    
    # Construir comando de ejecución
    local -a run_args=(
        "run" "-d"
        "--name" "${CONFIG[app_container]}"
        "--restart" "unless-stopped"
        "-p" "${host_port}:80"
    )
    
    # Añadir archivo de variables de entorno si existe
    if [[ -f "${env_file}" ]]; then
        run_args+=("--env-file=${env_file}")
        log "INFO" "Usando variables de entorno: ${env_file}"
    else
        log "WARNING" "Variables de entorno no encontradas: ${env_file}"
    fi
    
    run_args+=("${image_tag}")
    
    execute_with_retry \
        "container_cmd ${run_args[*]}" \
        "Ejecución de contenedor ${CONFIG[app_container]}"
}

action_container_stop() {
    log "INFO" "Deteniendo contenedor ${CONFIG[app_container]}..."
    
    if ! container_cmd ps --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log "WARNING" "Contenedor '${CONFIG[app_container]}' no está ejecutándose"
        return 0
    fi
    
    execute_with_retry \
        "container_cmd stop '${CONFIG[app_container]}'" \
        "Detención de contenedor"
}

action_container_remove() {
    log "INFO" "Removiendo contenedor ${CONFIG[app_container]}..."
    
    # Detener si está ejecutándose
    if container_cmd ps --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        action_container_stop || log "WARNING" "No se pudo detener el contenedor"
    fi
    
    # Verificar si existe antes de remover
    if ! container_cmd ps -a --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log "WARNING" "Contenedor '${CONFIG[app_container]}' no existe"
        return 0
    fi
    
    execute_with_retry \
        "container_cmd rm '${CONFIG[app_container]}'" \
        "Remoción de contenedor"
}

action_container_logs() {
    log "INFO" "Mostrando logs de ${CONFIG[app_container]} (Ctrl+C para salir)..."
    
    if ! container_cmd ps -a --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log "ERROR" "Contenedor '${CONFIG[app_container]}' no existe"
        return 1
    fi
    
    if [[ "${CONFIG[dry_run]}" == true ]]; then
        log "INFO" "[DRY RUN] ${CONFIG[container_engine]} logs -f '${CONFIG[app_container]}'"
        return 0
    fi
    
    container_cmd logs -f "${CONFIG[app_container]}"
}

action_container_restart() {
    log "INFO" "Reiniciando contenedor ${CONFIG[app_container]}..."
    
    if ! container_cmd ps -a --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log "ERROR" "Contenedor '${CONFIG[app_container]}' no existe"
        return 1
    fi
    
    execute_with_retry \
        "container_cmd restart '${CONFIG[app_container]}'" \
        "Reinicio de contenedor"
}

# ==================================================================================================
# FUNCIÓN DE EJECUCIÓN PRINCIPAL
# ==================================================================================================

execute_action() {
    log "INFO" "Ejecutando: ${CONFIG[action]}"
    
    case "${CONFIG[action]}" in
        "version")              action_version ;;
        "build")                action_build ;;
        "test")                 action_test ;;
        "publish")              action_publish ;;
        "k8s-run")              action_k8s_run ;;
        "k8s-remove")           action_k8s_remove ;;
        "k8s-restart")          action_k8s_restart ;;
        "k8s-tail")             action_k8s_tail ;;
        "k8s-events")           action_k8s_events ;;
        "export-yaml")          action_export_yaml ;;
        "container-run")        action_container_run ;;
        "container-stop")       action_container_stop ;;
        "container-remove")     action_container_remove ;;
        "container-logs")       action_container_logs ;;
        "container-restart")    action_container_restart ;;
        *)
            log "ERROR" "Acción no reconocida: ${CONFIG[action]}"
            echo
            log "INFO" "Acciones disponibles:"
            echo "  ${CYAN}Build/Test:${NC} version, build, test, publish"
            echo "  ${CYAN}Kubernetes:${NC} k8s-run, k8s-remove, k8s-restart, k8s-tail, k8s-events, export-yaml"
            echo "  ${CYAN}Contenedores:${NC} container-run, container-stop, container-remove, container-logs, container-restart"
            echo
            echo "Usa '${SCRIPT_NAME} --help' para más información"
            return 1
            ;;
    esac
}

# ==================================================================================================
# FUNCIONES DE INTERFAZ Y RESUMEN
# ==================================================================================================

print_banner() {
    if [[ "${CONFIG[quiet]}" == true ]]; then
        return 0
    fi
    
    if [[ "${COLOR_SUPPORT}" == true ]]; then
        echo -e "${PURPLE}${BOLD}"
    fi
    
    cat << 'EOF'
 ╔═════════════════════════════════════════════════════════╗
 ║            🚀 GENIA-HR FRONTEND DEPLOYMENT 🚀            ║
 ║              Gestión automatizada de frontend              ║
 ║                     Versión Optimizada                    ║
 ╚═════════════════════════════════════════════════════════╝
EOF
    
    if [[ "${COLOR_SUPPORT}" == true ]]; then
        echo -e "${NC}"
    fi
}

print_separator() {
    [[ "${CONFIG[quiet]}" == true ]] && return 0
    
    if [[ "${COLOR_SUPPORT}" == true ]]; then
        echo -e "${GRAY}═════════════════════════════════════════════════════════${NC}"
    else
        echo "==========================================================="
    fi
}

show_config_summary() {
    [[ "${CONFIG[verbose]}" != true ]] && return 0
    
    log "INFO" "Resumen de configuración:"
    local -a config_items=(
        "Acción:${CONFIG[action]}"
        "Rama:${ICON_GIT} ${CONFIG[profile]}"
        "Motor:${ICON_DOCKER} ${CONFIG[container_engine]}"
        "Imagen:${CONFIG[app_image]}"
        "Versión:${CONFIG[app_version]}"
        "Contenedor:${CONFIG[app_container]}"
        "Puerto:${CONFIG[host_port]}"
        "ArgoCD Path:${CONFIG[argocd_path]}"
    )
    
    for item in "${config_items[@]}"; do
        local key="${item%%:*}"
        local value="${item#*:}"
        [[ -n "${value// /}" ]] && log "INFO" "  ${key}: ${value}"
    done
}

# ==================================================================================================
# FUNCIONES DE LIMPIEZA Y MANEJO DE ERRORES
# ==================================================================================================

cleanup() {
    local exit_code=$?
    
    # Limpiar archivos temporales si los hay
    if [[ ${#CLEANUP_FILES[@]} -gt 0 ]]; then
        log "DEBUG" "Limpiando archivos temporales..."
        for file in "${CLEANUP_FILES[@]}"; do
            [[ -f "${file}" ]] && rm -f "${file}"
        done
    fi
    
    # Log final según el resultado
    if [[ ${exit_code} -eq 0 ]]; then
        [[ "${CONFIG[quiet]}" != true ]] && log "SUCCESS" "Script completado exitosamente"
    else
        log "ERROR" "Script terminado con errores (código: ${exit_code})"
        log "INFO" "Revisa el log para más detalles: ${LOG_FILE}"
    fi
    
    exit ${exit_code}
}

handle_interrupt() {
    log "WARNING" "Interrupción recibida (Ctrl+C)"
    log "INFO" "Ejecutando limpieza..."
    exit 130
}

# Configurar traps
trap cleanup EXIT
trap handle_interrupt INT TERM

# ==================================================================================================
# FUNCIÓN MAIN OPTIMIZADA
# ==================================================================================================

main() {
    local start_time
    start_time="$(date +%s)"
    
    # Banner e inicialización
    print_banner
    [[ "${CONFIG[quiet]}" != true ]] && {
        log "INFO" "Iniciando ${SCRIPT_NAME} v${SCRIPT_VERSION}"
        log "INFO" "Directorio: ${script_dir}"
        log "INFO" "Proyecto: ${project_dir}"
        log "INFO" "Log: ${LOG_FILE}"
    }
    
    # Procesamiento de argumentos
    parse_arguments "$@"
    
    # Carga de configuración
    load_env_config || log "DEBUG" "Configuración de entorno no disponible"
    apply_env_defaults
    
    # Actualizar CONFIG con valores procesados
    CONFIG[app_image]="${P_APP_IMAGE}"
    CONFIG[app_version]="${P_APP_VERSION}"
    CONFIG[app_container]="${P_APP_CONTAINER}"
    CONFIG[host_port]="${P_HOST_PORT}"
    CONFIG[k8s_namespace]="${P_K8S_NAMESPACE}"
    CONFIG[argocd_path]="${P_ARGOCD_PATH}"
    CONFIG[profile]="${P_PROFILE}"
    CONFIG[profile]="${P_PROFILE}"
    
    # Mostrar configuración en modo verbose
    show_config_summary
    
    # Validaciones
    validate_dependencies || exit 1
    validate_config || exit 1
    
    # Separador visual
    [[ "${CONFIG[quiet]}" != true ]] && print_separator
    
    # Ejecución de la acción principal
    if execute_action; then
        local end_time duration
        end_time="$(date +%s)"
        duration=$((end_time - start_time))
        
        if [[ "${CONFIG[quiet]}" != true ]]; then
            print_separator
            log "SUCCESS" "Operación completada ${ICON_ROCKET}"
            log "INFO" "${ICON_TIME} Duración: ${duration}s"
            log "INFO" "${ICON_TIME} Finalizado: $(date)"
        fi
        
        EXIT_CODE=0
    else
        log "ERROR" "La operación falló"
        EXIT_CODE=1
    fi
    
    return ${EXIT_CODE}
}

# ==================================================================================================
# PUNTO DE ENTRADA
# ==================================================================================================

# Solo ejecutar main si el script es llamado directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi