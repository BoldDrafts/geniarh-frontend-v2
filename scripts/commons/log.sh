#!/bin/bash
#location: scripts/commons/log.sh

# Variable para controlar el nivel de debug
# Establece DEBUG_ENABLED a "true" para habilitar los logs de depuración
DEBUG_ENABLED="${DEBUG_ENABLED:-false}"

# Función de log unificada
log() {
  local level="$1"
  local message="$2"
  
  # Si el nivel es DEBUG y DEBUG_ENABLED no es true, sal del script
  if [[ "$level" == "DEBUG" ]] && [[ "$DEBUG_ENABLED" != "true" ]]; then
    return 0
  fi
  
  # Asigna color según el nivel de log
  local color_code="\033[0m" # Default (NC - No Color)
  case "$level" in
    "SUCCESS")
      color_code="\033[0;32m" # Green (Verde: Éxito)
      ;;
    "INFO")
      color_code="\033[0;34m" # Blue (Azul: Información general)
      ;;
    "WARN")
      color_code="\033[0;33m" # Yellow (Amarillo: Advertencia)
      ;;
    "DEBUG")
      color_code="\033[0;36m" # Cyan (Cyan: Depuración)
      ;;
    "ERROR")
      color_code="\033[0;31m" # Red (Rojo: Error crítico)
      ;;
    *)
      level="UNKNOWN"
      ;;
  esac

  # Imprime el mensaje con formato y color
  echo -e "${color_code}$(date '+%Y-%m-%d %H:%M:%S') - $MODULE_NAME - $level - $message\033[0m"
}

# Función para manejar errores fatales y salir del script
handle_error() {
  local message="$1"
  log "ERROR" "$message"
  exit 1
}