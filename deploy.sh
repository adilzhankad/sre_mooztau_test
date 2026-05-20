#!/bin/bash
set -e

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEPLOY_DIR"

echo "==> Validating configuration..."
bash validate_config.sh .env

echo "==> Pulling latest code..."
# Hard-sync to origin: the server is a deploy mirror, not a place to commit.
# Avoids "divergent branches" failures when local history drifts. .env is
# gitignored, so secrets on the server are not touched.
git fetch origin main
git reset --hard origin/main

# Note: --build removed — the 2GB VPS cannot run parallel pip installs without OOM.
# Run `docker compose build <service>` manually after changing a service's source code.
echo "==> Restarting containers with existing images..."
docker compose up -d --no-build

echo "==> Done! Running containers:"
docker compose ps
