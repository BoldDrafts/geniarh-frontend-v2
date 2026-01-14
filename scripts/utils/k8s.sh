#!/bin/bash
# Descripción: Script para gestionar despliegues en Kubernetes
# Uso: ./script.sh --action [run|remove|start|stop|restart|rerun|events|tail]

# Activar modo de error estricto
set -e
set -o pipefail

# Definir ruta del directorio del script
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Cargar scripts commons
source "${SCRIPT_DIR}/../commons/log.sh"
source "${SCRIPT_DIR}/../commons/validate.sh"
source "${SCRIPT_DIR}/../commons/get.sh"
source "${SCRIPT_DIR}/../commons/check.sh"
source "${SCRIPT_DIR}/../commons/wait.sh"

# Cargar funciones auxiliares
validate_file "${SCRIPT_DIR}/methods.sh" "Archivo methods.sh no encontrado"
# shellcheck source=methods.sh
. "${SCRIPT_DIR}/methods.sh"

# Función para mostrar ayuda
show_help() {
  cat << EOF
Uso: $(basename "$0") [OPCIONES]

Opciones:
  --action ACCIÓN        Acción a realizar: run, remove, start, stop, restart, rerun, events, tail,
                         export-yaml, open-volume-dir, remove-volume-dir (default: run)
  --profile PERFIL       Perfil a utilizar (default: master)
  --username USUARIO     Usuario para el registro Docker
  --password CLAVE       Contraseña para el registro Docker
  --k8s-app APP          Nombre de la aplicación Kubernetes
  --k8s-image IMAGEN     Imagen de la aplicación
  --k8s-version VERSION  Versión de la aplicación
  --k8s-deployment DEPL  Nombre del deployment
  --k8s-service SVC      Nombre del servicio
  --k8s-namespace NS     Espacio de nombres (default: desde archivo .env)
  --k8s-host-port PUERTO Puerto del host
  --k8s-svc-port PUERTO  Puerto del servicio
  --argocd-path RUTA     Ruta para exportar YAML de ArgoCD
  --help                 Muestra esta ayuda
EOF
  exit 0
}

# Configurar módulo para logs
MODULE_NAME="k8s.sh"

# Función para ejecutar comandos kubectl con manejo de errores
kubectl_exec() {
  if ! ${KUBECTL_COMMAND} "$@"; then
    handle_error "Error ejecutando comando kubectl: $*"
  fi
}

# Función para obtener nombre del pod
get_pod_name() {
  local grep_pattern="$1"
  local pod_name
  pod_name=$(${KUBECTL_COMMAND} get pod -n "${P_NAMESPACE}" | grep "${grep_pattern}" | awk '{print $1}' || echo "")
  echo "$pod_name"
}

# Función para esperar por el pod (usando commons)
wait_for_pod() {
  NAME="${P_K8S_APP}"
  NAMESPACE="${P_NAMESPACE}"
  wait_for_running_pod
  POD_NAME="${NAME}"
}

# Función para buscar puerto disponible
find_available_port() {
  local starting_port="$P_K8S_HOST_PORT"
  local list_ports

  list_ports=$(${KUBECTL_COMMAND} get pods -n "${P_NAMESPACE}" -o json | jq '.items | map([.spec.containers[].ports[].hostPort] | flatten) | flatten')

  local port=$starting_port
  while [[ ! -z "$(echo "${list_ports}" | grep "${port}")" ]]; do
    log "WARN" "Puerto ${port} está ocupado, probando el siguiente"
    ((port++))
  done

  log "SUCCESS" "Se utilizará el puerto disponible: ${port}"
  P_K8S_HOST_PORT="${port}"
}

# Función para aplicar recursos con envsubst
apply_with_envsubst() {
  local yaml_file=$1
  local operation=$2  # apply o delete

  validate_file "${SCRIPT_DIR}/../k8s/${yaml_file}.yaml"

  log "INFO" "Aplicando ${yaml_file}.yaml con operación ${operation}"
  envsubst < "${SCRIPT_DIR}/../k8s/${yaml_file}.yaml" > "${SCRIPT_DIR}/../k8s/${yaml_file}.tmp.yaml"
  if ! envsubst < "${SCRIPT_DIR}/../k8s/${yaml_file}.yaml" | sed -e 's/\$!/\$/g' | ${KUBECTL_COMMAND} "${operation}" -f -; then
    handle_error "Error al ${operation} ${yaml_file}.yaml"
  fi
  rm "${SCRIPT_DIR}/../k8s/${yaml_file}.tmp.yaml"
}

