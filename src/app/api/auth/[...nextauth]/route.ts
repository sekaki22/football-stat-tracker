import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { Session } from "next-auth"
import { AdapterUser } from "next-auth/adapters"

// Get admin emails from environment variable
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || []

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: Session; user: AdapterUser }) {
      if (session?.user) {
        session.user.id = user.id
        session.user.isAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 