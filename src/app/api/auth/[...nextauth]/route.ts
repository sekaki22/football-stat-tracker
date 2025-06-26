import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

// Get admin emails from environment variable
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id
        ;(session.user as any).isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false
      }
      return session
    },
  },
})

export { handler as GET, handler as POST } 