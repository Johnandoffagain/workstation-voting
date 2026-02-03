'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!user) return null

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/browse', label: 'Browse' },
    { href: '/vote', label: 'Vote' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <header className="bg-gray-950 border-b border-blue-900/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-white hover:text-blue-400 transition">
            Workstation Voting
          </Link>
          
          <nav className="flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition ${
                  pathname === link.href
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-blue-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-gray-300 transition"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
