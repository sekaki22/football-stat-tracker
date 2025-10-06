import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug logs
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT for simpler setup
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
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
  // Use default NextAuth pages
} 