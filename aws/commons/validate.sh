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

# Función para validar configuración de AWS
validate_aws_config() {
  local profile="${1:-${AWS_PROFILE:-default}}"
  local region="$2"
  
  log "INFO" "Validating AWS configuration..."
  
  # Verificar AWS CLI
  if ! command -v aws &> /dev/null; then
    handle_aws_config_error "no_cli"
  fi
  
  # Verificar credenciales AWS
  if ! aws sts get-caller-identity --profile "$profile" &> /dev/null; then
    handle_aws_config_error "no_credentials"
  fi
  
  # Verificar región si se proporciona
  if [ -n "$region" ]; then
    if ! echo "$region" | grep -qE '^[a-z]{2}-[a-z]+-[0-9]+$'; then
      handle_aws_config_error "invalid_region"
    fi
  fi
  
  log "SUCCESS" "AWS configuration validated for profile: $profile"
}

# Función para validar bucket S3
validate_s3_bucket() {
  local bucket_name="$1"
  local profile="${2:-${AWS_PROFILE:-default}}"
  
  validate_required "bucket_name" "$bucket_name"
  
  # Validar formato del nombre del bucket
  if ! echo "$bucket_name" | grep -qE '^[a-z0-9][a-z0-9.-]*[a-z0-9]$'; then
    handle_error "Invalid bucket name format: $bucket_name. Bucket names must be lowercase and can contain numbers, dots, and hyphens."
  fi
  
  if [ ${#bucket_name} -gt 63 ]; then
    handle_error "Bucket name too long (max 63 characters): $bucket_name"
  fi
  
  log "DEBUG" "Bucket name validated: $bucket_name"
}

# Función para validar parámetros comunes de scripts AWS
validate_aws_common_params() {
  local bucket_name="$1"
  local region="$2"
  local profile="${3:-${AWS_PROFILE:-default}}"
  
  validate_aws_config "$profile" "$region"
  validate_s3_bucket "$bucket_name" "$profile"
  
  log "SUCCESS" "Common AWS parameters validated"
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