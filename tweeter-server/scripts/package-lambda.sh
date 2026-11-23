#!/usr/bin/env bash
set -euo pipefail

SERVER="$(cd "$(dirname "$0")/.." && pwd)"
SHARED="$(cd "$SERVER/../tweeter-shared" && pwd)"
DIRECT_PACKAGES=(tweeter-shared date-fns uuid bcryptjs)
SDK_PACKAGES=(@aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-s3)

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
for package in "${DIRECT_PACKAGES[@]}"; do
  if [[ ! -d "node_modules/$package" ]]; then
    echo "Missing runtime package: $package" >&2
    exit 1
  fi
  mkdir -p "nodejs/node_modules/$(dirname "$package")"
  cp -RL "node_modules/$package" "nodejs/node_modules/$package"
done

layer_packages="$(node - "${SDK_PACKAGES[@]}" <<'EOF'
const fs = require("fs");
const path = require("path");

const seen = new Set();

function walk(name, required) {
  if (seen.has(name)) {
    return;
  }

  const packageJson = path.join("node_modules", name, "package.json");
  if (!fs.existsSync(packageJson)) {
    if (required) {
      console.error(`Missing runtime package: ${name}`);
      process.exit(1);
    }
    return;
  }

  seen.add(name);
  const manifest = JSON.parse(fs.readFileSync(packageJson, "utf8"));
  for (const dependency of Object.keys(manifest.dependencies ?? {})) {
    walk(dependency, true);
  }
  for (const dependency of Object.keys(manifest.optionalDependencies ?? {})) {
    walk(dependency, false);
  }
}

for (const root of process.argv.slice(2)) {
  walk(root, true);
}

process.stdout.write([...seen].join("\n"));
EOF
)"
while IFS= read -r package; do
  mkdir -p "nodejs/node_modules/$(dirname "$package")"
  cp -RL "node_modules/$package" "nodejs/node_modules/$package"
done <<< "$layer_packages"
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
