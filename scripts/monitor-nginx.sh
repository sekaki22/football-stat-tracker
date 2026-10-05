#!/bin/bash

set -euo pipefail

# Ensure common PATH entries for cron
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:$PATH"

DOMAIN="statzz.nl"
TIMEOUT_SECS=30

PROJECT_DIR="/home/selim/repos/football-stat-tracker"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
LOG_YEAR="$(date +%Y)"
LOG_MONTH="$(date +%m)"
LOG_DAY="$(date +%d)"
LOG_DIR="$PROJECT_DIR/logs/$LOG_YEAR/$LOG_MONTH/$LOG_DAY"
LOG_FILE="$LOG_DIR/$LOG_DAY.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Docker commands are often run from cron with a different working directory,
# so explicitly anchor to the project root and compose file.
cd "$PROJECT_DIR" || {
  echo "$(date): ERROR: Could not access project directory $PROJECT_DIR" | tee -a "$LOG_FILE" >&2
  exit 1
}

echo "$(date): Starting nginx HTTPS health check..." >> "$LOG_FILE"

# HTTPS-only health check: require 2xx/3xx via TLS within timeout
if ! curl -fsSIL --max-time "$TIMEOUT_SECS" "https://$DOMAIN" >/dev/null 2>&1; then
  echo "$(date): HTTPS check failed for $DOMAIN, attempting nginx restart" | tee -a "$LOG_FILE" >&2

  # Log the project state before a restart so future outages are diagnosable.
  if docker compose -f "$COMPOSE_FILE" ps --services >/dev/null 2>&1; then
    echo "$(date): Docker services available: $(docker compose -f "$COMPOSE_FILE" ps --services | tr '\n' ' ' 2>/dev/null)" >> "$LOG_FILE"
  else
    echo "$(date): ERROR: Docker compose project is not available for $COMPOSE_FILE" | tee -a "$LOG_FILE" >&2
  fi

  # Determine docker compose command (v2 vs v1) and explicitly pass the compose file.
  if docker compose -f "$COMPOSE_FILE" version >/dev/null 2>&1; then
    if docker compose -f "$COMPOSE_FILE" ps --services 2>/dev/null | grep -qx 'nginx'; then
      if docker compose -f "$COMPOSE_FILE" restart nginx >> "$LOG_FILE" 2>&1; then
        echo "$(date): Server restarted via 'docker compose -f $COMPOSE_FILE restart nginx'" | tee -a "$LOG_FILE" >&2
        exit 1
      else
        echo "$(date): ERROR: Failed to restart via 'docker compose -f $COMPOSE_FILE'" | tee -a "$LOG_FILE" >&2
        exit 1
      fi
    else
      echo "$(date): ERROR: nginx service is missing from the compose project" | tee -a "$LOG_FILE" >&2
      exit 1
    fi
  elif command -v docker-compose >/dev/null 2>&1; then
    if docker-compose -f "$COMPOSE_FILE" ps --services 2>/dev/null | grep -qx 'nginx'; then
      if docker-compose -f "$COMPOSE_FILE" restart nginx >> "$LOG_FILE" 2>&1; then
        echo "$(date): Server restarted via 'docker-compose -f $COMPOSE_FILE restart nginx'" | tee -a "$LOG_FILE" >&2
        exit 1
      else
        echo "$(date): ERROR: Failed to restart via 'docker-compose -f $COMPOSE_FILE'" | tee -a "$LOG_FILE" >&2
        exit 1
      fi
    else
      echo "$(date): ERROR: nginx service is missing from the compose project" | tee -a "$LOG_FILE" >&2
      exit 1
    fi
  else
    if docker restart football-stat-tracker-nginx-1 >> "$LOG_FILE" 2>&1; then
      echo "$(date): Server restarted via 'docker restart football-stat-tracker-nginx-1'" | tee -a "$LOG_FILE" >&2
      exit 1
    else
      echo "$(date): ERROR: Docker not available to restart nginx" | tee -a "$LOG_FILE" >&2
      exit 1
    fi
  fi
fi

echo "$(date): Server is healthy for $DOMAIN" >> "$LOG_FILE"
exit 0


