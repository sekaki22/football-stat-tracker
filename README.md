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
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
ADMIN_EMAILS=comma,separated,admin,emails
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setting up Google Authentication

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials"
5. Create an OAuth 2.0 Client ID
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.com/api/auth/callback/google` (for production)

## Admin Access

To grant admin access to users:
1. Add their Google email addresses to the `ADMIN_EMAILS` environment variable
2. Separate multiple emails with commas
3. Users need to sign in with their Google account to get admin privileges

## License

MIT
