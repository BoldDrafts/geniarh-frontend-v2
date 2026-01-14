#!/bin/bash
# Build ReactJS app

echo "🔨 Compilando la aplicación ReactJS..."

# Detener en caso de error
set -e

# Ir al directorio de la app
cd ..

# Instalar dependencias
npm install

# Construir la app
npm run build

echo "✅ Build completado. Archivos en ./build"
