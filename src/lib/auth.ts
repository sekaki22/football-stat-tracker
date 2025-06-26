import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from "@/lib/prisma"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      // List of allowed email domains
      const allowedDomains = ['example.com', 'yourcompany.com']
      // Or specific email addresses
      const allowedEmails = ['admin@example.com', 'user@example.com']
      
      if (user.email) {
        // Check if email domain is allowed
        const emailDomain = user.email.split('@')[1]
        if (allowedDomains.includes(emailDomain)) {
          return true
        }
        
        // Check if specific email is allowed
        if (allowedEmails.includes(user.email)) {
          return true
        }
      }
      
      return false // Deny access to all other emails
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
} 