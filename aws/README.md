# AWS Deployment Scripts

Scripts optimizados para despliegue de aplicaciones React.js en AWS S3 con configuración automática y manejo robusto de errores.

## 🚀 Características

- ✅ **Validación automática** de credenciales y configuración AWS
- ✅ **Manejo robusto de errores** con mensajes descriptivos
- ✅ **Logging detallado** con timestamps y colores
- ✅ **Soporte para múltiples perfiles** AWS
- ✅ **Validación de parámetros** antes de ejecutar
- ✅ **Progreso visual** con spinners
- ✅ **Verificación post-despliegue** para asegurar éxito

## 📋 Prerrequisitos

1. **AWS CLI** instalado y configurado
2. **Node.js** y **npm** para construcción
3. **jq** (recomendado para scripts CloudFront)

```bash
# Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciales
aws configure --profile mi-perfil

# Instalar jq (Ubuntu/Debian)
sudo apt-get install jq

# Instalar jq (macOS)
brew install jq
```

## 🛠️ Scripts Disponibles

### 1. `aws-setup.sh` - Configuración y Validación

Script principal para validar y configurar el entorno AWS.

```bash
# Validar configuración actual
./aws-setup.sh --check

# Mostrar ejemplos de uso
./aws-setup.sh --examples

# Inicializar configuración
./aws-setup.sh --setup
```

### 2. `deploy.sh` - Despliegue Principal

Script principal que orquesta todo el proceso de despliegue.

```bash
# Despliegue completo (build + configure + upload)
./deploy.sh -b mi-bucket-unico -r us-east-1

# Despliegue con perfil específico (usando -p)
./deploy.sh -b mi-bucket-unico -p production

# Despliegue con perfil específico (usando variable)
AWS_PROFILE=production ./deploy.sh -b mi-bucket-unico

# Ejecutar acciones específicas
./deploy.sh -b mi-bucket -a build      # Solo construir
./deploy.sh -b mi-bucket -a configure  # Solo configurar bucket
./deploy.sh -b mi-bucket -a upload     # Solo subir archivos
./deploy.sh -b mi-bucket -a cloudfront # Configurar CloudFront
./deploy.sh -b mi-bucket -p prod -a cloudfront # CloudFront con perfil específico
```

**Parámetros:**
- `-b, --bucket NAME` - Nombre del bucket S3 (requerido)
- `-r, --region REGION` - Región AWS (default: us-east-1)
- `-a, --action ACTION` - Acción: build|configure|upload|cloudfront|update-cloudfront|all
- `-p, --profile PROFILE` - Perfil AWS (default: default o $AWS_PROFILE)
- `-s, --source-dir DIR` - Directorio fuente (default: ../dist)

### 3. `build.sh` - Construcción de Aplicación

Construye la aplicación React.js para producción.

```bash
./build.sh
```

**Características:**
- Validación de dependencias (Node.js, npm)
- Limpieza de build anterior
- Verificación post-build
- Reporte de tamaño

### 4. `configure-s3.sh` - Configuración de Bucket S3

Configura un bucket S3 como sitio web estático.

```bash
./configure-s3.sh mi-bucket-unico us-east-1

# Con perfil específico (usando variable)
AWS_PROFILE=production ./configure-s3.sh mi-bucket-unico us-east-1
```

**Características:**
- Creación automática de bucket si no existe
- Configuración de hosting estático
- Política de acceso público
- Desactivación de Block Public Access

### 5. `upload.sh` - Subida de Archivos

Sincroniza archivos del build al bucket S3.

```bash
./upload.sh mi-bucket-unico us-east-1

# Con perfil específico y directorio fuente personalizado
AWS_PROFILE=production ./upload.sh mi-bucket-unico us-east-1 /ruta/a/mi/build
```

**Características:**
- Sincronización inteligente con `--delete`
- Exclusión de archivos temporales
- Verificación post-subida
- Reporte de transferencia

### 6. `configure-cloudfront.sh` - Configuración CloudFront

Configura CloudFront con HTTPS y certificado SSL.

```bash
./configure-cloudfront.sh mi-bucket midominio.com midominio.com us-east-1

# Con perfil específico
./configure-cloudfront.sh mi-bucket midominio.com midominio.com us-east-1 production

# Con wildcard en certificado
./configure-cloudfront.sh mi-bucket midominio.com "*.midominio.com" us-east-1
```

