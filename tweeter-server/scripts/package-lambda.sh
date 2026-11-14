#!/usr/bin/env bash
set -euo pipefail

SERVER="$(cd "$(dirname "$0")/.." && pwd)"
SHARED="$(cd "$SERVER/../tweeter-shared" && pwd)"
RUNTIME_PACKAGES=(tweeter-shared date-fns uuid)

echo "Building tweeter-shared"
cd "$SHARED"
npm install
npm run build

echo "Building tweeter-server"
cd "$SERVER"
rm -rf node_modules dist nodejs layer.zip function.zip
npm install --omit=dev --install-links
npm run build

echo "Packaging layer"
mkdir -p nodejs/node_modules
for package in "${RUNTIME_PACKAGES[@]}"; do
  if [[ ! -d "node_modules/$package" ]]; then
    echo "Missing runtime package: $package" >&2
    exit 1
  fi
  cp -RL "node_modules/$package" "nodejs/node_modules/$package"
done
rm -rf nodejs/node_modules/tweeter-shared/node_modules

if [[ ! -f nodejs/node_modules/tweeter-shared/dist/index.js ]]; then
  echo "tweeter-shared dist was not included in the layer" >&2
  exit 1
fi

zip -r layer.zip nodejs

echo "Packaging functions"
(
  cd dist
  zip -r ../function.zip .
)

echo "Created $SERVER/layer.zip and $SERVER/function.zip"
