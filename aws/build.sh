#!/bin/bash
# Build ReactJS app

# Load commons
SCRIPT_DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source "${SCRIPT_DIR}/commons/get.sh"
source "${SCRIPT_DIR}/commons/log.sh"

# Set module name for logging
MODULE_NAME="build.sh"

echo "🔨 Compilando la aplicación ReactJS..."

# Detener en caso de error
set -e

# Ir al directorio de la app
cd $(get_script_dir)/..

# Verificar si package.json existe
if [ ! -f "package.json" ]; then
    handle_error "package.json not found. Make sure you're in the correct directory."
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    handle_error "Node.js not installed. Please install Node.js from https://nodejs.org/"
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    handle_error "npm not installed. Please install npm."
fi

log "INFO" "Node.js version: $(node --version)"
log "INFO" "npm version: $(npm --version)"

# Limpiar build anterior
if [ -d "dist" ]; then
    log "INFO" "Cleaning previous build..."
    rm -rf dist
fi

# Instalar dependencias
log "INFO" "Installing dependencies..."
npm install

# Construir la app
log "INFO" "Building the application..."
npm run build

# Verificar que se haya creado el directorio dist
if [ ! -d "dist" ]; then
    handle_error "Build failed: dist directory not created"
fi

# Verificar que exista index.html
if [ ! -f "dist/index.html" ]; then
    handle_error "Build failed: index.html not found in dist directory"
fi

log "SUCCESS" "Build completado. Archivos en ./dist"
log "INFO" "Build size: $(du -sh dist | cut -f1)"
