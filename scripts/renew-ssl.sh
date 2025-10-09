#!/bin/bash

# SSL Certificate Auto-Renewal Script
# This script automatically renews SSL certificates and reloads nginx

PROJECT_DIR="/home/selim/repos/football-stat-tracker"
LOG_FILE="/var/log/certbot-renewal.log"

echo "$(date): Starting certificate renewal check..." >> "$LOG_FILE"

# Change to project directory
cd "$PROJECT_DIR"

# Run certificate renewal
if docker-compose run --rm certbot renew >> "$LOG_FILE" 2>&1; then
    echo "$(date): Certificate renewal successful" >> "$LOG_FILE"
    
    # Reload nginx to use new certificates
    if docker-compose exec nginx nginx -s reload >> "$LOG_FILE" 2>&1; then
        echo "$(date): Nginx reloaded successfully" >> "$LOG_FILE"
    else
        echo "$(date): ERROR: Failed to reload nginx" >> "$LOG_FILE"
    fi
else
    echo "$(date): Certificate renewal failed or no renewal needed" >> "$LOG_FILE"
fi

echo "$(date): Certificate renewal check completed" >> "$LOG_FILE"
