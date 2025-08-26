#!/bin/bash
# =============================================================================
# DEPLOYMENT AUTOMATION SCRIPT - VERSIÓN OPTIMIZADA
# =============================================================================
# Descripción: Script automatizado para gestión de builds, deployments y contenedores
# Basado en: https://tomd.xyz/camel-maven/
# Versión: 3.0.0 - Optimización completa del script original
# =============================================================================

#set -euo pipefail  # Modo estricto mejorado
IFS=$'\n\t'        # Separador de campos seguro

# =============================================================================
# CONFIGURACIÓN GLOBAL
# =============================================================================

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
readonly SCRIPT_VERSION="3.0.0"
readonly LOG_FILE="${SCRIPT_DIR}/deployment.log"

# Configuración de timeouts y reintentos
readonly DEFAULT_TIMEOUT=300
readonly MAX_RETRY_ATTEMPTS=3
readonly RETRY_DELAY=2

# =============================================================================
# CONFIGURACIÓN DE COLORES E ICONOS
# =============================================================================

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

# =============================================================================
# VARIABLES GLOBALES OPTIMIZADAS
# =============================================================================

declare -A CONFIG=(
    [action]=""
    [branch]="master"
    [app_image]=""
    [app_version]=""
    [app_container]=""
    [k8s_namespace]=""
    [host_port]=""
    [argocd_path]=""
    [container_engine]=""
    [verbose]=false
    [dry_run]=false
    [force]=false
    [quiet]=false
)

declare -A ENV_CONFIG=()
declare -A CONTAINER_ENGINE_INFO=()
declare -a CLEANUP_FILES=()
declare -i EXIT_CODE=0

# =============================================================================
# FUNCIONES DE LOGGING MEJORADAS
# =============================================================================

_log_message() {
    local level="$1" message="$2" icon="$3" color="$4"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    
    # Log a archivo siempre (rotación automática si es muy grande)
    if [[ -f "${LOG_FILE}" ]] && [[ $(stat -f%z "${LOG_FILE}" 2>/dev/null || stat -c%s "${LOG_FILE}" 2>/dev/null || echo 0) -gt 10485760 ]]; then
        mv "${LOG_FILE}" "${LOG_FILE}.old"
    fi
    echo "[${timestamp}] [${level}] ${message}" >> "${LOG_FILE}"
    
    # Log a consola solo si no está en modo quiet
    [[ "${CONFIG[quiet]}" == true ]] && [[ "${level}" != "ERROR" ]] && return 0
    
    if [[ "${COLOR_SUPPORT}" == true ]]; then
        echo -e "${color}${icon} [${level}]${NC} ${WHITE}${message}${NC}"
    else
        echo "${icon} [${level}] ${message}"
    fi
}

log_info() { _log_message "INFO" "$1" "${ICON_INFO}" "${BLUE}"; }
log_success() { _log_message "SUCCESS" "$1" "${ICON_SUCCESS}" "${GREEN}"; }
log_warning() { _log_message "WARNING" "$1" "${ICON_WARNING}" "${YELLOW}"; }
log_error() { _log_message "ERROR" "$1" "${ICON_ERROR}" "${RED}"; }
log_action() { _log_message "ACTION" "$1" "${ICON_GEAR}" "${PURPLE}"; }
log_build() { _log_message "BUILD" "$1" "${ICON_BUILD}" "${CYAN}"; }
log_deploy() { _log_message "DEPLOY" "$1" "${ICON_DEPLOY}" "${GREEN}"; }
log_docker() { _log_message "DOCKER" "$1" "${ICON_DOCKER}" "${BLUE}"; }
log_k8s() { _log_message "K8S" "$1" "${ICON_K8S}" "${CYAN}"; }
log_config() { _log_message "CONFIG" "$1" "${ICON_CONFIG}" "${PURPLE}"; }

log_debug() {
    [[ "${CONFIG[verbose]}" == true ]] && _log_message "DEBUG" "$1" "🐛" "${GRAY}"
}

# =============================================================================
# FUNCIONES DE DETECCIÓN DE MOTOR DE CONTENEDORES
# =============================================================================

