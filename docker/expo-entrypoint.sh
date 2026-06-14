#!/bin/sh
set -eu

HOST_IP="${REACT_NATIVE_PACKAGER_HOSTNAME:-auto}"

if [ "$HOST_IP" = "auto" ]; then
  HOST_IP="$(ip route get 1.1.1.1 | awk '{ for (i = 1; i <= NF; i++) if ($i == "src") { print $(i + 1); exit } }')"
fi

if [ -z "$HOST_IP" ]; then
  echo "Não foi possível detectar o IP local."
  echo "Defina REACT_NATIVE_PACKAGER_HOSTNAME e EXPO_PUBLIC_API_URL no .env.docker."
  exit 1
fi

export REACT_NATIVE_PACKAGER_HOSTNAME="$HOST_IP"

if [ "${EXPO_PUBLIC_API_URL:-auto}" = "auto" ]; then
  export EXPO_PUBLIC_API_URL="http://${HOST_IP}:3333"
fi

echo "Expo Go: exp://${HOST_IP}:8081"
echo "API: ${EXPO_PUBLIC_API_URL}"
echo "Iniciando Metro em modo LAN. O QR Code será exibido abaixo."

exec npx expo start --lan
