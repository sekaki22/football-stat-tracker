#!/bin/bash

# Create necessary directories
mkdir -p certbot/www
mkdir -p certbot/conf

# Start nginx without SSL first
echo "Starting nginx without SSL..."
docker-compose up -d nginx

# Wait for nginx to be ready
echo "Waiting for nginx to be ready..."
sleep 10

# Run certbot to obtain certificates
echo "Obtaining SSL certificates..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email selimbernt@hotmail.com \
    --agree-tos \
    --no-eff-email \
    -d statzz.nl \
    -d www.statzz.nl

# Restart nginx with SSL
echo "Restarting nginx with SSL..."
docker-compose restart nginx

echo "SSL setup complete!" 