# Función para ejecutar operación run
run_operation() {
  log "INFO" "Iniciando despliegue de la aplicación ${P_K8S_APP}"

  # Buscar puerto disponible
  find_available_port

  # Mostrar información
  log "INFO" "IMAGE: ${P_IMG_REGISTRY_DOMAIN}/${P_APP_IMAGE}:${P_APP_VERSION}"
  log "INFO" "SECRET: ${P_K8S_SECRET}"

  # Eliminar y recrear secret si existe
  if kubectl_exec get secret -n "${P_NAMESPACE}" | grep -q "^${P_K8S_SECRET}"; then
    log "INFO" "Actualizando secret existente ${P_K8S_SECRET}"
    kubectl_exec create secret generic "${P_K8S_SECRET}" --namespace="${P_NAMESPACE}" \
      --from-env-file="${SCRIPT_DIR}/../k8s/secret/${P_PROFILE}.env" \
      --dry-run=client -o yaml | kubectl_exec apply -f -
  else
    # Validar existencia de archivo de secretos
    validate_file "${SCRIPT_DIR}/../k8s/secret/${P_PROFILE}.env"

    # Crear secret
    kubectl_exec create secret generic "${P_K8S_SECRET}" --namespace="${P_NAMESPACE}" --from-env-file="${SCRIPT_DIR}/../k8s/secret/${P_PROFILE}.env"
  fi

  # Aplicar recursos
  apply_with_envsubst "deployment" "apply"
  apply_with_envsubst "service" "apply"
  apply_with_envsubst "ingress" "apply"

  log "SUCCESS" "Despliegue de ${P_K8S_APP} completado"
}

# Función para exportar YAML
export_yaml_operation() {
  validate_required "P_ARGOCD_PATH" "${P_ARGOCD_PATH}" "Se requiere --argocd-path para exportar YAML"

  if [[ ! -d "${P_ARGOCD_PATH}" ]]; then
    log "WARN" "Directorio ${P_ARGOCD_PATH} no existe, creándolo"
    mkdir -p "${P_ARGOCD_PATH}"
  fi

  log "INFO" "Exportando YAML a ${P_ARGOCD_PATH}"

  # Crear secret para exportación
  if kubectl_exec get secret -n "${P_NAMESPACE}" | grep -q "^${P_K8S_SECRET}"; then
    kubectl_exec delete secret "${P_K8S_SECRET}" --namespace="${P_NAMESPACE}"
  fi

  kubectl_exec create secret generic "${P_K8S_SECRET}" --namespace="${P_NAMESPACE}" --from-env-file="${SCRIPT_DIR}/../k8s/secret/${P_PROFILE}.env"

  # Exportar YAML
  for resource in deployment service ingress; do
    log "INFO" "Exportando ${resource}.yaml"
    envsubst < "${SCRIPT_DIR}/../k8s/${resource}.yaml" > "${P_ARGOCD_PATH}/${resource}.yaml"
  done

  log "SUCCESS" "YAML exportado a ${P_ARGOCD_PATH}"
}

# Función para remover recursos
remove_operation() {
  log "INFO" "Eliminando recursos de la aplicación ${P_K8S_APP}"

  # Eliminar recursos en orden inverso
  apply_with_envsubst "ingress" "delete"
  apply_with_envsubst "service" "delete"
  apply_with_envsubst "deployment" "delete"

  # Eliminar secret
  kubectl_exec delete secret --namespace="${P_NAMESPACE}" "${P_K8S_SECRET}"

  log "SUCCESS" "Recursos eliminados correctamente"
}

