#!/bin/bash
# Alternative build methods that keep BuildKit enabled

set -e

PROJECT_DIR="/home/selim/repos/football-stat-tracker"
cd "$PROJECT_DIR"

echo "Choose a build method:"
echo "1. Use docker build directly (bypasses compose build issues)"
echo "2. Use buildx with custom TMPDIR"
echo "3. Fix /tmp permissions and use BuildKit"
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "Building with docker build directly..."
    docker build -t football-stat-tracker-app:latest .
    echo "Build complete! Now run: docker-compose up -d app"
    ;;
  2)
    echo "Building with buildx and custom TMPDIR..."
    DOCKER_TMPDIR="${HOME}/docker-tmp"
    mkdir -p "$DOCKER_TMPDIR"
    chmod 1777 "$DOCKER_TMPDIR"
    export TMPDIR="$DOCKER_TMPDIR"
    docker buildx build --load -t football-stat-tracker-app:latest .
    echo "Build complete!"
    ;;
  3)
    echo "Fixing /tmp permissions and using BuildKit..."
    # Ensure /tmp has proper permissions
    sudo chmod 1777 /tmp 2>/dev/null || echo "Note: May need sudo for /tmp permissions"
    # Check /tmp space
    df -h /tmp
    # Build with BuildKit enabled
    DOCKER_BUILDKIT=1 docker-compose build app
    echo "Build complete!"
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac
