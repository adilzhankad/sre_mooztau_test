#!/bin/bash
# Validates required environment variables before deployment.
# Exits with code 1 if any required variable is missing or empty.
set -euo pipefail

ENV_FILE="${1:-.env}"
ERRORS=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_ok()   { echo -e "${GREEN}[OK]${NC}  $1"; }
log_err()  { echo -e "${RED}[FAIL]${NC} $1"; ERRORS=$((ERRORS + 1)); }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

echo "========================================"
echo " MoozTau Config Validation"
echo " Env file: $ENV_FILE"
echo "========================================"

# Load env file
if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}[FAIL]${NC} Env file '$ENV_FILE' not found"
    exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

check_var() {
    local var="$1"
    local val="${!var:-}"
    if [[ -z "$val" ]]; then
        log_err "Required variable '$var' is missing or empty"
    else
        log_ok "$var is set"
    fi
}

echo ""
echo "--- Database ---"
check_var DB_NAME
check_var DB_USER
check_var DB_PASSWORD
check_var DB_HOST
check_var DB_PORT

echo ""
echo "--- Auth ---"
check_var JWT_SECRET
if [[ "${JWT_SECRET:-}" == "secret" || "${JWT_SECRET:-}" == "changeme" || "${JWT_SECRET:-}" == "password" ]]; then
    log_warn "JWT_SECRET looks like a default/weak value — change before production"
fi

echo ""
echo "--- Frontend API URLs ---"
check_var VITE_AUTH_API_URL
check_var VITE_ORDERS_API_URL
check_var VITE_FINANCE_API_URL
check_var VITE_CHAT_API_URL

echo ""
echo "--- Service Connectivity ---"
check_service() {
    local name="$1"
    local host="$2"
    local port="$3"
    if timeout 3 bash -c ">/dev/tcp/$host/$port" 2>/dev/null; then
        log_ok "$name reachable at $host:$port"
    else
        log_warn "$name not reachable at $host:$port (may not be running yet)"
    fi
}

DB_HOST_VAL="${DB_HOST:-localhost}"
DB_PORT_VAL="${DB_PORT:-5432}"

# Only check DB connectivity if not using Docker internal hostname
if [[ "$DB_HOST_VAL" != "db" ]]; then
    check_service "PostgreSQL" "$DB_HOST_VAL" "$DB_PORT_VAL"
else
    log_warn "DB_HOST=db (Docker network) — skipping connectivity check"
fi

echo ""
echo "========================================"
if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}Validation passed — ready to deploy${NC}"
    exit 0
else
    echo -e "${RED}Validation failed — $ERRORS error(s) found${NC}"
    exit 1
fi