# Parsear argumentos
while [[ $# -gt 0 ]]; do
  case "$1" in
    --action)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --action requiere un valor. Uso: --action [run|remove|start|stop|restart|rerun|events|tail|export-yaml]"
            exit 1
        fi
        P_ACTION=$2
        shift 2
        ;;
    --profile)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --profile requiere un valor. Uso: --profile [master|develop|otro_perfil]"
            exit 1
        fi
        P_PROFILE=$2
        shift 2
        ;;
    --username)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --username requiere un valor. Uso: --username usuario"
            exit 1
        fi
        P_USERNAME=$2
        shift 2
        ;;
    --password)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --password requiere un valor. Uso: --password contraseña"
            exit 1
        fi
        P_PASSWORD=$2
        shift 2
        ;;
    --k8s-app)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --k8s-app requiere un valor. Uso: --k8s-app nombre_app"
            exit 1
        fi
        P_K8S_APP=$2
        shift 2
        ;;
    --k8s-image)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --k8s-image requiere un valor. Uso: --k8s-image nombre_imagen"
            exit 1
        fi
        P_APP_IMAGE=$2
        shift 2
        ;;
    --k8s-version)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --k8s-version requiere un valor. Uso: --k8s-version version"
            exit 1
        fi
        P_APP_VERSION=$2
        shift 2
        ;;
    --k8s-deployment)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --k8s-deployment requiere un valor. Uso: --k8s-deployment nombre_deployment"
            exit 1
        fi
        P_K8S_DEPLOYMENT=$2
        shift 2
        ;;
    --k8s-service)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --k8s-service requiere un valor. Uso: --k8s-service nombre_servicio"
            exit 1
        fi
        P_K8S_SERVICE=$2
        shift 2
        ;;
    --k8s-namespace)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --k8s-namespace requiere un valor. Uso: --k8s-namespace namespace"
            exit 1
        fi
        P_NAMESPACE=$2
        shift 2
        ;;
    --k8s-host-port)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --k8s-host-port requiere un valor. Uso: --k8s-host-port puerto"
            exit 1
        fi
        P_K8S_HOST_PORT=$2
        shift 2
        ;;
    --k8s-svc-port)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --k8s-svc-port requiere un valor. Uso: --k8s-svc-port puerto"
            exit 1
        fi
        P_K8S_SVC_PORT=$2
        shift 2
        ;;
    --argocd-path)
        if [[ -z "$2" || "$2" == --* ]]; then
            log "ERROR" "El parámetro --argocd-path requiere un valor. Uso: --argocd-path ruta"
            exit 1
        fi
        P_ARGOCD_PATH=$2
        shift 2
        ;;
    --help)
        show_help
        ;;
    *)
        log "ERROR" "Parámetro desconocido: $1"
        echo "Use --help para ver las opciones disponibles"
        exit 1
        ;;
  esac
done

# Establecer valores por defecto
P_PROFILE=${P_PROFILE:-"master"}
P_ACTION=${P_ACTION:-"run"}

# Cargar variables de entorno usando función común (solo del perfil específico)
# NOTA: No cargamos profile.env.example ya que solo contiene valores de ejemplo
load_env_vars "$P_PROFILE" "$SCRIPT_DIR"

# Asignar valores usando fallback completo
P_K8S_DEPLOYMENT=$(set_with_fallback "K8S_DEPLOYMENT" "geniarh-frontend-v2-${P_PROFILE}")
P_K8S_SERVICE=$(set_with_fallback "K8S_SERVICE" "geniarh-frontend-v2-${P_PROFILE}-svc")
P_K8S_CFG_MAP=$(set_with_fallback "K8S_CFG_MAP" "geniarh-frontend-v2-${P_PROFILE}-cfg")
P_K8S_SECRET=$(set_with_fallback "K8S_SECRET" "geniarh-frontend-v2-${P_PROFILE}-secret")
P_NAMESPACE=$(set_with_fallback "NAMESPACE" "synopsis-ws")
P_K8S_SECRET_REGISTRY=$(set_with_fallback "K8S_SECRET_REGISTRY" "registry-secret")
P_K8S_HOST_PORT=$(set_with_fallback "K8S_HOST_PORT" "8080")
P_K8S_SVC_PORT=$(set_with_fallback "K8S_SVC_PORT" "8080")
P_K8S_APP=$(set_with_fallback "K8S_APP" "geniarh-frontend-v2-${P_PROFILE}")
P_APP_IMAGE=$(set_with_fallback "APP_IMAGE" "geniarh-frontend-v2")
P_APP_VERSION=$(set_with_fallback "APP_VERSION" "1.0.0")
P_IMG_REGISTRY_DOMAIN=$(set_with_fallback "IMG_REGISTRY_DOMAIN" "registry.cmaconsulting.org")
P_DOMAIN=$(set_with_fallback "DOMAIN" "geniarh.cmaconsulting.org")
VOLUME_DIR=$(set_with_fallback "VOLUME_DIR" "/tmp")

