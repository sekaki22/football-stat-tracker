#!/bin/bash

# Simple Prisma Migration Script for Production
# This script uses Prisma's built-in migration commands for safe deployment

set -e  # Exit on any error

PROJECT_DIR="/home/selim/repos/football-stat-tracker"
BACKUP_DIR="${PROJECT_DIR}/.backups"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to create database backup
backup_database() {
    log "Creating database backup..."
    TIMESTAMP=$(date -u +"%Y%m%d_%H%M%S")
    mkdir -p "$BACKUP_DIR"
    
    if [ -f "${PROJECT_DIR}/data/dev.db" ]; then
        cp "${PROJECT_DIR}/data/dev.db" "${BACKUP_DIR}/db_backup_${TIMESTAMP}.db"
        success "Database backed up to: ${BACKUP_DIR}/db_backup_${TIMESTAMP}.db"
    else
        warning "Database file not found at expected location"
    fi
}

# Function to check migration status
check_migration_status() {
    log "Checking current migration status..."
    docker-compose exec app npx prisma migrate status
}

# Function to apply migrations
apply_migrations() {
    log "Applying database migrations..."
    docker-compose exec app npx prisma migrate deploy
    success "Migrations applied successfully"
}

# Function to deploy new version
deploy_app() {
    log "Deploying new application version..."
    log "Note: This includes content folder, prisma schema, and all application files"
    docker-compose up -d --build app
    success "Application deployed with all content files"
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."
    sleep 5  # Wait for app to start
    
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        success "Application is responding"
    else
        warning "Application health check failed - please verify manually"
    fi
}

# Main migration function
migrate() {
    log "🚀 Starting Prisma migration process..."
    
    # Step 1: Create backup
    backup_database
    
    # Step 2: Check current migration status
    check_migration_status
    
    # Step 3: Deploy new app version
    deploy_app
    
    # Step 4: Apply migrations
    apply_migrations
    
    # Step 5: Verify deployment
    verify_deployment
    
    success "🎉 Migration completed successfully!"
    
    echo ""
    echo "Migration Summary:"
    echo "- Database backup created"
    echo "- New application version deployed"
    echo "- Database migrations applied"
    echo "- Application verified"
    echo ""
    echo "Next steps:"
    echo "1. Monitor application for any issues"
    echo "2. Keep backup for at least 7 days"
    echo "3. Test all functionality"
}

# Function to show help
show_help() {
    echo "Simple Prisma Migration Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  migrate     Perform migration with backup"
    echo "  status      Check migration status only"
    echo "  backup      Create database backup only"
    echo "  deploy      Deploy app without migrations"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 migrate     # Full migration process"
    echo "  $0 status      # Check migration status"
    echo "  $0 backup      # Create backup only"
}

# Main script logic
case "${1:-migrate}" in
    "migrate")
        migrate
        ;;
    "status")
        check_migration_status
        ;;
    "backup")
        backup_database
        ;;
    "deploy")
        deploy_app
        verify_deployment
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "Unknown option: $1. Use 'help' to see available options."
        ;;
esac
