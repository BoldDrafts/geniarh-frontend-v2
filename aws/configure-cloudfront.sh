#!/bin/bash
# Configurar CloudFront para servir el bucket S3 con HTTPS

BUCKET_NAME=$1
DOMAIN_NAME=$2
CERT_ALIAS=$3
REGION=$4

if [ -z "$BUCKET_NAME" ] || [ -z "$DOMAIN_NAME" ] || [ -z "$CERT_ALIAS" ] || [ -z "$REGION" ]; then
  echo "❌ Uso: ./configure-cloudfront.sh <bucket-name> <domain-name> <cert-alias> <region>"
  echo "   Ejemplo: ./configure-cloudfront.sh dientecitas.com dientecitas.com '*.dientecitas.com' us-east-1"
  exit 1
fi

echo "🌐 Configurando CloudFront para $DOMAIN_NAME..."

# Buscar certificado en ACM usando CERT_ALIAS (us-east-1 requerido para CloudFront)
echo "🔍 Buscando certificado para: $CERT_ALIAS"
CERT_ARN=$(aws acm list-certificates --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='$CERT_ALIAS'].CertificateArn" --output text)

if [ -z "$CERT_ARN" ]; then
  echo "📜 No se encontró un certificado para $CERT_ALIAS, solicitando uno nuevo..."
  CERT_ARN=$(aws acm request-certificate \
    --region us-east-1 \
    --domain-name "$CERT_ALIAS" \
    --validation-method DNS \
    --query CertificateArn --output text)
  echo "✅ Certificado solicitado: $CERT_ARN"

  echo "⚠️ Debes crear un registro CNAME en tu DNS para validar el certificado."
  aws acm describe-certificate \
    --region us-east-1 \
    --certificate-arn "$CERT_ARN" \
    --query "Certificate.DomainValidationOptions" \
    --output table
  echo "⏳ Espera a que el certificado esté en estado ISSUED antes de continuar."
  exit 0
else
  echo "✅ Certificado encontrado: $CERT_ARN"
fi

# Verificar el estado del certificado
CERT_STATUS=$(aws acm describe-certificate \
  --region us-east-1 \
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
echo "🚀 Creando distribución de CloudFront..."
CREATE_OUTPUT=$(aws cloudfront create-distribution --output json --distribution-config "{
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