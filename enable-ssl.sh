#!/bin/bash

# Enable SSL configuration
echo "Enabling SSL configuration..."

# Uncomment the SSL server block
sed -i 's/# server {/server {/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     listen 443 ssl;/    listen 443 ssl;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     server_name statzz.nl www.statzz.nl;/    server_name statzz.nl www.statzz.nl;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     ssl_certificate \/etc\/letsencrypt\/live\/statzz.nl\/fullchain.pem;/    ssl_certificate \/etc\/letsencrypt\/live\/statzz.nl\/fullchain.pem;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     ssl_certificate_key \/etc\/letsencrypt\/live\/statzz.nl\/privkey.pem;/    ssl_certificate_key \/etc\/letsencrypt\/live\/statzz.nl\/privkey.pem;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     # SSL configuration/    # SSL configuration/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     ssl_protocols TLSv1.2 TLSv1.3;/    ssl_protocols TLSv1.2 TLSv1.3;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;/    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     ssl_prefer_server_ciphers off;/    ssl_prefer_server_ciphers off;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     location \/ {/    location \/ {/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#         proxy_pass http:\/\/app:3000;/        proxy_pass http:\/\/app:3000;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#         proxy_http_version 1.1;/        proxy_http_version 1.1;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#         proxy_set_header Upgrade \$http_upgrade;/        proxy_set_header Upgrade \$http_upgrade;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#         proxy_set_header Connection '\''upgrade'\'';/        proxy_set_header Connection '\''upgrade'\'';/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#         proxy_set_header Host \$host;/        proxy_set_header Host \$host;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#         proxy_set_header X-Real-IP \$remote_addr;/        proxy_set_header X-Real-IP \$remote_addr;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;/        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#         proxy_set_header X-Forwarded-Proto \$scheme;/        proxy_set_header X-Forwarded-Proto \$scheme;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#         proxy_cache_bypass \$http_upgrade;/        proxy_cache_bypass \$http_upgrade;/g' nginx/conf.d/statzz.nl.conf
sed -i 's/#     }/    }/g' nginx/conf.d/statzz.nl.conf
sed -i 's/# }/}/g' nginx/conf.d/statzz.nl.conf

# Update the HTTP server to redirect to HTTPS
sed -i 's/proxy_pass http:\/\/app:3000;/return 301 https:\/\/\$host\$request_uri;/g' nginx/conf.d/statzz.nl.conf

# Restart nginx
echo "Restarting nginx with SSL enabled..."
docker-compose restart nginx

echo "SSL has been enabled!" 