#!/bin/bash

# Script principal para compilar y desplegar la app ReactJS a S3
# Autor: Elvis Pérez

show_help() {
  echo "🚀 Deploy ReactJS a AWS S3"
  echo ""
  echo "Uso: ./deploy.sh [OPTIONS]"
  echo ""
  echo "Opciones:"
  echo "  -b, --bucket NAME         Nombre del bucket S3"
  echo "  -r, --region REGION       Región AWS (default: us-east-1)"
  echo "  -a, --action ACTION       Acción a realizar: build | configure | upload | all (default: all)"
  echo "  -h, --help                Mostrar esta ayuda"
  echo ""
  echo "Ejemplos:"
  echo "  ./deploy.sh -b mi-bucket"
  echo "  ./deploy.sh --bucket mi-bucket --region us-west-2 --action all"
}

# Valores por defecto
REGION="us-east-1"
ACTION="all"

# Parsear argumentos
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -b|--bucket) BUCKET_NAME="$2"; shift ;;
        -r|--region) REGION="$2"; shift ;;
        -a|--action) ACTION="$2"; shift ;;
        -h|--help) show_help; exit 0 ;;
        *) echo "❌ Opción desconocida: $1"; show_help; exit 1 ;;
    esac
    shift
done

# Validar bucket
if [ -z "$BUCKET_NAME" ]; then
    echo "❌ Error: Debes especificar el nombre del bucket con -b o --bucket"
    show_help
    exit 1
fi

echo "📦 Parámetros:"
echo "  📂 Bucket: $BUCKET_NAME"
echo "  🌎 Región: $REGION"
echo "  🛠 Acción: $ACTION"
echo ""

# Ejecutar acciones según parámetro
if [[ "$ACTION" == "build" || "$ACTION" == "all" ]]; then
    echo "🔨 Ejecutando build..."
    ./build.sh
fi

if [[ "$ACTION" == "configure" || "$ACTION" == "all" ]]; then
    echo "🌐 Configurando bucket S3..."
    ./configure-s3.sh "$BUCKET_NAME" "$REGION"
fi

if [[ "$ACTION" == "upload" || "$ACTION" == "all" ]]; then
    echo "🚀 Subiendo build al bucket..."
    ./upload.sh "$BUCKET_NAME" "$REGION"
fi

if [[ "$ACTION" == "cloudfront" ]]; then
    echo "🌐 Configurando CloudFront..."
    ./configure-cloudfront.sh "$BUCKET_NAME" "$BUCKET_NAME" "$REGION"
fi

if [[ "$ACTION" == "update-cloudfront" ]]; then
    echo "🔄 Actualizando CloudFront..."
    ./update-cloudfront.sh "$BUCKET_NAME" "$BUCKET_NAME" "$REGION"
fi

echo "✅ Proceso completado."
