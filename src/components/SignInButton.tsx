'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export default function SignInButton() {
  const { data: session } = useSession()

  if (session && session.user) {
    return (
      <div className="flex flex-col items-start gap-2 w-full">
        <p className="text-xs text-gray-300 break-all">
          {session.user.email}
          {session.user.isAdmin && ' (Admin)'}
        </p>
        <button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm w-full"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm w-full"
    >
      Sign In with Google
    </button>
  )
} 