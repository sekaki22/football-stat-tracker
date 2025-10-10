'use client'

import { useState } from 'react'
import Link from "next/link"
import SignInButton from "./SignInButton"



export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-20 border-b-4 border-rose-500 bg-gray-900">
      {/* Desktop Header */}
      <div className="flex justify-between items-center px-4 py-3">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <Link href="/" onClick={closeMenu}>
            <img src="/logo.jpeg" alt="Logo" className="h-10 w-10 rounded" />
          </Link>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-100">
            Quick 1888 Zaterdag 2 teampagina
          </h2>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-2 text-gray-100 [&>li>a]:hover:text-rose-500 [&>li>a]:transition-colors [&>li>a]:duration-200 [&>li>a]:bg-rose-900 [&>li>a]:p-2 [&>li>a]:rounded-md">
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
              <Link href="/boetes">Boetes</Link>
            </li>
            <li>
              <Link href="/stats">Teamlijst en statistieken</Link>
            </li>
          </ul>
        </nav>

        {/* Desktop Sign In Button */}
        <div className="hidden md:block">
          <SignInButton />
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-100 hover:text-rose-500 transition-colors duration-200 p-2"
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

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <nav className="p-4">
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  onClick={closeMenu}
                  className="block text-gray-100 hover:text-rose-500 transition-colors duration-200 py-2 px-3 rounded hover:bg-gray-700"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/regels" 
                  onClick={closeMenu}
                  className="block text-gray-100 hover:text-rose-500 transition-colors duration-200 py-2 px-3 rounded hover:bg-gray-700"
                >
                  Regels
                </Link>
              </li>
              <li>
                <Link 
                  href="/corvee" 
                  onClick={closeMenu}
                  className="block text-gray-100 hover:text-rose-500 transition-colors duration-200 py-2 px-3 rounded hover:bg-gray-700"
                >
                  Corvee
                </Link>
              </li>
              <li>
                <Link 
                  href="/boetes" 
                  onClick={closeMenu}
                  className="block text-gray-100 hover:text-rose-500 transition-colors duration-200 py-2 px-3 rounded hover:bg-gray-700"
                >
                  Boetes
                </Link>
              </li>
              <li>
                <Link 
                  href="/stats" 
                  onClick={closeMenu}
                  className="block text-gray-100 hover:text-rose-500 transition-colors duration-200 py-2 px-3 rounded hover:bg-gray-700"
                >
                  Teamlijst en statistieken
                </Link>
              </li>
            </ul>
            
            {/* Mobile Sign In Button */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <SignInButton />
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}