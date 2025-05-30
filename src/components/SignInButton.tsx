'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export default function SignInButton() {
  const { data: session } = useSession()

  if (session && session.user) {
    return (
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Signed in as {session.user.email}
          {session.user.isAdmin && ' (Admin)'}
        </p>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
    >
      Sign In with Google
    </button>
  )
} 