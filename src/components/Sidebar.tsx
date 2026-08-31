'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignInButton from './SignInButton'
import { NAV_LINKS } from '@/lib/navLinks'

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:flex-col fixed top-0 left-0 z-30 h-full w-64 border-r-4 border-rose-500 bg-gray-900">
      <div className="p-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Logo" className="h-11 w-11 rounded shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-100 leading-tight">
              Quick 1888
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              Zaterdag 2
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(pathname, href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-rose-600 text-white'
                      : 'text-gray-200 hover:bg-rose-900 hover:text-rose-300'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <SignInButton />
      </div>
    </aside>
  )
}
