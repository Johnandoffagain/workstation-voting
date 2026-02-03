'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-blue-600/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-semibold mb-4">
              Community-Driven Rankings
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Compete for the
            <br />
            <span className="text-blue-500">
              Best Workstation
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload your setup. Vote on others. Climb the leaderboard.
            <br />
            Discover what makes the perfect workspace.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-gray-950 text-white font-semibold rounded-lg border-2 border-blue-900/30 hover:border-blue-500/50 transition text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-gray-950 p-8 rounded-lg border border-blue-900/30 hover:border-blue-500/50 transition">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Upload Your Setup</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Share 1-3 photos of your workstation and showcase your style.
            </p>
          </div>

          <div className="bg-gray-950 p-8 rounded-lg border border-blue-900/30 hover:border-blue-500/50 transition">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Vote & Compare</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Browse setups side-by-side and choose your favorites.
            </p>
          </div>

          <div className="bg-gray-950 p-8 rounded-lg border border-blue-900/30 hover:border-blue-500/50 transition">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Climb the Ranks</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Earn Elo rating as others vote. Reach the top 5 leaderboard.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-600/5 to-blue-600/10 border border-blue-500/20 rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 text-left max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                1
              </div>
              <h4 className="text-white font-semibold mb-2">Sign Up</h4>
              <p className="text-sm text-gray-400">Create your account</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                2
              </div>
              <h4 className="text-white font-semibold mb-2">Upload</h4>
              <p className="text-sm text-gray-400">Share your workstation</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                3
              </div>
              <h4 className="text-white font-semibold mb-2">Vote</h4>
              <p className="text-sm text-gray-400">Compare and choose</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                4
              </div>
              <h4 className="text-white font-semibold mb-2">Rank Up</h4>
              <p className="text-sm text-gray-400">Watch your rating climb</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Compete?
          </h2>
          <p className="text-gray-400 mb-8">
            Join the community and see where your setup ranks.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-lg"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-900/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>© 2024 Workstation Voting. Powered by community.</p>
        </div>
      </footer>
    </div>
  )
}
