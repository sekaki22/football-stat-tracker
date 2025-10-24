#!/bin/bash

set -euo pipefail

# Ensure common PATH entries for cron
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:$PATH"

DOMAIN="statzz.nl"
TIMEOUT_SECS=30

PROJECT_DIR="/home/selim/repos/football-stat-tracker"
LOG_FILE="$PROJECT_DIR/logs/monitor-nginx.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

echo "$(date): Starting nginx HTTPS health check..." >> "$LOG_FILE"

# HTTPS-only health check: require 2xx/3xx via TLS within timeout
if ! curl -fsSIL --max-time "$TIMEOUT_SECS" "https://$DOMAIN" >/dev/null 2>&1; then
  echo "$(date): HTTPS check failed for $DOMAIN, attempting nginx restart" | tee -a "$LOG_FILE" >&2

  # Determine docker compose command (v2 vs v1)
  if docker compose version >/dev/null 2>&1; then
    if docker compose restart nginx >> "$LOG_FILE" 2>&1; then
      echo "$(date): Server restarted via 'docker compose restart nginx'" | tee -a "$LOG_FILE" >&2
      exit 1
    else
      echo "$(date): ERROR: Failed to restart via 'docker compose'" | tee -a "$LOG_FILE" >&2
      exit 1
    fi
  elif command -v docker-compose >/dev/null 2>&1; then
    if docker-compose restart nginx >> "$LOG_FILE" 2>&1; then
      echo "$(date): Server restarted via 'docker-compose restart nginx'" | tee -a "$LOG_FILE" >&2
      exit 1
    else
      echo "$(date): ERROR: Failed to restart via 'docker-compose'" | tee -a "$LOG_FILE" >&2
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


