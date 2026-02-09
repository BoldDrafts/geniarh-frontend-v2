#!/bin/bash
# Subir build al bucket S3

# Load commons
SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source "${SCRIPT_DIR}/commons/get.sh"
source "${SCRIPT_DIR}/commons/log.sh"
source "${SCRIPT_DIR}/commons/validate.sh"
source "${SCRIPT_DIR}/commons/check.sh"

# Set module name for logging
MODULE_NAME="upload.sh"

# Show help function
show_help() {
    cat << EOF
🚀 Subir build al bucket S3

Uso: ./upload.sh <bucket-name> <region> [options]

Parámetros requeridos:
  bucket-name      Nombre del bucket S3
  region           Región AWS del bucket

Opciones:
  -p, --profile PROFILE       Perfil de AWS (default: default o \$AWS_PROFILE)
  -s, --source-dir DIR        Directorio fuente (default: ../dist)
  -h, --help                  Mostrar esta ayuda

Ejemplos:
  ./upload.sh mi-bucket us-east-1
  ./upload.sh mi-bucket us-east-1 --profile production
  ./upload.sh mi-bucket us-east-1 --source-dir /ruta/a/mi/build
  AWS_PROFILE=dev ./upload.sh mi-bucket us-east-1

EOF
}

# Initialize variables
BUCKET_NAME=""
REGION=""
PROFILE="${AWS_PROFILE:-default}"
SOURCE_DIR="$(get_script_dir)/../dist"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -p|--profile) PROFILE="$2"; shift ;;
        -s|--source-dir) SOURCE_DIR="$2"; shift ;;
        -h|--help) show_help; exit 0 ;;
        -*) handle_error "Opción desconocida: $1. Usa -h para ver la ayuda." ;;
        *)
            if [ -z "$BUCKET_NAME" ]; then
                BUCKET_NAME="$1"
            elif [ -z "$REGION" ]; then
                REGION="$1"
            else
                handle_error "Demasiados argumentos. Usa -h para ver la ayuda."
            fi
            ;;
    esac
    shift
done

# Validate required parameters
if [ -z "$BUCKET_NAME" ] || [ -z "$REGION" ]; then
    handle_error "Error: Se requieren bucket-name y region. Usa -h para ver la ayuda."
fi

# Validate AWS configuration and parameters
validate_aws_common_params "$BUCKET_NAME" "$REGION" "$PROFILE"

# Verificar que el directorio dist existe
if [ ! -d "$SOURCE_DIR" ]; then
    handle_error "Source directory not found: $SOURCE_DIR. Run build.sh first."
fi

# Verificar que el directorio no esté vacío
if [ -z "$(ls -A $SOURCE_DIR)" ]; then
    handle_error "Source directory is empty: $SOURCE_DIR"
fi

# Verificar que exista index.html
if [ ! -f "$SOURCE_DIR/index.html" ]; then
    handle_error "index.html not found in source directory: $SOURCE_DIR"
fi

log "INFO" "Subiendo build al bucket S3: $BUCKET_NAME"
log "INFO" "Source directory: $SOURCE_DIR"
log "INFO" "AWS Profile: $PROFILE"
log "INFO" "Region: $REGION"

# Mostrar tamaño del build antes de subir
build_size=$(du -sh "$SOURCE_DIR" | cut -f1)
file_count=$(find "$SOURCE_DIR" -type f | wc -l)
log "INFO" "Build size: $build_size ($file_count files)"

# Subir archivos con sincronización
log_progress "Uploading files to S3" 5

if ! aws s3 sync "$SOURCE_DIR/" s3://"$BUCKET_NAME"/ \
    --delete \
    --region "$REGION" \
    --profile "$PROFILE" \
    --follow-symlinks \
    --exclude ".DS_Store" \
    --exclude "Thumbs.db"; then
    handle_error "Failed to upload files to S3"
fi

# Verificar que index.html fue subido
log "INFO" "Verifying upload..."
if ! aws s3 ls s3://"$BUCKET_NAME"/index.html --profile "$PROFILE" &>/dev/null; then
    handle_error "Verification failed: index.html not found in bucket after upload"
fi

# Obtener URL del sitio web
website_url="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

log "SUCCESS" "Build subido exitosamente al bucket $BUCKET_NAME"
log "INFO" "Website URL: $website_url"
log "INFO" "Nota: Puede tomar unos minutos hasta que el sitio esté disponible"
