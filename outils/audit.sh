#!/usr/bin/env bash
# Mesure la charge de chaque écran. Voir references/ecrire.md.
#   ./outils/audit.sh                              deck servi sur 8790
#   ./outils/audit.sh http://127.0.0.1:8080/deck/  autre adresse
set -euo pipefail
ICI="$(cd "$(dirname "$0")" && pwd)"
TRAVAIL="$ICI/../.outils"
mkdir -p "$TRAVAIL"
if [ ! -d "$TRAVAIL/node_modules/playwright-core" ]; then
  ( cd "$TRAVAIL" && (bun add playwright-core >/dev/null 2>&1 || npm install --silent playwright-core) )
fi
cp "$ICI/audit-fr.mjs" "$TRAVAIL/"
node "$TRAVAIL/audit-fr.mjs" "${1:-http://127.0.0.1:8790/index.html}"
