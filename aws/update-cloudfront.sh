#!/bin/bash
# Actualizar distribución CloudFront para apuntar a un nuevo bucket

# Load commons
SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source "${SCRIPT_DIR}/commons/log.sh"
source "${SCRIPT_DIR}/commons/validate.sh"
source "${SCRIPT_DIR}/commons/check.sh"

# Set module name for logging
MODULE_NAME="update-cloudfront.sh"

# Parse parameters
BUCKET_NAME="$1"
DOMAIN_NAME="$2"
CERT_ALIAS="$3"
REGION="$4"
PROFILE="${5:-${AWS_PROFILE:-default}}"

# Show help function
show_help() {
    cat << EOF
🔄 Actualizar distribución CloudFront

Uso: ./update-cloudfront.sh <bucket-name> <domain-name> <cert-alias> <region> [profile]

Parámetros:
  bucket-name      Nombre del bucket S3 de destino
  domain-name      Nombre de dominio asociado a la distribución
  cert-alias       Alias del certificado SSL (opcional, puede estar vacío "")
  region           Región AWS del bucket
  profile          Perfil de AWS (default: default o \$AWS_PROFILE)

Ejemplos:
  ./update-cloudfront.sh mi-bucket midominio.com midominio.com us-east-1
  ./update-cloudfront.sh mi-bucket midominio.com "" us-east-1 production
  AWS_PROFILE=dev ./update-cloudfront.sh mi-bucket midominio.com midominio.com us-east-1

EOF
}

# Check for help parameter
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Validate required parameters
if [ -z "$BUCKET_NAME" ] || [ -z "$DOMAIN_NAME" ] || [ -z "$REGION" ]; then
    handle_error "❌ Uso: ./update-cloudfront.sh <bucket-name> <domain-name> <cert-alias> <region> [profile]"
fi

# Validate AWS configuration
validate_aws_config "$PROFILE" "$REGION"
validate_s3_bucket "$BUCKET_NAME" "$PROFILE"

log "INFO" "🔄 Actualizando distribución CloudFront para $DOMAIN_NAME (profile: $PROFILE)"

# Completar variables iniciales si están vacías
if [ -z "$BUCKET_NAME" ]; then
  read -p "📦 Introduce el nombre del bucket: " BUCKET_NAME
fi

if [ -z "$DOMAIN_NAME" ]; then
  read -p "🌐 Introduce el nombre del dominio: " DOMAIN_NAME
fi

if [ -z "$CERT_ALIAS" ]; then
  read -p "🔐 Introduce el alias del certificado (opcional, presiona Enter para omitir): " CERT_ALIAS
fi

if [ -z "$REGION" ]; then
  read -p "🌍 Introduce la región AWS (ej: us-east-1): " REGION
fi

# Validar que al menos los parámetros esenciales estén presentes
if [ -z "$BUCKET_NAME" ] || [ -z "$DOMAIN_NAME" ] || [ -z "$REGION" ]; then
  echo "❌ Error: Los parámetros bucket-name, domain-name y region son obligatorios"
  exit 1
fi

# Debug: Mostrar valores de parámetros
echo "🔍 Parámetros configurados:"
echo "   BUCKET_NAME: $BUCKET_NAME"
echo "   DOMAIN_NAME: $DOMAIN_NAME"
echo "   CERT_ALIAS: ${CERT_ALIAS:-'(no especificado)'}"
echo "   REGION: $REGION"

# Buscar las distribuciones asociadas al dominio
log "INFO" "🔍 Buscando distribuciones asociadas a $DOMAIN_NAME..."
DISTRIBUTION_IDS=($(aws cloudfront list-distributions \
  --profile "$PROFILE" \
  --query "DistributionList.Items[?Aliases.Items[?contains(@, '$DOMAIN_NAME')]].Id" \
  --output text))

