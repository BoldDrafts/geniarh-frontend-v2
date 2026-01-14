#!/bin/bash
# Subir build al bucket S3

BUCKET_NAME=$1
REGION=$2

if [ -z "$BUCKET_NAME" ] || [ -z "$REGION" ]; then
  echo "❌ Uso: ./upload.sh <bucket-name> <region>"
  exit 1
fi

# Subir archivos
aws s3 sync ../dist/ s3://"$BUCKET_NAME"/ --delete --region "$REGION"

echo "✅ Build subido al bucket $BUCKET_NAME"
