#!/usr/bin/env bash
# Deploy main to the Contabo VPS over Tailscale/SSH, rebuild the app container,
# and save remote logs locally even when the deploy fails.
#
# Usage (from anywhere in the repo):
#   ./scripts/deploy.sh
#   ./scripts/deploy.sh --migrate
#   ./scripts/deploy.sh --skip-push
#   ./scripts/deploy.sh --dry-run

set -euo pipefail

DEPLOY_HOST="${DEPLOY_HOST:-vps-ubuntu}"
DEPLOY_USER="${DEPLOY_USER:-}"
DEPLOY_PATH="${DEPLOY_PATH:-/home/selim/repos/football-stat-tracker}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
HEALTH_URL="${HEALTH_URL:-https://statzz.nl}"
LOG_TAIL="${LOG_TAIL:-200}"
HEALTH_RETRIES="${HEALTH_RETRIES:-12}"
HEALTH_DELAY="${HEALTH_DELAY:-5}"

SKIP_PUSH=0
MIGRATE=0
DRY_RUN=0
NO_LOGS=0

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SSH_TARGET="$DEPLOY_HOST"
SSH_READY=0
CONTROL_PATH=""
LOG_DIR=""
DEPLOY_LOG=""

if [[ -n "$DEPLOY_USER" ]]; then
  SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
fi

log() {
  local msg="${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
  if [[ -n "$DEPLOY_LOG" ]]; then
    echo -e "$msg" | tee -a "$DEPLOY_LOG"
  else
    echo -e "$msg"
  fi
}

success() {
  local msg="${GREEN}✅ $1${NC}"
  if [[ -n "$DEPLOY_LOG" ]]; then
    echo -e "$msg" | tee -a "$DEPLOY_LOG"
  else
    echo -e "$msg"
  fi
}

warning() {
  local msg="${YELLOW}⚠️  $1${NC}"
  if [[ -n "$DEPLOY_LOG" ]]; then
    echo -e "$msg" | tee -a "$DEPLOY_LOG"
  else
    echo -e "$msg"
  fi
}

error() {
  local msg="${RED}❌ $1${NC}"
  if [[ -n "$DEPLOY_LOG" ]]; then
    echo -e "$msg" | tee -a "$DEPLOY_LOG"
  else
    echo -e "$msg"
  fi
}

show_help() {
  cat <<EOF
Deploy ${DEPLOY_BRANCH} to ${SSH_TARGET}:${DEPLOY_PATH}

Usage: $0 [OPTIONS]

Options:
  --skip-push   Do not git push; only pull and rebuild on the VPS
  --migrate     After rebuild, run prisma migrate deploy on the app container
  --no-logs     Skip fetching docker logs after deploy
  --dry-run     Print what would run without changing anything
  -h, --help    Show this help

Environment overrides:
  DEPLOY_HOST      SSH host (default: vps-ubuntu)
  DEPLOY_USER      SSH user (default: from ~/.ssh/config)
  DEPLOY_PATH      Repo path on the VPS
  DEPLOY_BRANCH    Branch to push and pull (default: main)
  HEALTH_URL       URL to probe after deploy (default: https://statzz.nl)

SSH password: type it once when prompted. Later SSH calls reuse that session.
Do not use sudo on the VPS; the deploy user must be able to run docker-compose.
EOF
}

remote_sh() {
  # SSH reads the login password from /dev/tty, so this stays interactive.
  ssh \
    -o ControlMaster=auto \
    -o "ControlPath=${CONTROL_PATH}" \
    -o ControlPersist=10m \
    "$SSH_TARGET" \
    "$@"
}

close_ssh() {
  if [[ -z "$CONTROL_PATH" ]]; then
    return 0
  fi
  ssh -O exit -o "ControlPath=${CONTROL_PATH}" "$SSH_TARGET" >/dev/null 2>&1 || true
}

fetch_remote_logs() {
  if [[ "$NO_LOGS" -eq 1 || "$SSH_READY" -ne 1 || "$DRY_RUN" -eq 1 ]]; then
    return 0
  fi

  log "Fetching container logs from the VPS..."
  remote_sh "cd $(printf '%q' "$DEPLOY_PATH") && (docker-compose logs --tail=${LOG_TAIL} app || docker compose logs --tail=${LOG_TAIL} app)" \
    >"$LOG_DIR/app.log" 2>&1 || true
  remote_sh "cd $(printf '%q' "$DEPLOY_PATH") && (docker-compose logs --tail=${LOG_TAIL} nginx || docker compose logs --tail=${LOG_TAIL} nginx)" \
    >"$LOG_DIR/nginx.log" 2>&1 || true
}

cleanup() {
  local exit_code=$?
  trap - EXIT
  fetch_remote_logs || true
  close_ssh
  if [[ -n "$LOG_DIR" ]]; then
    if [[ $exit_code -ne 0 ]]; then
      error "Deploy failed. Logs saved in ${LOG_DIR}"
    else
      success "Logs saved in ${LOG_DIR}"
    fi
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --skip-push) SKIP_PUSH=1 ;;
      --migrate) MIGRATE=1 ;;
      --no-logs) NO_LOGS=1 ;;
      --dry-run) DRY_RUN=1 ;;
      -h|--help)
        show_help
        exit 0
        ;;
      *)
        echo "Unknown option: $1 (use --help)"
        exit 1
        ;;
    esac
    shift
  done
}

