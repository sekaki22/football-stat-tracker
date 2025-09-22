# Docker Deployment Guide

This guide explains how to deploy your Football Team Statistics app using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose (usually comes with Docker Desktop)

## Environment Setup

The application uses two separate environment files:

### For Local Development (`.env.local`)
Create a `.env.local` file in the root directory for local development:
```env
DATABASE_URL="file:./data/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ADMIN_EMAILS="admin@example.com,another@example.com"
```

### For Docker Deployment (`.env`)
Create a `.env` file in the root directory for Docker deployment:
```env
DATABASE_URL="file:/app/data/production.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
ADMIN_EMAILS="admin@example.com,another@example.com"
```

**Note**: The `.env.local` file is excluded from Docker builds, so it won't interfere with your production environment.

## Recommended: Docker Compose Deployment

This is the easiest and most recommended approach.

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd vibe_next
   ```

2. **Set up environment variables**:
   - Create `.env.local` for local development (see above)
   - Create `.env` for Docker deployment (see above)

3. **Deploy with Docker Compose**:
   ```bash
   docker compose up --build
   ```

4. **Access the application**:
   Open your browser and go to `http://localhost:3000`

**That's it!** Docker Compose handles everything automatically:
- Building the image
- Setting up environment variables
- Creating and mounting volumes
- Configuring networking
- Applying restart policies

## Alternative: Manual Docker Commands

If you prefer more control or need to integrate with CI/CD pipelines:

1. **Build the image**:
   ```bash
   docker build -t football-stats .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 \
     --env-file .env \
     -v football-data:/app/data \
     football-stats
   ```

**Note**: This approach requires you to manually handle volumes, networking, and restart policies.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | SQLite database file path | Yes | `file:/app/data/production.db` (Docker) / `file:./data/dev.db` (local) |
| `NEXTAUTH_URL` | Your application URL | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes | - |
| `ADMIN_EMAILS` | Comma-separated admin email addresses | Yes | - |

## Data Persistence

The application uses a Docker volume to persist the SQLite database. The database file is stored in `/app/data/production.db` inside the container and is persisted across container restarts.

## Production Deployment

For production deployment, consider the following:

1. **Use a proper database**: Consider migrating from SQLite to PostgreSQL or MySQL for better performance and scalability.

2. **Set up proper environment variables**: Use your actual domain and secrets in the `.env` file.

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

### Environment Variable Issues
If environment variables aren't loading:
1. Ensure `.env` file exists in the root directory
2. Check that the file format is correct (no spaces around `=`)
3. Verify Docker Compose is reading the file correctly

## Development Workflow

### Local Development
```bash
# Uses .env.local automatically
npm run dev
```

### Docker Development
```bash
# Uses .env file via Docker Compose
docker compose up --build
```

### Doing a new deployment to the app
In order to deploy new changes to the app run followig command

```bash 
docker-compose up -d --build app
```

If you also need to do any database migrations because of a schema change you can run additional command

```bash
docker-compose exec app npx prisma migrate deploy
```


### Switching Between Environments
- **Local**: Uses `.env.local` (excluded from Docker)
- **Docker**: Uses `.env` (injected via Docker Compose)
- **No conflicts**: Each environment uses its own file 
