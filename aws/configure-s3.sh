#!/bin/bash
# Configurar bucket S3 como sitio web estático

# Load commons
SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source "${SCRIPT_DIR}/commons/log.sh"
source "${SCRIPT_DIR}/commons/validate.sh"
source "${SCRIPT_DIR}/commons/check.sh"

# Set module name for logging
MODULE_NAME="configure-s3.sh"

# Show help function
show_help() {
    cat << EOF
🌐 Configurar bucket S3 como sitio web estático

Uso: ./configure-s3.sh <bucket-name> <region> [options]

Parámetros requeridos:
  bucket-name      Nombre del bucket S3
  region           Región AWS del bucket

Opciones:
  -p, --profile PROFILE       Perfil de AWS (default: default o \$AWS_PROFILE)
  -h, --help                  Mostrar esta ayuda

Ejemplos:
  ./configure-s3.sh mi-bucket us-east-1
  ./configure-s3.sh mi-bucket us-east-1 --profile production
  AWS_PROFILE=dev ./configure-s3.sh mi-bucket us-east-1

EOF
}

# Initialize variables
BUCKET_NAME=""
REGION=""
PROFILE="${AWS_PROFILE:-default}"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -p|--profile) PROFILE="$2"; shift ;;
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

log "INFO" "Configurando bucket S3: $BUCKET_NAME como sitio web estático (profile: $PROFILE)"

# Verificar si el bucket existe
if check_bucket_exists "$BUCKET_NAME" "$PROFILE"; then
    log "INFO" "El bucket $BUCKET_NAME ya existe, continuando..."
else
    log "INFO" "Bucket no existe, creándolo..."
    log_progress "Creating bucket S3" 2
    
    if [ "$REGION" = "us-east-1" ]; then
        if ! aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" --profile "$PROFILE"; then
            handle_error "Failed to create bucket $BUCKET_NAME"
        fi
    else
        if ! aws s3api create-bucket --bucket "$BUCKET_NAME" \
            --region "$REGION" \
            --create-bucket-configuration LocationConstraint="$REGION" \
            --profile "$PROFILE"; then
            handle_error "Failed to create bucket $BUCKET_NAME"
        fi
    fi
    
    # Esperar a que el bucket esté completamente creado
    log_progress "Waiting for bucket to be ready" 3
fi

# Habilitar hosting de sitio web estático
log "INFO" "Configuring static website hosting..."
if ! aws s3 website s3://"$BUCKET_NAME"/ \
    --index-document index.html \
    --error-document index.html \
    --profile "$PROFILE"; then
    handle_error "Failed to configure static website hosting"
fi

# Desactivar bloqueos de acceso público
log "INFO" "Desactivando Block Public Access para el bucket..."
if ! aws s3api put-public-access-block --bucket "$BUCKET_NAME" \
    --public-access-block-configuration '{
        "BlockPublicAcls": false,
        "IgnorePublicAcls": false,
        "BlockPublicPolicy": false,
        "RestrictPublicBuckets": false
    }' \
    --profile "$PROFILE"; then
    handle_error "Failed to disable public access block"
fi

# Hacer públicos los archivos del bucket
log "INFO" "Aplicando política de acceso público..."
local bucket_policy
bucket_policy=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
  }]
}
EOF
)

if ! aws s3api put-bucket-policy --bucket "$BUCKET_NAME" \
    --policy "$bucket_policy" \
    --profile "$PROFILE"; then
    handle_error "Failed to apply bucket policy"
fi

# Obtener URL del sitio web
local website_url
website_url="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

log "SUCCESS" "Bucket $BUCKET_NAME configurado como sitio web estático"
log "INFO" "URL del sitio web: $website_url"
log "INFO" "Nota: La configuración puede tardar unos minutos en propagarse"
