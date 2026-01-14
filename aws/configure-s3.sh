#!/bin/bash
# Configurar bucket S3 como sitio web estático

BUCKET_NAME=$1
REGION=$2

if [ -z "$BUCKET_NAME" ] || [ -z "$REGION" ]; then
  echo "❌ Uso: ./configure-s3.sh <bucket-name> <region>"
  exit 1
fi

echo "🌐 Configurando bucket S3: $BUCKET_NAME como sitio web..."

# Crear bucket si no existe
EXISTS=$(aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null || echo "no")

if [ "$EXISTS" = "no" ]; then
  echo "📦 Bucket no existe, creándolo..."
  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
  else
    aws s3api create-bucket --bucket "$BUCKET_NAME" \
      --region "$REGION" \
      --create-bucket-configuration LocationConstraint="$REGION"
  fi
else
  echo "📦 El bucket $BUCKET_NAME ya existe, continuando..."
fi

# Habilitar hosting de sitio web estático
aws s3 website s3://"$BUCKET_NAME"/ --index-document index.html --error-document index.html

# Desactivar bloqueos de acceso público
echo "🔓 Desactivando Block Public Access para el bucket..."
aws s3api put-public-access-block --bucket "$BUCKET_NAME" --public-access-block-configuration '{
    "BlockPublicAcls": false,
    "IgnorePublicAcls": false,
    "BlockPublicPolicy": false,
    "RestrictPublicBuckets": false
}'

# Hacer públicos los archivos del bucket
aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"PublicReadGetObject\",
    \"Effect\": \"Allow\",
    \"Principal\": \"*\",
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\"
  }]
}"

echo "✅ Bucket $BUCKET_NAME configurado como sitio web"
