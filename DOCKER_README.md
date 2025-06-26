# Docker Deployment Guide

This guide explains how to deploy your Football Team Statistics app using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd vibe_next
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL="file:/app/data/production.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

3. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   Open your browser and go to `http://localhost:3000`

## Manual Docker Commands

If you prefer to use Docker commands directly:

1. **Build the image**:
   ```bash
   docker build -t football-stats .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="file:/app/data/production.db" \
     -e NEXTAUTH_URL="http://localhost:3000" \
     -e NEXTAUTH_SECRET="your-secret-key-here" \
     -v football-data:/app/data \
     football-stats
   ```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | SQLite database file path | Yes | `file:/app/data/production.db` |
| `NEXTAUTH_URL` | Your application URL | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes | - |

## Data Persistence

The application uses a Docker volume to persist the SQLite database. The database file is stored in `/app/data/production.db` inside the container and is persisted across container restarts.

## Production Deployment

For production deployment, consider the following:

1. **Use a proper database**: Consider migrating from SQLite to PostgreSQL or MySQL for better performance and scalability.

2. **Set up proper environment variables**: Use your actual domain and secrets.

3. **Configure reverse proxy**: Use Nginx or similar to handle SSL termination and load balancing.

4. **Set up monitoring**: Consider using Docker health checks and monitoring tools.

## Troubleshooting

### Database Issues
If you encounter database-related errors:
1. Check that the volume is properly mounted
2. Ensure the application has write permissions to `/app/data`
3. Verify the `DATABASE_URL` environment variable is correct

### Port Issues
If port 3000 is already in use:
1. Change the port mapping in `docker-compose.yml`
2. Or stop the service using port 3000

### Build Issues
If the build fails:
1. Ensure all dependencies are properly listed in `package.json`
2. Check that the Dockerfile is in the root directory
3. Verify that `.dockerignore` is not excluding necessary files

## Development with Docker

For development, you can also use Docker:

```bash
# Build development image
docker build -t football-stats-dev .

# Run with development environment
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e DATABASE_URL="file:/app/data/dev.db" \
  -v $(pwd):/app \
  -v /app/node_modules \
  football-stats-dev
``` 