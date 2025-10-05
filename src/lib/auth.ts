import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from "@/lib/prisma"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  debug: true, // Enable debug logs
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT for simpler setup
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      // List of allowed email domains
      
      if (user.email) {
          return true
        
      }
      
      return false // Deny access to all other emails
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        // Get admin emails from environment variable
        const adminEmailsString = process.env.ADMIN_EMAILS || ''
        const adminEmails = adminEmailsString
          .split(',')
          .map(email => email.trim())
          .filter(Boolean)
        
        token.isAdmin = adminEmails.includes(user.email || '')
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.isAdmin = token.isAdmin as boolean
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
} 