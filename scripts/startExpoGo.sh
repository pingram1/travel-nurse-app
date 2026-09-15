#!/usr/bin/env bash
# Start the Metro dev server for physical-device testing via Expo Go.
# Does not open the web build — use `npm run web` when you explicitly want web.
#
# Usage: npm run start:expo-go
#        npm run start:expo-go -- --tunnel   # same Wi‑Fi not required

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TUNNEL=false
CLEAR=false
EXTRA_ARGS=()

for arg in "$@"; do
  case "$arg" in
    --tunnel)
      TUNNEL=true
      ;;
    --clear)
      CLEAR=true
      ;;
    *)
      EXTRA_ARGS+=("$arg")
      ;;
  esac
done

EXPO_ARGS=(start --go --lan)

if [[ "$TUNNEL" == true ]]; then
  EXPO_ARGS=(start --go --tunnel)
fi

if [[ "$CLEAR" == true ]]; then
  EXPO_ARGS+=(--clear)
fi

if [[ ${#EXTRA_ARGS[@]} -gt 0 ]]; then
  EXPO_ARGS+=("${EXTRA_ARGS[@]}")
fi

echo "==> Travel Nurse App — Expo Go (mobile only)"
echo "    Project: $ROOT"
echo
echo "    Dev server: this terminal (Metro + QR code below)"
echo "    Client:     Expo Go on your phone (App Store / Google Play)"
echo
echo "    Tips:"
echo "      • Phone and Mac must be on the same Wi‑Fi (unless you passed --tunnel)"
echo "      • Scan the QR code shown below — do not open http://localhost:8081 in a browser"
echo "      • Press Ctrl+C here to stop the dev server"
echo "      • For web preview instead, run: npm run web"
echo

exec npx expo "${EXPO_ARGS[@]}"