setup_logs() {
  local stamp
  stamp="$(date '+%Y%m%d-%H%M%S')"
  LOG_DIR="${REPO_ROOT}/logs/deploy-${stamp}"
  mkdir -p "$LOG_DIR"
  DEPLOY_LOG="${LOG_DIR}/deploy.log"
  : >"$DEPLOY_LOG"
  # Unix domain sockets cap the path at 104 bytes on macOS; keep this short.
  CONTROL_PATH="/tmp/fst-deploy-%C"
  log "Local log directory: ${LOG_DIR}"
}

require_expected_branch() {
  local current
  current="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$current" != "$DEPLOY_BRANCH" ]]; then
    error "Checked out branch is '${current}', expected '${DEPLOY_BRANCH}'."
    exit 1
  fi
}

require_clean_worktree() {
  local dirty
  dirty="$(
    git status --porcelain \
      | grep -Ev '(^.. prisma/data/|^.. data/dev\.db$)' \
      | grep -Ev '^\?\?' \
      || true
  )"
  if [[ -n "$dirty" ]]; then
    if [[ "$DRY_RUN" -eq 1 ]]; then
      warning "Uncommitted changes would block a real deploy:"
      echo "$dirty" | tee -a "$DEPLOY_LOG"
      return 0
    fi
    error "Uncommitted changes would not be deployed:"
    echo "$dirty" | tee -a "$DEPLOY_LOG"
    exit 1
  fi
}

push_local() {
  if [[ "$SKIP_PUSH" -eq 1 ]]; then
    warning "Skipping git push"
    return 0
  fi

  log "Pushing ${DEPLOY_BRANCH} to origin..."
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "dry-run: git push origin ${DEPLOY_BRANCH}"
    return 0
  fi
  git push origin "$DEPLOY_BRANCH"
  success "Pushed origin/${DEPLOY_BRANCH}"
}

remote_script() {
  cat <<EOF
set -euo pipefail
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:\$PATH"
cd $(printf '%q' "$DEPLOY_PATH")
echo "==> git fetch origin"
git fetch origin
echo "==> git pull --ff-only origin $(printf '%q' "$DEPLOY_BRANCH")"
git pull --ff-only origin $(printf '%q' "$DEPLOY_BRANCH")
echo "==> docker-compose up -d --build app"
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose up -d --build app
elif docker compose version >/dev/null 2>&1; then
  docker compose up -d --build app
else
  echo "Neither docker-compose nor docker compose is available" >&2
  exit 1
fi
EOF

  if [[ "$MIGRATE" -eq 1 ]]; then
    cat <<'EOF'
echo "==> prisma migrate deploy"
if command -v docker-compose >/dev/null 2>&1; then
  docker-compose exec -T app npx prisma migrate deploy
else
  docker compose exec -T app npx prisma migrate deploy
fi
EOF
  fi
}

establish_ssh() {
  log "Connecting to ${SSH_TARGET} (enter SSH password if prompted)..."
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "dry-run: ssh ${SSH_TARGET}"
    return 0
  fi
  local status
  set +e
  remote_sh "true" 2>&1 | tee -a "$DEPLOY_LOG"
  status=${PIPESTATUS[0]}
  set -e
  if [[ $status -ne 0 ]]; then
    error "SSH connection to ${SSH_TARGET} failed (exit ${status})"
    return "$status"
  fi
  SSH_READY=1
  success "SSH session established"
}

run_remote_deploy() {
  log "Running remote pull + rebuild on ${SSH_TARGET}..."
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "dry-run remote script:"
    remote_script | tee -a "$DEPLOY_LOG"
    return 0
  fi

  # Pipe the remote script on stdin so local quoting cannot rewrite it.
  # SSH still reads the login password from /dev/tty, not this pipe.
  local status
  set +e
  remote_script | remote_sh bash -s 2>&1 | tee "$LOG_DIR/remote-session.log" | tee -a "$DEPLOY_LOG"
  status=${PIPESTATUS[1]}
  set -e
  if [[ $status -ne 0 ]]; then
    error "Remote deploy failed (exit ${status})"
    return "$status"
  fi
  success "Remote rebuild finished"
}

health_check() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "dry-run: curl ${HEALTH_URL}"
    return 0
  fi

  log "Checking ${HEALTH_URL}..."
  local i
  for ((i = 1; i <= HEALTH_RETRIES; i++)); do
    if curl -fsSIL --max-time 20 "$HEALTH_URL" >/dev/null 2>&1; then
      success "Health check passed"
      return 0
    fi
    warning "Health check attempt ${i}/${HEALTH_RETRIES} failed, retrying in ${HEALTH_DELAY}s..."
    sleep "$HEALTH_DELAY"
  done
  error "Health check failed for ${HEALTH_URL}"
  return 1
}

main() {
  parse_args "$@"
  cd "$REPO_ROOT"
  setup_logs
  trap cleanup EXIT

  require_expected_branch
  require_clean_worktree
  push_local
  establish_ssh
  run_remote_deploy
  health_check
  success "Deploy complete"
}

main "$@"