detect_container_engine() {
    log_info "Detectando motor de contenedores..."
    
    # Si ya está configurado, validarlo
    if [[ -n "${CONFIG[container_engine]}" ]]; then
        if validate_container_engine "${CONFIG[container_engine]}"; then
            log_success "Motor configurado: ${CONFIG[container_engine]}"
            return 0
        else
            log_warning "Motor configurado no funcional: ${CONFIG[container_engine]}"
        fi
    fi
    
    # Auto-detección (Podman primero por mejor seguridad)
    local -a engines=("podman" "docker")
    for engine in "${engines[@]}"; do
        if command -v "${engine}" >/dev/null 2>&1 && validate_container_engine "${engine}"; then
            CONFIG[container_engine]="${engine}"
            get_container_engine_info "${engine}"
            log_success "Motor detectado: ${GREEN}${engine}${NC} v${CONTAINER_ENGINE_INFO[version]}"
            return 0
        fi
    done
    
    log_error "No hay motores de contenedores funcionales (docker/podman)"
    return 1
}

validate_container_engine() {
    local engine="$1"
    log_debug "Validando motor: ${engine}"
    
    case "${engine}" in
        "docker")
            if docker version >/dev/null 2>&1; then
                return 0
            else
                log_warning "Docker no está ejecutándose. Intenta: sudo systemctl start docker"
                return 1
            fi
            ;;
        "podman")
            if podman version >/dev/null 2>&1; then
                return 0
            else
                log_warning "Podman no está funcionando correctamente"
                return 1
            fi
            ;;
        *)
            log_error "Motor no soportado: ${engine}"
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
    log_debug "Ejecutando: ${engine} $*"
    
    if [[ "${CONFIG[dry_run]}" == true ]]; then
        log_info "[DRY RUN] ${engine} $*"
        return 0
    fi
    
    "${engine}" "$@"
}

# =============================================================================
# FUNCIONES DE VALIDACIÓN Y CONFIGURACIÓN
# =============================================================================

validate_dependencies() {
    log_info "Validando dependencias del sistema..."
    
    # Detectar motor de contenedores
    detect_container_engine || return 1
    
    # Validar kubectl solo si se usan acciones de K8s
    if [[ "${CONFIG[action]}" =~ ^k8s- ]] && ! command -v kubectl >/dev/null 2>&1; then
        log_error "kubectl es requerido para acciones de Kubernetes"
        return 1
    fi
    
    log_success "Dependencias validadas correctamente"
    return 0
}