**Características:**
- Búsqueda automática de certificados
- Solicitud de nuevo certificado si no existe
- Validación de estado del certificado
- Configuración completa de distribución

## 🔧 Variables de Ambiente

Las siguientes variables pueden ser configuradas:

```bash
# Perfil AWS a usar
export AWS_PROFILE=production

# Habilitar logs de depuración
export DEBUG_ENABLED=true

# Nombre del módulo para logs
export MODULE_NAME=mi-script
```

## 📁 Estructura de Directorios

```
aws/
├── commons/                 # Utilidades comunes
│   ├── check.sh            # Funciones de validación
│   ├── log.sh              # Sistema de logging
│   ├── validate.sh         # Validaciones de parámetros
│   └── get.sh              # Utilidades de directorio
├── build.sh                # Construcción de app
├── deploy.sh               # Script principal de despliegue
├── configure-s3.sh          # Configuración S3
├── upload.sh               # Subida de archivos
├── configure-cloudfront.sh # Configuración CloudFront
├── update-cloudfront.sh    # Actualización CloudFront
├── aws-setup.sh            # Configuración inicial
└── README.md               # Este archivo
```

## 🚨 Manejo de Errores

Los scripts incluyen manejo robusto de errores para problemas comunes:

### Errores de Credenciales AWS
```bash
# Si AWS_PROFILE no está configurado
❌ AWS credentials not configured for profile 'default'. Please:
1. Run 'aws configure' or 'aws configure --profile default'
2. Or export AWS_PROFILE=<profile_name>
3. Or export AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
```

### Errores de Bucket
```bash
# Si el bucket tiene nombre inválido
❌ Invalid bucket name format: Mi-Bucket. Bucket names must be lowercase and can contain numbers, dots, and hyphens.
```

### Errores de Región
```bash
# Si la región es inválida
❌ Invalid AWS region format: invalid-region. Expected format: us-east-1, us-west-2, etc.
```

## 📊 Logs y Monitoreo

Todos los scripts utilizan un sistema de logging unificado:

```bash
# Niveles de log
SUCCESS ✅ Operación exitosa
INFO    ℹ️ Información general
WARN    ⚠️ Advertencias no críticas
ERROR   ❌ Errores críticos
DEBUG   🔍 Información de depuración (requiere DEBUG_ENABLED=true)
```

Ejemplo de salida:
```
2024-01-29 10:30:15 - build.sh - INFO - Building the application...
2024-01-29 10:30:45 - build.sh - SUCCESS - Build completado. Archivos en ./dist
2024-01-29 10:30:45 - build.sh - INFO - Build size: 2.4M
```

## 🎯 Flujo de Despliegue Recomendado

1. **Validar configuración inicial:**
   ```bash
   ./aws-setup.sh --check
   ```

2. **Despliegue completo para primera vez:**
   ```bash
   ./deploy.sh -b mi-bucket-unico -r us-east-1
   ```

3. **Despliegue con perfil específico:**
   ```bash
   ./deploy.sh -b mi-bucket-unico -p production -a all
   ```

4. **Actualizaciones posteriores (solo contenido):**
   ```bash
   ./deploy.sh -b mi-bucket-unico -a upload
   ```

5. **Configurar HTTPS (opcional):**
   ```bash
   ./configure-cloudfront.sh mi-bucket midominio.com midominio.com us-east-1 production
   ```

## 🛡️ Mejores Prácticas

1. **Usar perfiles separados** para desarrollo y producción
2. **Validar nombres de buckets** antes de usarlos (deben ser únicos globalmente)
3. **Revisar políticas de IAM** para permisos mínimos necesarios
4. **Monitorear costos** de CloudFront y transferencia de datos
5. **Usar versionamiento** para actualizaciones seguras

## 🔍 Troubleshooting

### Problemas Comunes

1. **Bucket ya existe:**
   ```bash
   aws s3 ls | grep mi-bucket  # Verificar si existe
   ```

2. **Permisos insuficientes:**
   ```bash
   aws sts get-caller-identity  # Verificar identidad
   ```

3. **Certificado no validado:**
   ```bash
   aws acm describe-certificate --certificate-arn ARN_DEL_CERT
   ```

4. **CloudFront tarda en propagarse:**
   ```bash
   aws cloudfront get-distribution --id ID_DISTRIBUCION
   ```

## 📚 Referencias

- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [S3 Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Custom SSL](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-procedures.html)
- [ACM Certificate Validation](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html)