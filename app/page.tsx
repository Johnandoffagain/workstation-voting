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
              Share Your Workspace
            </span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Show Off Your
            <br />
            <span className="text-blue-500">
              Desktop Setup
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload photos of your workspace and browse what others have created. 
            Vote on your favorites and see how setups compare.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-lg"
            >
              Share Your Setup
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
            <h3 className="text-lg font-semibold mb-2 text-white">Share Your Workspace</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Upload 1-3 photos of your desktop setup. Show off your hardware, cable management, and aesthetic.
            </p>
          </div>

          <div className="bg-gray-950 p-8 rounded-lg border border-blue-900/30 hover:border-blue-500/50 transition">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Browse & Discover</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Explore workspaces from the community. Get inspired by different setups and find new ideas.
            </p>
          </div>

          <div className="bg-gray-950 p-8 rounded-lg border border-blue-900/30 hover:border-blue-500/50 transition">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Vote on Favorites</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Compare two setups side-by-side and choose which you prefer. Help the community find great setups.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-600/5 to-blue-600/10 border border-blue-500/20 rounded-xl p-12 text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Simple & Fun
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Create an account, upload your setup, and start exploring what others have built. 
            Vote on the workspaces you like best.
          </p>
          
          <div className="grid md:grid-cols-4 gap-8 text-left max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                1
              </div>
              <h4 className="text-white font-semibold mb-2">Create Account</h4>
              <p className="text-sm text-gray-400">Quick and easy signup</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                2
              </div>
              <h4 className="text-white font-semibold mb-2">Upload Photos</h4>
              <p className="text-sm text-gray-400">Share your workspace</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                3
              </div>
              <h4 className="text-white font-semibold mb-2">Browse & Vote</h4>
              <p className="text-sm text-gray-400">Explore and choose favorites</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                4
              </div>
              <h4 className="text-white font-semibold mb-2">See Rankings</h4>
              <p className="text-sm text-gray-400">Check out top setups</p>
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Share Your Setup?
          </h2>
          <p className="text-gray-400 mb-6">
            Join the community and see how your workspace stacks up.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-lg"
          >
            Get Started Free
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Rankings are just for fun • Focus is on sharing and discovering
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-900/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>© 2024 Workstation Voting. A community for workspace enthusiasts.</p>
        </div>
      </footer>
    </div>
  )
}
