'use client'

import { useState } from 'react'
import Link from 'next/link'
import SignInButton from './SignInButton'
import { NAV_LINKS } from '@/lib/navLinks'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-20 border-b-4 border-rose-500 bg-gray-900">
      <div className="flex justify-between items-center px-3 py-2">
        <Link href="/" onClick={closeMenu} className="flex items-center gap-3 min-w-0">
          <img src="/logo.jpeg" alt="Logo" className="h-9 w-9 rounded shrink-0" />
          <span className="text-base font-bold text-gray-100 truncate">
            Quick 1888 Zaterdag 2
          </span>
        </Link>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-100 hover:text-rose-500 transition-colors p-2 shrink-0"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-800 bg-gray-900">
          <nav className="p-4">
            <ul className="space-y-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    className="block text-gray-100 hover:text-rose-300 hover:bg-gray-800 transition-colors py-2.5 px-3 rounded-md text-sm font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <SignInButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
