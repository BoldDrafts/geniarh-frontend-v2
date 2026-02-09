#!/bin/bash
# AWS Scripts Validation and Setup Guide

# Load commons
SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source "${SCRIPT_DIR}/commons/log.sh"
source "${SCRIPT_DIR}/commons/validate.sh"
source "${SCRIPT_DIR}/commons/check.sh"

# Set module name for logging
MODULE_NAME="aws-setup.sh"

show_help() {
  cat << EOF
🔧 AWS Scripts Setup and Validation

Este script ayuda a validar la configuración de AWS y muestra ejemplos de uso.

Uso: ./aws-setup.sh [OPTIONS]

Opciones:
  -c, --check              Validar configuración de AWS
  -e, --examples           Mostrar ejemplos de uso
  -s, --setup              Inicializar configuración básica
  -h, --help               Mostrar esta ayuda

Variables de ambiente:
  AWS_PROFILE              Perfil de AWS a usar

EOF
}

validate_aws_setup() {
    log "INFO" "🔍 Validando configuración de AWS..."
    
    # Check AWS CLI
    check_aws_cli
    
    # Check AWS credentials
    check_aws_credentials "${AWS_PROFILE:-default}"
    
    # Check if jq is available (required for some scripts)
    if ! command -v jq &> /dev/null; then
        log "WARN" "jq no está instalado. Algunos scripts pueden requerirlo."
        log "INFO" "Instala jq con: 'sudo apt-get install jq' (Ubuntu) o 'brew install jq' (macOS)"
    else
        log "SUCCESS" "jq está disponible: $(jq --version)"
    fi
    
    log "SUCCESS" "✅ Configuración de AWS validada"
}

show_examples() {
    cat << EOF
📚 Ejemplos de uso de los scripts AWS

1. Despliegue completo (build + configure + upload):
   ./deploy.sh -b mi-bucket-unico -r us-east-1

2. Solo construir la aplicación:
   ./build.sh

3. Solo configurar el bucket S3:
   ./configure-s3.sh mi-bucket-unico us-east-1

4. Solo subir archivos:
   ./upload.sh mi-bucket-unico us-east-1

5. Usar un perfil específico de AWS:
   AWS_PROFILE=production ./deploy.sh -b mi-bucket-unico

6. Configurar CloudFront con certificado SSL:
   ./configure-cloudfront.sh mi-bucket-unico midominio.com midominio.com us-east-1

7. Actualizar contenido sin reconstruir:
   ./deploy.sh -b mi-bucket-unico -a upload

8. Usar directorio fuente personalizado:
   ./upload.sh mi-bucket-unico us-east-1 /ruta/a/mi/build

💡 Tips:
- Configura tus credenciales AWS con: aws configure --profile <nombre-perfil>
- Los nombres de buckets S3 deben ser únicos globalmente
- Para certificados SSL, la región debe ser us-east-1 (requerimiento de CloudFront)
- Los logs se guardan con timestamps para mejor depuración

EOF
}

init_setup() {
    log "INFO" "🚀 Inicializando configuración básica..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log "ERROR" "AWS CLI no está instalado"
        log "INFO" "Instala AWS CLI desde: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    # Prompt for AWS configuration
    log "INFO" "Configura tus credenciales AWS:"
    echo ""
    
    if ! aws configure; then
        handle_error "Error al configurar AWS credentials"
    fi
    
    # Validate the configuration
    validate_aws_setup
    
    log "SUCCESS" "✅ Configuración inicial completada"
    log "INFO" "Ahora puedes usar los scripts de despliegue:"
    log "INFO" "  ./deploy.sh -b tu-nombre-de-bucket"
}

# Parse arguments
case "${1:-}" in
    -c|--check)
        validate_aws_setup
        ;;
    -e|--examples)
        show_examples
        ;;
    -s|--setup)
        init_setup
        ;;
    -h|--help|"")
        show_help
        ;;
    *)
        handle_error "Opción desconocida: $1. Usa -h para ver la ayuda."
        ;;
esac