#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Ebenezer Tours — dev server"
echo "    Run this script from WSL (Ubuntu), not Windows PowerShell on \\\\wsl$ paths."
echo ""

if [ ! -d node_modules ] || [ ! -f node_modules/.bin/vite ]; then
  echo "==> Installing dependencies..."
  rm -rf node_modules package-lock.json 2>/dev/null || true
  npm install
fi

echo ""
echo "==> Starting Vite on http://localhost:3000"
npm run dev
