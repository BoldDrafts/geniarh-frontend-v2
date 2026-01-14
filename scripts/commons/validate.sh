#!/bin/bash
#location: scripts/commons/validate.sh

validate_dir() {
  echo "$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
}

# Cargar get.sh (contiene get_script_dir)
source $(validate_dir)/get.sh

# Determinar la ruta a scripts/commons
COMMONS_DIR=$(validate_dir)

# Cargar log.sh para usar handle_error
# Asumiendo que log.sh está en la misma carpeta (scripts/commons)
if [[ ! -f "${COMMONS_DIR}/log.sh" ]]; then
    echo -e "\033[0;31m[FATAL ERROR] Dependencia log.sh no encontrada.\033[0m" >&2
    exit 1
fi
source "${COMMONS_DIR}/log.sh"

# Función para validar variables requeridas
validate_required() {
  local var_name="$1"
  local var_value="$2"
  local error_msg="${3:-El parámetro $var_name es requerido}"

  if [[ -z "$var_value" ]]; then
    handle_error "${error_msg}"
  fi
}

# Función para validar la existencia de un archivo
validate_file() {
  local file_path="$1"
  local error_msg="${2:-No se encontró el archivo: $file_path}"
  
  if [[ ! -f "$file_path" ]]; then
    handle_error "${error_msg}"
  fi
}

# Función para validar la existencia del archivo dev.env y cargar las variables
validate_and_load_env() {
  local parent_dir
  parent_dir=$(get_script_dir)
  
  local env_file="$parent_dir/.env"

  if [ ! -f "$env_file" ]; then
    handle_error "El archivo .env no se encuentra en el directorio. Asegúrate de crearlo con la variable GCP_PROJECT_ID."
  fi

  source $env_file
}

validate_and_load_env_module() {
  local parent_dir
  local environment_file="$1/$2.env"
  parent_dir=$(get_script_dir)/terraform
  
  local env_file="$parent_dir/${environment_file}"

  log "INFO" "env_file: $env_file" # Usando la función log cargada

  if [ ! -f "$env_file" ]; then
    handle_error "El archivo .env no se encuentra en el directorio."
  fi

  source $env_file
}