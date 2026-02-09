#!/bin/bash
# Configurar CloudFront para servir el bucket S3 con HTTPS

# Load commons
SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source "${SCRIPT_DIR}/commons/log.sh"
source "${SCRIPT_DIR}/commons/validate.sh"
source "${SCRIPT_DIR}/commons/check.sh"

# Set module name for logging
MODULE_NAME="configure-cloudfront.sh"

# Parse parameters
BUCKET_NAME="$1"
DOMAIN_NAME="$2"
CERT_ALIAS="$3"
REGION="$4"
PROFILE="${5:-${AWS_PROFILE:-default}}"

# Show help function
show_help() {
    cat << EOF
🌐 Configurar CloudFront con HTTPS

Uso: ./configure-cloudfront.sh <bucket-name> <domain-name> <cert-alias> <region> [profile]

Parámetros:
  bucket-name      Nombre del bucket S3
  domain-name      Nombre de dominio para CloudFront
  cert-alias       Alias del certificado SSL (debe existir en ACM us-east-1)
  region           Región AWS del bucket
  profile          Perfil de AWS (default: default o \$AWS_PROFILE)

Ejemplos:
  ./configure-cloudfront.sh mi-bucket midominio.com midominio.com us-east-1
  ./configure-cloudfront.sh mi-bucket midominio.com "*.midominio.com" us-east-1 production
  AWS_PROFILE=dev ./configure-cloudfront.sh mi-bucket midominio.com midominio.com us-east-1

Nota: Los certificados SSL para CloudFront deben estar en la región us-east-1

EOF
}

# Check for help parameter
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Validate parameters
if [ -z "$BUCKET_NAME" ] || [ -z "$DOMAIN_NAME" ] || [ -z "$CERT_ALIAS" ] || [ -z "$REGION" ]; then
    handle_error "Uso: ./configure-cloudfront.sh <bucket-name> <domain-name> <cert-alias> <region> [profile]"
fi

# Validate AWS configuration
validate_aws_config "$PROFILE" "$REGION"
validate_s3_bucket "$BUCKET_NAME" "$PROFILE"

log "INFO" "🌐 Configurando CloudFront para $DOMAIN_NAME (profile: $PROFILE)"

# Buscar certificado en ACM usando CERT_ALIAS (us-east-1 requerido para CloudFront)
log "INFO" "🔍 Buscando certificado para: $CERT_ALIAS"
CERT_ARN=$(aws acm list-certificates --region us-east-1 --profile "$PROFILE" \
  --query "CertificateSummaryList[?DomainName=='$CERT_ALIAS'].CertificateArn" --output text)

if [ -z "$CERT_ARN" ]; then
  echo "📜 No se encontró un certificado para $CERT_ALIAS, solicitando uno nuevo..."
  CERT_ARN=$(aws acm request-certificate \
    --region us-east-1 \
    --domain-name "$CERT_ALIAS" \
    --validation-method DNS \
    --query CertificateArn --output text)
  log "SUCCESS" "Certificado solicitado: $CERT_ARN"

  log "WARN" "Debes crear un registro CNAME en tu DNS para validar el certificado."
  aws acm describe-certificate \
    --region us-east-1 \
    --profile "$PROFILE" \
    --certificate-arn "$CERT_ARN" \
    --query "Certificate.DomainValidationOptions" \
    --output table
  log "INFO" "⏳ Espera a que el certificado esté en estado ISSUED antes de continuar."
  exit 0
else
  echo "✅ Certificado encontrado: $CERT_ARN"
fi

# Verificar el estado del certificado
CERT_STATUS=$(aws acm describe-certificate \
  --region us-east-1 \
  --profile "$PROFILE" \
  --certificate-arn "$CERT_ARN" \
  --query "Certificate.Status" --output text)

if [ "$CERT_STATUS" != "ISSUED" ]; then
  echo "⚠️ El certificado no está en estado ISSUED (actual: $CERT_STATUS)"
  echo "⏳ Espera a que el certificado sea validado antes de continuar."
  exit 1
fi

# Crear origen para CloudFront (bucket S3)
ORIGIN_ID="S3-$BUCKET_NAME"

# Crear la distribución de CloudFront
log "INFO" "🚀 Creando distribución de CloudFront..."
CREATE_OUTPUT=$(aws cloudfront create-distribution --profile "$PROFILE" --output json --distribution-config "{
  \"CallerReference\": \"$(date +%s)\",
  \"Comment\": \"Distribución para $DOMAIN_NAME\",
  \"Aliases\": {
    \"Quantity\": 1,
    \"Items\": [\"$DOMAIN_NAME\"]
  },
  \"DefaultRootObject\": \"index.html\",
  \"Origins\": {
    \"Quantity\": 1,
    \"Items\": [{
      \"Id\": \"$ORIGIN_ID\",
      \"DomainName\": \"$BUCKET_NAME.s3-website-$REGION.amazonaws.com\",
      \"OriginPath\": \"\",
      \"CustomOriginConfig\": {
        \"HTTPPort\": 80,
        \"HTTPSPort\": 443,
        \"OriginProtocolPolicy\": \"http-only\",
        \"OriginSslProtocols\": {
          \"Quantity\": 3,
          \"Items\": [\"TLSv1\", \"TLSv1.1\", \"TLSv1.2\"]
        }
      }
    }]
  },
  \"DefaultCacheBehavior\": {
    \"TargetOriginId\": \"$ORIGIN_ID\",
    \"ViewerProtocolPolicy\": \"redirect-to-https\",
    \"AllowedMethods\": {
      \"Quantity\": 2,
      \"Items\": [\"GET\", \"HEAD\"],
      \"CachedMethods\": {
        \"Quantity\": 2,
        \"Items\": [\"GET\", \"HEAD\"]
      }
    },
    \"ForwardedValues\": {
      \"QueryString\": false,
      \"Cookies\": {
        \"Forward\": \"none\"
      }
    },
    \"MinTTL\": 0,
    \"DefaultTTL\": 86400,
    \"MaxTTL\": 31536000,
    \"TrustedSigners\": {
      \"Enabled\": false,
      \"Quantity\": 0
    }
  },
  \"ViewerCertificate\": {
    \"ACMCertificateArn\": \"$CERT_ARN\",
    \"SSLSupportMethod\": \"sni-only\",
    \"MinimumProtocolVersion\": \"TLSv1.2_2019\"
  },
  \"Enabled\": true
}")

# Extraer ID y dominio de la distribución
DISTRIBUTION_ID=$(echo "$CREATE_OUTPUT" | jq -r '.Distribution.Id')
CLOUDFRONT_DOMAIN=$(echo "$CREATE_OUTPUT" | jq -r '.Distribution.DomainName')

if [ -z "$DISTRIBUTION_ID" ] || [ "$DISTRIBUTION_ID" == "null" ]; then
  echo "❌ Error: No se pudo crear la distribución de CloudFront"
  echo "💡 Revisa que el certificado esté validado y que tengas permisos suficientes"
  exit 1
fi

echo "✅ CloudFront creado con ID: $DISTRIBUTION_ID"
echo "🌐 Dominio de CloudFront: $CLOUDFRONT_DOMAIN"
echo "🕒 Espera unos minutos a que la distribución se propague."

echo ""
echo "📌 Configuración DNS necesaria:"
echo "👉 Apunta tu dominio ($DOMAIN_NAME) al dominio de CloudFront:"
echo "    CNAME: $DOMAIN_NAME -> $CLOUDFRONT_DOMAIN"
echo ""
echo "🔧 Para verificar el estado de la distribución:"
echo "    aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status'"