if [ ${#DISTRIBUTION_IDS[@]} -eq 0 ]; then
  echo "❌ No se encontró ninguna distribución de CloudFront asociada a $DOMAIN_NAME"
  echo "💡 Verifica que el dominio esté correctamente configurado o ejecuta:"
  echo "    aws cloudfront list-distributions --query 'DistributionList.Items[].{Id:Id,Aliases:Aliases.Items}' --output table"
  exit 1
fi

# Si hay más de una, pedir al usuario que elija
if [ ${#DISTRIBUTION_IDS[@]} -gt 1 ]; then
  echo "⚠️ Se encontraron múltiples distribuciones asociadas a $DOMAIN_NAME:"
  for i in "${!DISTRIBUTION_IDS[@]}"; do
    echo " [$((i+1))] ${DISTRIBUTION_IDS[$i]}"
  done
  read -p "👉 Selecciona el número de la distribución a actualizar: " SELECTION
  
  # Validar la selección
  if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -gt ${#DISTRIBUTION_IDS[@]} ]; then
    echo "❌ Selección inválida"
    exit 1
  fi
  
  SELECTED_ID=${DISTRIBUTION_IDS[$((SELECTION-1))]}
else
  SELECTED_ID=${DISTRIBUTION_IDS[0]}
fi

echo "✅ Distribución seleccionada: $SELECTED_ID"

# Crear directorio temporal para archivos de configuración
TEMP_DIR="./temp-cloudfront-$$"
mkdir -p "$TEMP_DIR"
trap "rm -rf $TEMP_DIR" EXIT

# Obtener la configuración actual y el ETag
echo "📥 Obteniendo configuración actual..."
if ! aws cloudfront get-distribution-config \
  --profile "$PROFILE" \
  --id "$SELECTED_ID" > "$TEMP_DIR/current-config.json" 2>/dev/null; then
  handle_error "Error: La distribución $SELECTED_ID no existe o no se puede acceder."
fi

ETAG=$(jq -r '.ETag' "$TEMP_DIR/current-config.json")
jq '.DistributionConfig' "$TEMP_DIR/current-config.json" > "$TEMP_DIR/dist-config.json"

# Validar que la configuración no esté vacía
if [ ! -s "$TEMP_DIR/dist-config.json" ]; then
  echo "❌ Error: La configuración de la distribución está vacía."
  exit 1
fi

# Verificar que el bucket existe y está configurado para hosting web
log "INFO" "🔍 Verificando bucket S3..."
if ! aws s3api head-bucket --profile "$PROFILE" --bucket "$BUCKET_NAME" 2>/dev/null; then
  handle_error "Error: El bucket $BUCKET_NAME no existe o no es accesible"
fi

# Verificar configuración de website
if ! aws s3api get-bucket-website --profile "$PROFILE" --bucket "$BUCKET_NAME" >/dev/null 2>&1; then
  log "WARN" "Advertencia: El bucket $BUCKET_NAME no parece estar configurado para hosting web"
  log "INFO" "Puedes configurarlo con: ./configure-s3.sh $BUCKET_NAME $REGION"
  read -p "¿Continuar de todos modos? (y/N): " CONTINUE
  if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
    log "ERROR" "Operación cancelada"
    exit 1
  fi
fi

# Verificar certificado SSL si se proporciona CERT_ALIAS
if [ -n "$CERT_ALIAS" ]; then
  log "INFO" "🔍 Verificando certificado SSL..."
  CERT_ARN=$(aws acm list-certificates --region us-east-1 --profile "$PROFILE" \
    --query "CertificateSummaryList[?DomainName=='$CERT_ALIAS'].CertificateArn" --output text)
  
  if [ -z "$CERT_ARN" ]; then
    echo "❌ Error: No se encontró un certificado para $CERT_ALIAS en us-east-1"
    echo "💡 Asegúrate de que el certificado existe o ejecuta:"
    echo "    aws acm list-certificates --region us-east-1"
    exit 1
  fi
  
  # Verificar el estado del certificado
  CERT_STATUS=$(aws acm describe-certificate \
    --region us-east-1 \
    --profile "$PROFILE" \
    --certificate-arn "$CERT_ARN" \
    --query "Certificate.Status" --output text)
  
  if [ "$CERT_STATUS" != "ISSUED" ]; then
    echo "❌ Error: El certificado no está en estado ISSUED (actual: $CERT_STATUS)"
    exit 1
  fi
  
  echo "✅ Certificado SSL verificado: $CERT_ARN"
else
  echo "ℹ️ No se especificó certificado SSL, manteniendo configuración actual"
fi

# Mostrar configuración actual del origen
echo "📋 Configuración actual del origen:"
jq -r '.Origins.Items[0] | "  Dominio: \(.DomainName)\n  ID: \(.Id)"' "$TEMP_DIR/dist-config.json"

# Actualizar el origen al nuevo bucket
ORIGIN_ID="S3-$BUCKET_NAME"
NEW_DOMAIN="$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "🔄 Actualizando origen a: $NEW_DOMAIN"

# Validar que el dominio del origen sea válido
if [[ ! "$NEW_DOMAIN" =~ ^[a-zA-Z0-9.-]+\.amazonaws\.com$ ]]; then
  echo "❌ Error: Dominio del origen inválido: $NEW_DOMAIN"
  echo "💡 Verifica que BUCKET_NAME y REGION sean correctos"
  echo "   BUCKET_NAME: $BUCKET_NAME"
  echo "   REGION: $REGION"
  exit 1
fi

# Construir la configuración actualizada
if [ -n "$CERT_ARN" ]; then
  echo "🔐 Actualizando certificado SSL..."
  jq --arg ORIGIN_DOMAIN "$NEW_DOMAIN" \
     --arg ORIGIN_ID "$ORIGIN_ID" \
     --arg CERT_ARN "$CERT_ARN" \
     '.Origins.Items[0].DomainName = $ORIGIN_DOMAIN |
      .Origins.Items[0].Id = $ORIGIN_ID |
      .DefaultCacheBehavior.TargetOriginId = $ORIGIN_ID |
      .Comment = "Distribución para " + $ORIGIN_DOMAIN |
      .ViewerCertificate.ACMCertificateArn = $CERT_ARN |
      .ViewerCertificate.SSLSupportMethod = "sni-only" |
      .ViewerCertificate.MinimumProtocolVersion = "TLSv1.2_2019"' \
     "$TEMP_DIR/dist-config.json" > "$TEMP_DIR/updated-config.json"
else
  jq --arg ORIGIN_DOMAIN "$NEW_DOMAIN" \
     --arg ORIGIN_ID "$ORIGIN_ID" \
     '.Origins.Items[0].DomainName = $ORIGIN_DOMAIN |
      .Origins.Items[0].Id = $ORIGIN_ID |
      .DefaultCacheBehavior.TargetOriginId = $ORIGIN_ID |
      .Comment = "Distribución para " + $ORIGIN_DOMAIN' \
     "$TEMP_DIR/dist-config.json" > "$TEMP_DIR/updated-config.json"
fi

# Verificar que la actualización se aplicó correctamente
if ! jq -e '.Origins.Items[0].DomainName' "$TEMP_DIR/updated-config.json" >/dev/null; then
  echo "❌ Error: No se pudo generar la configuración actualizada"
  exit 1
fi

# Aplicar la actualización
log "INFO" "📤 Aplicando actualización a CloudFront..."
if ! aws cloudfront update-distribution \
  --profile "$PROFILE" \
  --id "$SELECTED_ID" \
  --if-match "$ETAG" \
  --distribution-config "file://$TEMP_DIR/updated-config.json" > /dev/null 2>&1; then
  handle_error "No se pudo actualizar la distribución de CloudFront. Posibles causas:
   - La distribución fue modificada por otro proceso (ETag desactualizado)
   - Permisos insuficientes
   - Configuración inválida"
fi

echo "✅ Distribución actualizada para apuntar a $BUCKET_NAME"

# Verificar invalidaciones pendientes antes de crear una nueva
log "INFO" "🔍 Verificando invalidaciones pendientes..."
PENDING_INVALIDATIONS=$(aws cloudfront list-invalidations \
  --profile "$PROFILE" \
  --distribution-id "$SELECTED_ID" \
  --query 'InvalidationList.Items[?Status==`InProgress`].Id' \
  --output text)

if [ -n "$PENDING_INVALIDATIONS" ] && [ "$PENDING_INVALIDATIONS" != "None" ]; then
  echo "⚠️ Se encontraron invalidaciones en progreso:"
  for inv_id in $PENDING_INVALIDATIONS; do
    echo "   📋 ID: $inv_id"
  done
  
  echo ""
  read -p "¿Deseas esperar a que terminen las invalidaciones pendientes antes de crear una nueva? (Y/n): " WAIT_PENDING
  
  if [[ ! "$WAIT_PENDING" =~ ^[Nn]$ ]]; then
    echo "⏳ Esperando a que terminen las invalidaciones pendientes..."
    
    # Función para monitorear invalidaciones pendientes
    wait_pending_invalidations() {
      local dist_id=$1
      local start_time=$(date +%s)
      
       while true; do
         local pending=$(aws cloudfront list-invalidations \
           --profile "$PROFILE" \
           --distribution-id "$dist_id" \
           --query 'InvalidationList.Items[?Status==`InProgress`].Id' \
           --output text)
        
        if [ -z "$pending" ] || [ "$pending" = "None" ]; then
          echo ""
          echo "✅ Todas las invalidaciones pendientes han terminado"
          break
        fi
        
        # Calcular tiempo transcurrido
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        local minutes=$((elapsed / 60))
        local seconds=$((elapsed % 60))
        
        printf "\r⏳ Esperando invalidaciones pendientes... | Tiempo: %02d:%02d" "$minutes" "$seconds"
        sleep 5
      done
    }
    
    wait_pending_invalidations "$SELECTED_ID"
  else
    echo "⚠️ Continuando con una nueva invalidación a pesar de las pendientes"
  fi
else
  echo "✅ No hay invalidaciones pendientes"
fi

# Invalidar la caché
log "INFO" "🚀 Invalidando la caché de CloudFront..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --profile "$PROFILE" \
  --distribution-id "$SELECTED_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

if [ -n "$INVALIDATION_ID" ]; then
  echo "✅ Caché invalidada exitosamente (ID: $INVALIDATION_ID)"
  
  # Función para monitorear la invalidación
  monitor_invalidation() {
    local dist_id=$1
    local inv_id=$2
    local status=""
    local start_time=$(date +%s)
    
    echo "⏳ Monitoreando progreso de la invalidación..."
    echo "   Presiona Ctrl+C para salir del monitoreo (la invalidación continuará)"
    
    while true; do
       # Obtener el estado actual
       status=$(aws cloudfront get-invalidation \
         --profile "$PROFILE" \
         --distribution-id "$dist_id" \
         --id "$inv_id" \
         --query 'Invalidation.Status' \
         --output text 2>/dev/null)
      
      if [ $? -ne 0 ]; then
        echo "❌ Error al consultar el estado de la invalidación"
        break
      fi
      
      # Calcular tiempo transcurrido
      local current_time=$(date +%s)
      local elapsed=$((current_time - start_time))
      local minutes=$((elapsed / 60))
      local seconds=$((elapsed % 60))
      
      # Mostrar estado con timestamp
      printf "\r🔄 Estado: %-15s | Tiempo: %02d:%02d | ID: %s" \
        "$status" "$minutes" "$seconds" "$inv_id"
      
      # Si está completado, salir del bucle
      if [ "$status" = "Completed" ]; then
        echo ""
        echo "✅ Invalidación completada exitosamente!"
        echo "🕒 Tiempo total: ${minutes}m ${seconds}s"
        break
      fi
      
      # Esperar 5 segundos antes de la siguiente consulta
      sleep 5
    done
  }
  
  # Preguntar si desea monitorear
  echo ""
  read -p "🔍 ¿Deseas monitorear el progreso de la invalidación? (Y/n): " MONITOR
  if [[ "$MONITOR" =~ ^[Nn]$ ]]; then
    echo "⏭️ Saltando monitoreo. Puedes verificar manualmente con:"
    echo "   aws cloudfront get-invalidation --distribution-id $SELECTED_ID --id $INVALIDATION_ID"
  else
    # Configurar trap para manejar Ctrl+C
    trap 'echo ""; echo "⏹️ Monitoreo interrumpido. La invalidación continúa en segundo plano."; trap - INT; return 2>/dev/null || exit 130' INT
    
    monitor_invalidation "$SELECTED_ID" "$INVALIDATION_ID"
    
    # Restaurar trap
    trap - INT
  fi
else
  echo "⚠️ Advertencia: No se pudo invalidar la caché automáticamente"
fi

echo ""
echo "📋 Resumen de la actualización:"
echo "   🌐 Dominio: $DOMAIN_NAME"
echo "   📦 Nuevo bucket: $BUCKET_NAME"
echo "   🆔 Distribución: $SELECTED_ID"
echo "   🔗 Nuevo origen: $NEW_DOMAIN"
if [ -n "$CERT_ARN" ]; then
  echo "   🔐 Certificado SSL: $CERT_ALIAS"
fi
if [ -n "$INVALIDATION_ID" ]; then
  echo "   🗑️ Invalidación: $INVALIDATION_ID"
fi
echo ""
echo "🔧 Comandos útiles:"
echo "   # Verificar estado de la distribución:"
echo "   aws cloudfront get-distribution --id $SELECTED_ID --query 'Distribution.Status'"
if [ -n "$INVALIDATION_ID" ]; then
  echo ""
  echo "   # Verificar estado de la invalidación:"
  echo "   aws cloudfront get-invalidation --distribution-id $SELECTED_ID --id $INVALIDATION_ID"
fi