load_env_config() {
    local env_file="${SCRIPT_DIR}/utils/env/${CONFIG[branch]}.env"
    
    log_config "Cargando configuración: ${env_file}"
    
    if [[ ! -f "${env_file}" ]]; then
        log_warning "Archivo de configuración no encontrado: ${env_file}"
        return 1
    fi
    
    # Carga segura de variables
    local line_count=0
    while IFS='=' read -r key value || [[ -n "${key}" ]]; do
        ((line_count++))
        
        # Ignorar comentarios y líneas vacías
        [[ "${key}" =~ ^[[:space:]]*# ]] && continue
        [[ -z "${key// /}" ]] && continue
        
        # Sanitizar key y value
        key="${key// /}"
        value="${value%\"}" value="${value#\"}"
        value="${value%\'}" value="${value#\'}"
        
        if [[ "${key}" =~ ^[A-Z_][A-Z0-9_]*$ ]]; then
            ENV_CONFIG["${key}"]="${value}"
            log_debug "Cargada: ${key}=${value}"
        else
            log_warning "Variable inválida en línea ${line_count}: ${key}"
        fi
    done < "${env_file}"
    
    log_success "Configuración cargada: ${#ENV_CONFIG[@]} variables"
    return 0
}

apply_env_defaults() {
    log_config "Aplicando valores por defecto..."
    
    # Mapeo inteligente de variables
    local -A mappings=(
        [app_image]="ENV_APP_IMAGE"
        [app_version]="ENV_APP_VERSION"
        [app_container]="ENV_APP_CONTAINER"
        [host_port]="ENV_HOST_PORT"
        [container_engine]="ENV_CONTAINER_ENGINE"
    )
    
    for config_key in "${!mappings[@]}"; do
        local env_key="${mappings[${config_key}]}"
        if [[ -z "${CONFIG[${config_key}]}" ]] && [[ -n "${ENV_CONFIG[${env_key}]:-}" ]]; then
            CONFIG["${config_key}"]="${ENV_CONFIG[${env_key}]}"
            log_debug "Aplicado: ${config_key}=${CONFIG[${config_key}]}"
        fi
    done
    
    # Configurar NEXUS_PASSWORD globalmente si existe
    [[ -n "${ENV_CONFIG[ENV_NEXUS_PASSWORD]:-}" ]] && export NEXUS_PASSWORD="${ENV_CONFIG[ENV_NEXUS_PASSWORD]}"
}

validate_config() {
    log_info "Validando configuración..."
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
        log_error "Errores de validación:"
        printf '%s\n' "${errors[@]}" | while read -r error; do
            log_error "  - ${error}"
        done
        return 1
    fi
    
    log_success "Configuración válida"
    return 0
}

# =============================================================================
# FUNCIONES DE UTILIDAD
# =============================================================================

execute_with_retry() {
    local command="$1"
    local description="$2"
    local attempt=1
    
    log_action "${description}..."
    
    while [[ ${attempt} -le ${MAX_RETRY_ATTEMPTS} ]]; do
        log_debug "Intento ${attempt}/${MAX_RETRY_ATTEMPTS}: ${command}"
        
        if [[ "${CONFIG[dry_run]}" == true ]]; then
            log_info "[DRY RUN] ${command}"
            return 0
        fi
        
        if eval "${command}"; then
            log_success "${description} completado"
            return 0
        else
            local exit_code=$?
            log_warning "${description} falló (intento ${attempt}/${MAX_RETRY_ATTEMPTS})"
            
            if [[ ${attempt} -lt ${MAX_RETRY_ATTEMPTS} ]]; then
                log_info "Reintentando en ${RETRY_DELAY}s..."
                sleep ${RETRY_DELAY}
            fi
            ((attempt++))
        fi
    done
    
    log_error "${description} falló después de ${MAX_RETRY_ATTEMPTS} intentos"
    return 1
}

check_script_exists() {
    local script="$1"
    local description="$2"
    
    if [[ ! -f "${script}" ]]; then
        log_error "${description} no encontrado: ${script}"
        return 1
    fi
    
    if [[ ! -x "${script}" ]]; then
        log_warning "${description} no tiene permisos de ejecución: ${script}"
        chmod +x "${script}" 2>/dev/null || {
            log_error "No se pueden otorgar permisos de ejecución a: ${script}"
            return 1
        }
        log_info "Permisos de ejecución otorgados a: ${script}"
    fi
    
    return 0
}

# =============================================================================
# FUNCIONES DE PROCESAMIENTO DE ARGUMENTOS
# =============================================================================

show_help() {
    cat << EOF
${ICON_INFO} ${BOLD}${SCRIPT_NAME} v${SCRIPT_VERSION}${NC}
${BOLD}Uso:${NC} ${SCRIPT_NAME} [OPCIONES]

${YELLOW}${BOLD}OPCIONES PRINCIPALES:${NC}
  ${GREEN}--action ACTION${NC}          Acción a realizar (requerido)
  ${GREEN}--branch BRANCH${NC}          Rama del repositorio (default: master)
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
  ${SCRIPT_NAME} --action build --app-name myapp --app-version 1.2.3
  ${SCRIPT_NAME} --action k8s-run --branch develop --host-port 8080
  ${SCRIPT_NAME} --action container-run --app-name myapp --app-version latest --container-name myapp-dev
  ${SCRIPT_NAME} --container-engine podman --action publish --dry-run

${YELLOW}${BOLD}ARCHIVOS DE CONFIGURACIÓN:${NC}
  utils/env/\${BRANCH}.env          Variables de entorno por rama
  ${LOG_FILE}                       Log de ejecuciones

Para más información: https://tomd.xyz/camel-maven/
EOF
}

parse_arguments() {
    log_debug "Procesando argumentos: $*"
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --help|-h)
                show_help
                exit 0
                ;;
            --action)
                [[ -z "${2:-}" ]] && { log_error "Valor requerido para --action"; exit 1; }
                CONFIG[action]="$2"
                shift 2
                ;;
            --branch)
                [[ -z "${2:-}" ]] && { log_error "Valor requerido para --branch"; exit 1; }
                CONFIG[branch]="$2"
                shift 2
                ;;
            --app-name)
                [[ -z "${2:-}" ]] && { log_error "Valor requerido para --app-name"; exit 1; }
                CONFIG[app_image]="$2"
                shift 2
                ;;
            --app-version)
                [[ -z "${2:-}" ]] && { log_error "Valor requerido para --app-version"; exit 1; }
                CONFIG[app_version]="$2"
                shift 2
                ;;
            --container-name)
                [[ -z "${2:-}" ]] && { log_error "Valor requerido para --container-name"; exit 1; }
                CONFIG[app_container]="$2"
                shift 2
                ;;
            --k8s-namespace)
                [[ -z "${2:-}" ]] && { log_error "Valor requerido para --k8s-namespace"; exit 1; }
                CONFIG[k8s_namespace]="$2"
                shift 2
                ;;
            --host-port)
                [[ -z "${2:-}" ]] && { log_error "Valor requerido para --host-port"; exit 1; }
                if [[ ! "$2" =~ ^[0-9]+$ ]] || [[ "$2" -lt 1 ]] || [[ "$2" -gt 65535 ]]; then
                    log_error "Puerto debe ser un número entre 1-65535"
                    exit 1
                fi
                CONFIG[host_port]="$2"
                shift 2
                ;;
            --argocd-path)
                [[ -z "${2:-}" ]] && { log_error "Valor requerido para --argocd-path"; exit 1; }
                CONFIG[argocd_path]="$2"
                shift 2
                ;;
            --container-engine)
                [[ -z "${2:-}" ]] && { log_error "Valor requerido para --container-engine"; exit 1; }
                if [[ "$2" != "docker" && "$2" != "podman" ]]; then
                    log_error "Motor debe ser 'docker' o 'podman'"
                    exit 1
                fi
                CONFIG[container_engine]="$2"
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
                log_warning "Opción desconocida: $1"
                shift
                ;;
            *)
                log_warning "Argumento no reconocido: $1"
                shift
                ;;
        esac
    done
    
    # Validar acción requerida
    if [[ -z "${CONFIG[action]}" ]]; then
        log_error "La opción --action es requerida"
        echo
        show_help
        exit 1
    fi
}

