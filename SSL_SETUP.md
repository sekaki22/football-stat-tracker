# SSL Certificate Setup Guide

This guide will help you set up SSL certificates for your domain using Let's Encrypt and Certbot.

## Prerequisites

1. Your domain (statzz.nl) must be pointing to your server's IP address
2. Ports 80 and 443 must be open on your server
3. Docker and Docker Compose must be installed

## Step-by-Step Setup

### 1. Update the init-ssl.sh script

Before running the script, edit `init-ssl.sh` and replace `your-email@example.com` with your actual email address:

```bash
nano init-ssl.sh
```

Change this line:
```bash
--email your-email@example.com \
```

To your actual email:
```bash
--email your-actual-email@domain.com \
```

### 2. Start your application

First, start your application without SSL:

```bash
docker-compose up -d app
```

### 3. Initialize SSL certificates

Run the initialization script:

```bash
./init-ssl.sh
```

This script will:
- Create necessary directories for certbot
- Start nginx without SSL
- Obtain SSL certificates from Let's Encrypt
- Restart nginx

### 4. Enable SSL

After the certificates are successfully obtained, enable SSL:

```bash
./enable-ssl.sh
```

This will:
- Uncomment the SSL server block in the nginx configuration
- Update the HTTP server to redirect to HTTPS
- Restart nginx with SSL enabled

### 5. Verify the setup

Check that everything is working:

```bash
# Check if certificates exist
docker-compose exec nginx ls -la /etc/letsencrypt/live/statzz.nl/

# Test the SSL connection
curl -I https://statzz.nl
```

## Troubleshooting

### Common Issues

1. **Certificate Authority failed to download challenge files**
   - Make sure your domain is pointing to the correct IP address
   - Ensure port 80 is open and accessible
   - Check that nginx is running and serving the ACME challenge files

2. **Nginx fails to start**
   - Check the nginx configuration syntax: `docker-compose exec nginx nginx -t`
   - Make sure the SSL certificate files exist

3. **Certificates not found**
   - Run the init-ssl.sh script again
   - Check the certbot logs: `docker-compose logs certbot`

### Manual Certificate Renewal

#### Quick Renewal (Recommended)
To manually renew certificates:

```bash
# Navigate to your project directory
cd /home/selim/repos/football-stat-tracker

# Renew certificates
docker-compose run --rm certbot renew

# Reload nginx to use new certificates
docker-compose exec nginx nginx -s reload
```

#### Detailed Manual Renewal Process

1. **Check Certificate Status:**
   ```bash
   # Check current certificate expiration
   openssl s_client -connect statzz.nl:443 -servername statzz.nl < /dev/null 2>/dev/null | openssl x509 -noout -dates
   
   # Check local certificate files
   sudo ls -la certbot/conf/live/statzz.nl/
   ```

2. **Renew Certificates:**
   ```bash
   # Run renewal command
   docker-compose run --rm certbot renew
   
   # If renewal fails, check logs
   docker-compose logs certbot
   ```

3. **Reload Nginx:**
   ```bash
   # Test nginx configuration
   docker-compose exec nginx nginx -t
   
   # Reload nginx configuration
   docker-compose exec nginx nginx -s reload
   ```

4. **Verify Renewal:**
   ```bash
   # Check new certificate expiration
   openssl s_client -connect statzz.nl:443 -servername statzz.nl < /dev/null 2>/dev/null | openssl x509 -noout -dates
   
   # Test HTTPS connection
   curl -I https://statzz.nl
   ```

#### Using the Automated Renewal Script

You can also use the automated renewal script:

```bash
# Run the renewal script manually
./scripts/renew-ssl.sh

# Check renewal logs
tail -f /var/log/certbot-renewal.log
```

### Automatic Renewal

Add this to your crontab for automatic renewal:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2:30 AM)
30 2 * * * cd /path/to/football-stat-tracker && docker-compose run --rm certbot renew && docker-compose restart nginx
```

## Configuration Files

The setup uses these key files:
- `nginx/conf.d/statzz.nl.conf` - Nginx server configuration
- `nginx/nginx.conf` - Main nginx configuration
- `docker-compose.yml` - Docker services configuration
- `init-ssl.sh` - SSL initialization script
- `enable-ssl.sh` - SSL enabling script

## Security Notes

- SSL certificates are automatically renewed by Let's Encrypt
- The configuration uses modern SSL protocols (TLS 1.2 and 1.3)
- HTTP traffic is redirected to HTTPS
- Proper security headers are set in the proxy configuration 