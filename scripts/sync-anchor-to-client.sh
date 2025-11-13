#!/usr/bin/env bash
set -euo pipefail

# Sync anchor/ -> client/public/anchor/
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT_DIR/anchor"
DST="$ROOT_DIR/client/public/anchor"

echo "Root: $ROOT_DIR"
echo "Syncing from $SRC to $DST"
mkdir -p "$DST"
rsync -av --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '*.md' \
  --exclude '*.sql' \
  "$SRC/" "$DST/"

echo "Sync complete. Files copied to $DST"