# =============================================================================
# FUNCIONES DE ACCIONES PRINCIPALES
# =============================================================================

action_version() {
    log_info "Obteniendo información de versión..."
    local build_script="${SCRIPT_DIR}/utils/build.sh"
    check_script_exists "${build_script}" "Script de build" || return 1
    execute_with_retry "${build_script} --action version" "Obtención de versión"
}

action_build() {
    log_build "Iniciando construcción de ${CONFIG[app_image]}:${CONFIG[app_version]}..."
    local build_script="${SCRIPT_DIR}/utils/build.sh"
    check_script_exists "${build_script}" "Script de build" || return 1
    
    execute_with_retry \
        "${build_script} --app-image '${CONFIG[app_image]}' --app-version '${CONFIG[app_version]}' --branch '${CONFIG[branch]}'" \
        "Construcción de aplicación"
}

action_publish() {
    log_deploy "Publicando ${CONFIG[app_image]}:${CONFIG[app_version]}..."
    local registry_script="${SCRIPT_DIR}/utils/registry.sh"
    check_script_exists "${registry_script}" "Script de registry" || return 1
    
    # Login al registry
    execute_with_retry \
        "${registry_script} --branch '${CONFIG[branch]}' --action login" \
        "Autenticación en registry" || return 1
    
    # Push de imagen
    execute_with_retry \
        "${registry_script} --branch '${CONFIG[branch]}' --app-name '${CONFIG[app_image]}' --app-version '${CONFIG[app_version]}' --action push" \
        "Push de imagen"
}

action_k8s_run() {
    log_k8s "Desplegando en Kubernetes (puerto: ${CONFIG[host_port]})..."
    local k8s_script="${SCRIPT_DIR}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[branch]}' --k8s-host-port '${CONFIG[host_port]}' --action run" \
        "Deployment en Kubernetes"
}

action_k8s_remove() {
    log_k8s "Removiendo de Kubernetes..."
    if [[ "${CONFIG[force]}" != true ]]; then
        read -p "¿Confirmas la remoción de la aplicación de Kubernetes? (y/N): " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && { log_info "Operación cancelada"; return 0; }
    fi
    
    local k8s_script="${SCRIPT_DIR}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[branch]}' --action remove" \
        "Remoción de Kubernetes"
}

action_k8s_restart() {
    log_k8s "Reiniciando pods..."
    local k8s_script="${SCRIPT_DIR}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[branch]}' --action restart" \
        "Reinicio de pods"
}

