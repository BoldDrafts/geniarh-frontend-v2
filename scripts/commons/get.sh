#!/bin/bash
#location: scripts/commons/get.sh

# Función para capturar el directorio base del script
ENVIRONMENT=${ENVIRONMENT:-"dev"}

get_commons_dir() {
  echo "$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
}

get_script_dir() {
  echo $(dirname "$(get_commons_dir)")
}

get_project_dir() {
  echo $(dirname "$(get_script_dir)")
}

get_workspace_dir() {
  echo $(get_project_dir)/workspace/$ENVIRONMENT
}

# Función para cargar variables de entorno con fallback
# Prioridad: 1) Variable local ya seteada, 2) ENV_* del archivo .env del perfil, 3) Valor inline
# NOTA: No carga profile.env.example ya que solo contiene valores de ejemplo
load_env_vars() {
  local profile="${1:-master}"
  local script_dir="${2:-$(get_script_dir)}"
  
  # Ruta al archivo del perfil específico
  local profile_env_file="${script_dir}/utils/env/${profile}.env"
  
  # Cargar variables del perfil específico si existe
  if [[ -f "$profile_env_file" ]]; then
    set -a
    source "$profile_env_file"
    set +a
  fi
}

# Función para asignar variable con fallback completo
# Uso: VAR=$(set_with_fallback "VAR_NAME" "inline_default")
# Prioridad: 1) Variable local ya seteada, 2) ENV_* del archivo .env, 3) Valor inline
set_with_fallback() {
  local var_name="$1"
  local inline_default="$2"
  local env_var="ENV_${var_name}"
  local current_value="${!var_name}"
  local env_value="${!env_var}"
  
  # Si la variable ya tiene valor, mantenerlo
  if [[ -n "$current_value" ]]; then
    echo "$current_value"
  # Si no, usar ENV_* del perfil o el valor inline
  else
    echo "${env_value:-$inline_default}"
  fi
}