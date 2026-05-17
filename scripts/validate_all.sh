#!/usr/bin/env bash
# Validates all IaC configurations for the MoozTau project.
# Run from project root: bash scripts/validate_all.sh

set -e
cd "$(dirname "$0")/.."

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
header(){ echo ""; echo "==============================="; echo "$1"; echo "==============================="; }

header "1. Docker Compose (local dev)"
if docker compose config --quiet; then
    ok "docker-compose.yml is valid"
else
    fail "docker-compose.yml has errors"
fi

header "2. Docker Stack (Swarm)"
if docker compose -f docker-stack.yml config --quiet; then
    ok "docker-stack.yml is valid"
else
    fail "docker-stack.yml has errors"
fi

header "3. Terraform"
for dir in terraform/existing-server terraform/cloud; do
    if [ -d "$dir" ]; then
        cd "$dir"
        name=$(basename "$dir")
        if terraform fmt -check -recursive > /dev/null 2>&1; then
            ok "terraform/$name fmt — formatted"
        else
            warn "terraform/$name fmt — run 'cd $dir && terraform fmt'"
        fi
        if [ ! -d ".terraform" ]; then
            terraform init -backend=false > /dev/null 2>&1
        fi
        if terraform validate > /dev/null 2>&1; then
            ok "terraform/$name validate — passed"
        else
            fail "terraform/$name validate failed"
        fi
        cd - > /dev/null
    fi
done

header "4. Ansible"
if command -v ansible-playbook > /dev/null; then
    if ansible-playbook --syntax-check -i ansible/inventory.ini ansible/playbook.yml > /dev/null 2>&1; then
        ok "ansible-playbook syntax-check — passed"
    else
        fail "ansible playbook has syntax errors"
    fi
else
    warn "ansible not installed — skipping (brew install ansible)"
fi

header "5. Kubernetes manifests"
if command -v kubeconform > /dev/null; then
    if kubeconform -strict -summary k8s/ > /dev/null 2>&1; then
        ok "kubeconform — all manifests valid"
        kubeconform -strict -summary k8s/
    else
        fail "k8s manifests have errors"
    fi
else
    warn "kubeconform not installed — skipping (brew install kubeconform)"
fi

header "All checks completed"
echo ""