action_k8s_tail() {
    log_k8s "Siguiendo logs de Kubernetes (Ctrl+C para salir)..."
    local k8s_script="${SCRIPT_DIR}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    if [[ "${CONFIG[dry_run]}" == true ]]; then
        log_info "[DRY RUN] ${k8s_script} --branch '${CONFIG[branch]}' --action tail"
        return 0
    fi
    
    "${k8s_script}" --branch "${CONFIG[branch]}" --action tail
}

action_k8s_events() {
    log_k8s "Obteniendo eventos de Kubernetes..."
    local k8s_script="${SCRIPT_DIR}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[branch]}' --action events" \
        "Obtención de eventos"
}

action_export_yaml() {
    log_k8s "Exportando YAML para ArgoCD..."
    local k8s_script="${SCRIPT_DIR}/utils/k8s.sh"
    check_script_exists "${k8s_script}" "Script de K8s" || return 1
    
    execute_with_retry \
        "${k8s_script} --branch '${CONFIG[branch]}' --action export-yaml --argocd-path '${CONFIG[argocd_path]}'" \
        "Exportación de YAML"
}

# =============================================================================
# FUNCIONES DE CONTENEDORES LOCALES
# =============================================================================

action_container_run() {
    log_docker "Ejecutando contenedor ${CONFIG[app_container]}..."
    
    local image_tag="${CONFIG[app_image]}:${CONFIG[app_version]}"
    local env_file="${SCRIPT_DIR}/k8s/secret/${CONFIG[branch]}.env"
    local host_port="${CONFIG[host_port]:-8080}"
    
    # Verificar si el contenedor ya existe
    if container_cmd ps -a --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log_warning "Contenedor '${CONFIG[app_container]}' ya existe"
        if [[ "${CONFIG[force]}" != true ]]; then
            read -p "¿Remover contenedor existente? (y/N): " -n 1 -r
            echo
            [[ ! $REPLY =~ ^[Yy]$ ]] && { log_info "Operación cancelada"; return 0; }
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
        log_info "Usando variables de entorno: ${env_file}"
    else
        log_warning "Variables de entorno no encontradas: ${env_file}"
    fi
    
    run_args+=("${image_tag}")
    
    execute_with_retry \
        "container_cmd ${run_args[*]}" \
        "Ejecución de contenedor ${CONFIG[app_container]}"
}

action_container_stop() {
    log_docker "Deteniendo contenedor ${CONFIG[app_container]}..."
    
    if ! container_cmd ps --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log_warning "Contenedor '${CONFIG[app_container]}' no está ejecutándose"
        return 0
    fi
    
    execute_with_retry \
        "container_cmd stop '${CONFIG[app_container]}'" \
        "Detención de contenedor"
}

action_container_remove() {
    log_docker "Removiendo contenedor ${CONFIG[app_container]}..."
    
    # Detener si está ejecutándose
    if container_cmd ps --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        action_container_stop || log_warning "No se pudo detener el contenedor"
    fi
    
    # Verificar si existe antes de remover
    if ! container_cmd ps -a --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log_warning "Contenedor '${CONFIG[app_container]}' no existe"
        return 0
    fi
    
    execute_with_retry \
        "container_cmd rm '${CONFIG[app_container]}'" \
        "Remoción de contenedor"
}

action_container_logs() {
    log_docker "Mostrando logs de ${CONFIG[app_container]} (Ctrl+C para salir)..."
    
    if ! container_cmd ps -a --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log_error "Contenedor '${CONFIG[app_container]}' no existe"
        return 1
    fi
    
    if [[ "${CONFIG[dry_run]}" == true ]]; then
        log_info "[DRY RUN] ${CONFIG[container_engine]} logs -f '${CONFIG[app_container]}'"
        return 0
    fi
    
    container_cmd logs -f "${CONFIG[app_container]}"
}

action_container_restart() {
    log_docker "Reiniciando contenedor ${CONFIG[app_container]}..."
    
    if ! container_cmd ps -a --format "{{.Names}}" | grep -q "^${CONFIG[app_container]}$"; then
        log_error "Contenedor '${CONFIG[app_container]}' no existe"
        return 1
    fi
    
    execute_with_retry \
        "container_cmd restart '${CONFIG[app_container]}'" \
        "Reinicio de contenedor"
}

# =============================================================================
# FUNCIÓN DE EJECUCIÓN PRINCIPAL
# =============================================================================