# Validar variables requeridas para todas las acciones
validate_required "--k8s-app" "${P_K8S_APP}"
validate_required "--k8s-namespace" "${P_NAMESPACE}"

# Exportar variables para envsubst
export P_NAMESPACE="${P_NAMESPACE}"
export P_APP_IMAGE="${P_APP_IMAGE}"
export P_APP_VERSION="${P_APP_VERSION}"
export P_K8S_APP="${P_K8S_APP}"
export P_K8S_SERVICE="${P_K8S_SERVICE}"
export P_K8S_SECRET="${P_K8S_SECRET}"
export P_K8S_CFG_MAP="${P_K8S_CFG_MAP}"
export P_IMG_REGISTRY_DOMAIN="${P_IMG_REGISTRY_DOMAIN}"
export P_K8S_SECRET_REGISTRY="${P_K8S_SECRET_REGISTRY}"
export P_K8S_HOST_PORT="${P_K8S_HOST_PORT}"
export P_DOMAIN="${P_DOMAIN}"
export VOLUME_NAME_CFG="${P_K8S_APP}-config"
export VOLUME_DIR_CFG="${VOLUME_DIR}/${P_K8S_APP}/config"

# Configurar comando kubectl
KUBECTL_COMMAND="kubectl"

# Validar dependencias
check_kubectl

# Ejecutar acción solicitada
case "${P_ACTION}" in
    "run")
        run_operation
        ;;
    "remove")
        remove_operation
        ;;
    "stop")
        kubectl_exec scale deployment ${P_K8S_APP} --namespace ${P_NAMESPACE} --replicas=0
        log "SUCCESS" "Deployment ${P_K8S_APP} detenido"
        ;;
    "start")
        kubectl_exec scale deployment ${P_K8S_APP} --namespace ${P_NAMESPACE} --replicas=1
        log "SUCCESS" "Deployment ${P_K8S_APP} iniciado"
        ;;
    "restart")
        log "INFO" "Reiniciando deployment ${P_K8S_APP}..."
        kubectl_exec rollout restart deployment/${P_K8S_APP} --namespace ${P_NAMESPACE}
        log "SUCCESS" "Deployment ${P_K8S_APP} reiniciado"
        ;;
    "rerun")
        log "INFO" "Ejecutando rerun (remove + run)..."
        remove_operation
        sleep 5
        run_operation
        ;;
    "tail")
        log "INFO" "Mostrando logs del pod ${P_K8S_APP}..."
        POD_NAME=$(kubectl_exec get pod -n ${P_NAMESPACE} | grep "${P_K8S_APP}.*Running" | awk '{print $1}')
        while [[ "" == ${POD_NAME} ]] ; do
            log "INFO" "Esperando pod en estado Running..."
            sleep 10
            POD_NAME=$(kubectl_exec get pod -n ${P_NAMESPACE} | grep "${P_K8S_APP}.*Running" | awk '{print $1}')
        done
        kubectl_exec logs -f --namespace ${P_NAMESPACE} ${POD_NAME}
        ;;
    "events")
        POD_NAME=$(kubectl_exec get pod -n ${P_NAMESPACE} | grep ${P_K8S_APP} | awk '{print $1}')
        kubectl_exec get events --namespace ${P_NAMESPACE} | grep ${POD_NAME}
        ;;
    "export-yaml")
        export_yaml_operation
        ;;
    *)
        log "ERROR" "Acción desconocida: ${P_ACTION}"
        echo "Acciones disponibles: run, remove, stop, start, restart, rerun, tail, events, export-yaml"
        exit 1
        ;;
esac

# Limpiar variables de entorno exportadas
export P_NAMESPACE=
export P_APP_IMAGE=
export P_APP_VERSION=
export P_K8S_APP=
export P_K8S_SERVICE=
export P_K8S_SECRET=
export P_K8S_CFG_MAP=
export P_IMG_REGISTRY_DOMAIN=
export P_K8S_SECRET_REGISTRY=
export VOLUME_NAME_CFG=
export VOLUME_DIR_CFG=

log "SUCCESS" "Proceso completado exitosamente"
exit 0