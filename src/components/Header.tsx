'use client'

import Link from "next/link"
import SignInButton from "./SignInButton"

export default function Header() {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Link href="/">
        <img src="/logo.jpeg" alt="Logo" className="h-10 w-10 rounded" />
        </Link>
        <h2 className="text-4xl font-bold text-gray-100">Quick 1888 Zaterdag 2 teampagina</h2>
      </div>
      <nav>
        <ul className="flex items-center gap-4 text-gray-100 [&>li>a]:hover:text-rose-500 [&>li>a]:transition-colors [&>li>a]:duration-200">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/regels">Regels</Link>
          </li>
          <li>
            <Link href="/corvee">Corvee</Link>
          </li>
          <li>
            <Link href="/stats">Teamlijst en statistieken</Link>
          </li>
        </ul>
      </nav>
      <SignInButton />
    </div>
  )
}