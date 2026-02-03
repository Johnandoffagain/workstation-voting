'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Carousel from '@/components/Carousel'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getPhotoUrl } from '@/lib/imageUtils'
import Navbar from '@/components/Navbar'

type WorkstationWithPhotos = {
  id: string
  user_id: string | null
  title: string | null
  elo_rating: number
  total_votes: number
  created_at: string
  is_dummy: boolean
  username: string | null
  display_username: boolean
  photos: { id: string; storage_path: string; path: string }[]
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [workstations, setWorkstations] = useState<WorkstationWithPhotos[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkstation, setSelectedWorkstation] = useState<WorkstationWithPhotos | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      // Get top 5 workstations sorted by Elo rating
      const { data: workstationsData, error: wsError } = await supabase
        .from('workstations')
        .select('*')
        .eq('is_active', true)
        .order('elo_rating', { ascending: false })
        .limit(5)

      if (wsError) throw wsError

      // Load photos and profiles for each workstation
      const workstationsWithPhotos = await Promise.all(
        (workstationsData || []).map(async (ws) => {
          const { data: photos } = await supabase
            .from('photos')
            .select('id, storage_path')
            .eq('workstation_id', ws.id)
            .order('display_order')

          // Get username if not dummy
          let username = null
          let display_username = false
          if (!ws.is_dummy && ws.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, display_username')
              .eq('id', ws.user_id)
              .single()

            if (profile && profile.display_username) {
              username = profile.username
              display_username = true
            }
          }

          return { 
            ...ws, 
            username,
            display_username,
            photos: (photos || []).map(p => ({ ...p, path: p.storage_path }))
          }
        })
      )

      setWorkstations(workstationsWithPhotos)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white'
    if (rank === 2) return 'bg-gray-400 text-white'
    if (rank === 3) return 'bg-orange-600 text-white'
    return 'bg-blue-600 text-white'
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return ''
  }

  const isUserWorkstation = (ws: WorkstationWithPhotos) => {
    return user && ws.user_id === user.id
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
	<Navbar />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12 text-gray-300">Loading rankings...</div>
          ) : workstations.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-gray-400 mb-4">No workstations have been uploaded yet.</p>
              <button
                onClick={() => router.push('/upload')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Be the first to upload →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workstations.map((ws, index) => {
                const isYours = isUserWorkstation(ws)
                const rank = index + 1
                return (
                  <div
                    key={ws.id}
                    className={`bg-gray-800 rounded-lg border-2 transition cursor-pointer ${
                      isYours
                        ? 'border-green-500 shadow-lg shadow-green-500/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedWorkstation(ws)}
                  >
                    <div className="flex items-center gap-6 p-6">
                      {/* Rank Badge */}
                      <div
                        className={`flex-shrink-0 w-20 h-20 rounded-full flex flex-col items-center justify-center text-xl font-bold ${getRankBadgeColor(
                          rank
                        )}`}
                      >
                        <div className="text-2xl">{getRankEmoji(rank)}</div>
                        <div>#{rank}</div>
                      </div>

                      {/* First Photo */}
                      {ws.photos[0] && (
                        <div className="w-32 h-32 bg-gray-900 rounded-lg overflow-hidden">
                          <img
                            src={getPhotoUrl(ws.photos[0].storage_path, 'thumb')}
                            alt="Workstation"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-semibold text-white">
                            {ws.title || 'Untitled Workstation'}
                          </h3>
                          {isYours && (
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                              YOUR SETUP
                            </span>
                          )}
                          {ws.is_dummy && (
                            <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                              SHOWCASE
                            </span>
                          )}
                          {ws.display_username && ws.username && (
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs font-semibold rounded-full">
                              @{ws.username}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-6 text-sm text-gray-400">
                          <span className="font-medium">Rating: {ws.elo_rating}</span>
                          <span>Votes: {ws.total_votes}</span>
                          <span>Photos: {ws.photos.length}</span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="text-gray-500">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Note about Top 5 */}
          {!loading && workstations.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Showing top 5 workstations. Keep voting to climb the ranks! 🚀
              </p>
            </div>
          )}
        </main>

        {/* Modal for viewing full workstation */}
        {selectedWorkstation && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedWorkstation(null)}
          >
            <div
              className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-2xl font-bold text-white">
                        {selectedWorkstation.title || 'Untitled Workstation'}
                      </h2>
                      {isUserWorkstation(selectedWorkstation) && (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          YOUR SETUP
                        </span>
                      )}
                      {selectedWorkstation.display_username && selectedWorkstation.username && (
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs font-semibold rounded-full">
                          @{selectedWorkstation.username}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <span>Rating: {selectedWorkstation.elo_rating}</span>
                      <span>Votes: {selectedWorkstation.total_votes}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWorkstation(null)}
                    className="text-gray-400 hover:text-gray-300 text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <Carousel photos={selectedWorkstation.photos} getPhotoUrl={getPhotoUrl} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