execute_action() {
    log_action "Ejecutando: ${GREEN}${CONFIG[action]}${NC}"
    
    case "${CONFIG[action]}" in
        "version")              action_version ;;
        "build")                action_build ;;
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
            log_error "Acción no reconocida: ${CONFIG[action]}"
            echo
            log_info "Acciones disponibles:"
            echo "  ${CYAN}Build/Deploy:${NC} version, build, publish"
            echo "  ${CYAN}Kubernetes:${NC} k8s-run, k8s-remove, k8s-restart, k8s-tail, k8s-events, export-yaml"
            echo "  ${CYAN}Contenedores:${NC} container-run, container-stop, container-remove, container-logs, container-restart"
            echo
            echo "Usa '${SCRIPT_NAME} --help' para más información"
            return 1
            ;;
    esac
}

# =============================================================================
# FUNCIONES DE INTERFAZ Y RESUMEN
# =============================================================================

print_banner() {
    if [[ "${CONFIG[quiet]}" == true ]]; then
        return 0
    fi
    
    if [[ "${COLOR_SUPPORT}" == true ]]; then
        echo -e "${PURPLE}${BOLD}"
    fi
    
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║                  🚀 DEPLOYMENT SCRIPT 🚀                  ║
║            Gestión automatizada de aplicaciones           ║
║                     Versión Optimizada                    ║
╚═══════════════════════════════════════════════════════════╝
EOF
    
    if [[ "${COLOR_SUPPORT}" == true ]]; then
        echo -e "${NC}"
    fi
}

print_separator() {
    [[ "${CONFIG[quiet]}" == true ]] && return 0
    
    if [[ "${COLOR_SUPPORT}" == true ]]; then
        echo -e "${GRAY}═══════════════════════════════════════════════════════════${NC}"
    else
        echo "==========================================================="
    fi
}

show_config_summary() {
    [[ "${CONFIG[verbose]}" != true ]] && return 0
    
    log_config "Resumen de configuración:"
    local -a config_items=(
        "Acción:${CONFIG[action]}"
        "Rama:${ICON_GIT} ${CONFIG[branch]}"
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
        [[ -n "${value// /}" ]] && log_info "  ${key}: ${GREEN}${value}${NC}"
    done
}

# =============================================================================
# FUNCIONES DE LIMPIEZA Y MANEJO DE ERRORES
# =============================================================================

cleanup() {
    local exit_code=$?
    
    # Limpiar archivos temporales si los hay
    if [[ ${#CLEANUP_FILES[@]} -gt 0 ]]; then
        log_debug "Limpiando archivos temporales..."
        for file in "${CLEANUP_FILES[@]}"; do
            [[ -f "${file}" ]] && rm -f "${file}"
        done
    fi
    
    # Log final según el resultado
    if [[ ${exit_code} -eq 0 ]]; then
        [[ "${CONFIG[quiet]}" != true ]] && log_success "Script completado exitosamente"
    else
        log_error "Script terminado con errores (código: ${exit_code})"
        log_info "Revisa el log para más detalles: ${LOG_FILE}"
    fi
    
    exit ${exit_code}
}

handle_interrupt() {
    log_warning "Interrupción recibida (Ctrl+C)"
    log_info "Ejecutando limpieza..."
    exit 130
}

# Configurar traps
trap cleanup EXIT
trap handle_interrupt INT TERM

# =============================================================================
# FUNCIÓN MAIN OPTIMIZADA
# =============================================================================

main() {
    local start_time
    start_time="$(date +%s)"
    
    # Banner e inicialización
    print_banner
    [[ "${CONFIG[quiet]}" != true ]] && {
        log_info "Iniciando ${SCRIPT_NAME} v${SCRIPT_VERSION}"
        log_info "Directorio: ${SCRIPT_DIR}"
        log_info "Log: ${LOG_FILE}"
    }
    
    # Procesamiento de argumentos
    parse_arguments "$@"
    
    # Carga de configuración
    load_env_config || log_debug "Configuración de entorno no disponible"
    apply_env_defaults
    
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
            log_success "Operación completada ${ICON_ROCKET}"
            log_info "${ICON_TIME} Duración: ${duration}s"
            log_info "${ICON_TIME} Finalizado: $(date)"
        fi
        
        EXIT_CODE=0
    else
        log_error "La operación falló"
        EXIT_CODE=1
    fi
    
    return ${EXIT_CODE}
}

# =============================================================================
# PUNTO DE ENTRADA
# =============================================================================

# Solo ejecutar main si el script es llamado directamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi