# Football Team Statistics

A vibed Next.js application for tracking football team statistics, including goals and assists. The application features Google authentication and admin privileges for managing player data. I use it myself for learning purposes and to get more familiar with web development

## Features

- Google Authentication
- Admin-only access for managing players
- Track goals and assists
- View player statistics
- Responsive design with dark mode support

## Tech Stack

- Next.js 15
- TypeScript
- Prisma (SQLite)
- NextAuth.js
- Tailwind CSS

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```
DATABASE_URL=file:./data/dev.db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
ADMIN_EMAILS=comma,separated,admin,emails
```

**NOTE**: In order to find your Google Client ID, look into Google Cloud Console to set it up

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment Options

### Option 1: Docker Deployment (Recommended)

For containerized deployment, see the [Docker Deployment Guide](DOCKER_README.md).

Quick start:
```bash
# Create .env file for Docker
cp .env.local .env
# Edit .env to use production database path: file:/app/data/production.db

# Deploy with Docker Compose
docker compose up --build
```

## License

MIT
