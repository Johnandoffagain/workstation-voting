'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import Carousel from '@/components/Carousel'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getPhotoUrl } from '@/lib/imageUtils'

type WorkstationPair = {
  w1_id: string
  w1_title: string | null
  w1_rating: number
  w1_photos: { id: string; path: string }[]
  w2_id: string
  w2_title: string | null
  w2_rating: number
  w2_photos: { id: string; path: string }[]
}

export default function VotePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [pair, setPair] = useState<WorkstationPair | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [noPairsLeft, setNoPairsLeft] = useState(false)

  useEffect(() => {
    loadRandomPair()
  }, [user])

  const loadRandomPair = async () => {
    if (!user) return

    setLoading(true)
    setNoPairsLeft(false)

    try {
      const { data, error } = await supabase.rpc('get_random_pair', {
        voter_id: user.id,
      })

      if (error) throw error

      if (!data || data.length === 0) {
        setNoPairsLeft(true)
        setPair(null)
      } else {
        setPair(data[0])
      }
    } catch (error) {
      console.error('Error loading pair:', error)
      alert('Failed to load workstations')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (winnerId: string, loserId: string) => {
    if (!user || voting) return

    setVoting(true)

    try {
      const { error: voteError } = await supabase.from('votes').insert({
        voter_id: user.id,
        winner_id: winnerId,
        loser_id: loserId,
      })

      if (voteError) throw voteError

      const { error: eloError } = await supabase.rpc('update_elo', {
        winner_id: winnerId,
        loser_id: loserId,
      })

      if (eloError) throw eloError

      await loadRandomPair()
    } catch (error) {
      console.error('Error submitting vote:', error)
      alert('Failed to submit vote')
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <div className="text-xl text-gray-300">Loading workstations...</div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (noPairsLeft) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              You've voted on all available workstations!
            </h2>
            <p className="text-gray-400 mb-8">
              Check back later when more workstations are uploaded, or view the current rankings.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/leaderboard')}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                View Leaderboard
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-950 border border-blue-900/30 text-white font-semibold rounded-lg hover:border-blue-500/50 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!pair) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-black">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <div className="text-xl text-gray-300">No workstations available to vote on yet.</div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />

        {/* Voting Interface */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">Which workstation do you prefer?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Compare two setups side-by-side and choose your favorite. Use the arrows to view all photos. 
              Your votes help determine the rankings using an Elo rating system - the same method used in chess tournaments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Workstation */}
            <div className="bg-gray-950 rounded-lg border border-blue-900/30 p-6">
              <h3 className="text-xl font-semibold mb-4 text-center text-white">
                {pair.w1_title || 'Workstation A'}
              </h3>
              <div className="mb-6">
                <Carousel photos={pair.w1_photos} getPhotoUrl={getPhotoUrl} />
              </div>
              <button
                onClick={() => handleVote(pair.w1_id, pair.w2_id)}
                disabled={voting}
                className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {voting ? 'Voting...' : 'Choose This One'}
              </button>
            </div>

            {/* Right Workstation */}
            <div className="bg-gray-950 rounded-lg border border-blue-900/30 p-6">
              <h3 className="text-xl font-semibold mb-4 text-center text-white">
                {pair.w2_title || 'Workstation B'}
              </h3>
              <div className="mb-6">
                <Carousel photos={pair.w2_photos} getPhotoUrl={getPhotoUrl} />
              </div>
              <button
                onClick={() => handleVote(pair.w2_id, pair.w1_id)}
                disabled={voting}
                className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {voting ? 'Voting...' : 'Choose This One'}
              </button>
            </div>
          </div>

          <div className="text-center mt-8 space-y-2">
            <p className="text-sm text-gray-400">
              Photos are displayed anonymously. Use the arrows to browse all photos, then choose your preferred setup!
            </p>
            <details className="text-sm text-gray-500">
              <summary className="cursor-pointer hover:text-gray-400 inline-block">How does ranking work?</summary>
              <p className="mt-2 max-w-2xl mx-auto">
                We use the Elo rating system: when you vote, both workstations' ratings adjust based on the outcome. 
                Winning against a higher-rated setup gains more points than beating a lower-rated one. 
                This ensures fair rankings that reflect true quality over time.
              </p>
            </details>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
