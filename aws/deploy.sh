#!/bin/bash

# Script principal para compilar y desplegar la app ReactJS a S3
# Autor: Elvis Pérez

# Load commons
SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source "${SCRIPT_DIR}/commons/log.sh"
source "${SCRIPT_DIR}/commons/validate.sh"
source "${SCRIPT_DIR}/commons/check.sh"

# Set module name for logging
MODULE_NAME="deploy.sh"

# Valores por defecto
REGION="us-east-1"
ACTION="all"
PROFILE="${AWS_PROFILE:-default}"

show_help() {
  cat << EOF
🚀 Deploy ReactJS a AWS S3

Uso: ./deploy.sh [OPTIONS]

Opciones:
  -b, --bucket NAME         Nombre del bucket S3 (requerido)
  -r, --region REGION       Región AWS (default: us-east-1)
  -a, --action ACTION       Acción a realizar: build | configure | upload | cloudfront | update-cloudfront | all (default: all)
  -p, --profile PROFILE     Perfil de AWS (default: default o \$AWS_PROFILE)
  -s, --source-dir DIR      Directorio fuente (default: ../dist)
  -h, --help                Mostrar esta ayuda

Ejemplos:
  ./deploy.sh -b mi-bucket
  ./deploy.sh --bucket mi-bucket --region us-west-2 --action all
  ./deploy.sh -b mi-bucket -p production -a upload
  AWS_PROFILE=prod ./deploy.sh -b mi-bucket -a cloudfront

Variables de ambiente:
  AWS_PROFILE                Perfil de AWS a usar (alternativa a -p)

EOF
}

# Parsear argumentos
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -b|--bucket) BUCKET_NAME="$2"; shift ;;
        -r|--region) REGION="$2"; shift ;;
        -a|--action) ACTION="$2"; shift ;;
        -p|--profile) PROFILE="$2"; shift ;;
        -s|--source-dir) SOURCE_DIR="$2"; shift ;;
        -h|--help) show_help; exit 0 ;;
        *) handle_error "Opción desconocida: $1. Usa -h para ver la ayuda." ;;
    esac
    shift
done

# Validar bucket (requerido)
if [ -z "$BUCKET_NAME" ]; then
    handle_error "Error: Debes especificar el nombre del bucket con -b o --bucket"
fi

# Set AWS_PROFILE for sub-scripts
export AWS_PROFILE="$PROFILE"

log "INFO" "📦 Parámetros de despliegue:"
log "INFO" "  📂 Bucket: $BUCKET_NAME"
log "INFO" "  🌎 Región: $REGION"
log "INFO" "  🛠  Acción: $ACTION"
log "INFO" "  👤 Perfil AWS: $PROFILE"
log "INFO" "  📁 Directorio fuente: ${SOURCE_DIR:-../dist}"
log "INFO" ""

# Validate AWS configuration básica antes de continuar
validate_aws_config "$PROFILE" "$REGION"

# Variables para control de errores
build_failed=false
configure_failed=false
upload_failed=false
cloudfront_failed=false

# Ejecutar acciones según parámetro
if [[ "$ACTION" == "build" || "$ACTION" == "all" ]]; then
    log "INFO" "🔨 Ejecutando build..."
    if ! ./build.sh; then
        build_failed=true
        handle_error "Build failed. Review the error messages above."
    fi
fi

if [[ "$ACTION" == "configure" || "$ACTION" == "all" ]]; then
    log "INFO" "🌐 Configurando bucket S3..."
    if ! ./configure-s3.sh "$BUCKET_NAME" "$REGION" --profile "$PROFILE"; then
        configure_failed=true
        handle_error "S3 configuration failed. Review error messages above."
    fi
fi
fi

if [[ "$ACTION" == "upload" || "$ACTION" == "all" ]]; then
    log "INFO" "🚀 Subiendo build al bucket..."
    if [ -n "$SOURCE_DIR" ]; then
        if ! ./upload.sh "$BUCKET_NAME" "$REGION" --profile "$PROFILE" --source-dir "$SOURCE_DIR"; then
            upload_failed=true
            handle_error "Upload failed. Review error messages above."
        fi
    else
        if ! ./upload.sh "$BUCKET_NAME" "$REGION" --profile "$PROFILE"; then
            upload_failed=true
            handle_error "Upload failed. Review error messages above."
        fi
    fi
fi
    else
        if ! ./upload.sh "$BUCKET_NAME" "$REGION"; then
            upload_failed=true
            handle_error "Upload failed. Review the error messages above."
        fi
    fi
fi

if [[ "$ACTION" == "cloudfront" ]]; then
    log "INFO" "🌐 Configurando CloudFront..."
    if ! ./configure-cloudfront.sh "$BUCKET_NAME" "$BUCKET_NAME" "$BUCKET_NAME" "$REGION" "$PROFILE"; then
        cloudfront_failed=true
        handle_error "CloudFront configuration failed. Review the error messages above."
    fi
fi

if [[ "$ACTION" == "update-cloudfront" ]]; then
    log "INFO" "🔄 Actualizando CloudFront..."
    if ! ./update-cloudfront.sh "$BUCKET_NAME" "$BUCKET_NAME" "$BUCKET_NAME" "$REGION" "$PROFILE"; then
        cloudfront_failed=true
        handle_error "CloudFront update failed. Review the error messages above."
    fi
fi
fi

if [[ "$ACTION" == "update-cloudfront" ]]; then
    log "INFO" "🔄 Actualizando CloudFront..."
    if ! ./update-cloudfront.sh "$BUCKET_NAME" "$BUCKET_NAME" "$REGION"; then
        cloudfront_failed=true
        handle_error "CloudFront update failed. Review the error messages above."
    fi
fi

# Resumen final
if [[ "$build_failed" = false && "$configure_failed" = false && "$upload_failed" = false && "$cloudfront_failed" = false ]]; then
    log "SUCCESS" "✅ Proceso completado exitosamente"
    
    # Mostrar información útil
    if [[ "$ACTION" == "all" || "$ACTION" == "configure" || "$ACTION" == "upload" ]]; then
        local website_url
        website_url="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
        log "INFO" "🌐 Website URL: $website_url"
        log "INFO" "⏳ Nota: Puede tomar unos minutos hasta que el sitio esté completamente disponible"
    fi
    
    exit 0
else
    handle_error "❌ El proceso completó con errores. Revisa los mensajes above."
fi
