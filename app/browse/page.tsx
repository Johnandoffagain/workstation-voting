'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import Carousel from '@/components/Carousel'
import { supabase } from '@/lib/supabase'
import { getPhotoUrl } from '@/lib/imageUtils'

type WorkstationWithPhotos = {
  id: string
  title: string | null
  elo_rating: number
  total_votes: number
  created_at: string
  is_dummy: boolean
  username: string | null
  display_username: boolean
  photos: { id: string; storage_path: string; path: string }[]
}

export default function BrowsePage() {
  const router = useRouter()
  const [workstations, setWorkstations] = useState<WorkstationWithPhotos[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkstations()
  }, [])

  const loadWorkstations = async () => {
    try {
      const { data: workstationsData, error: wsError } = await supabase
        .from('workstations')
        .select('id, title, elo_rating, total_votes, created_at, is_dummy, user_id')
        .eq('is_active', true)
        .order('elo_rating', { ascending: false })

      if (wsError) throw wsError

      const workstationsWithPhotos = await Promise.all(
        (workstationsData || []).map(async (ws) => {
          const { data: photos } = await supabase
            .from('photos')
            .select('id, storage_path')
            .eq('workstation_id', ws.id)
            .order('display_order')

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
      console.error('Error loading workstations:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? workstations.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === workstations.length - 1 ? 0 : prev + 1))
  }

  const currentWorkstation = workstations[currentIndex]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12 text-gray-300">Loading workstations...</div>
          ) : workstations.length === 0 ? (
            <div className="text-center py-12 bg-gray-950 rounded-lg border border-blue-900/30">
              <p className="text-gray-400 mb-4">No workstations available to browse.</p>
              <button
                onClick={() => router.push('/upload')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Upload the first workstation →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Workstation Card */}
              <div className="bg-gray-950 rounded-lg border border-blue-900/30 p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-2xl font-bold text-white">
                        {currentWorkstation.title || 'Untitled Workstation'}
                      </h2>
                      {currentWorkstation.is_dummy && (
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                          SHOWCASE
                        </span>
                      )}
                      {currentWorkstation.display_username && currentWorkstation.username && (
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs font-semibold rounded-full">
                          @{currentWorkstation.username}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-6 text-sm text-gray-400">
                      <span className="font-medium text-blue-400">Rating: {currentWorkstation.elo_rating}</span>
                      <span>Votes: {currentWorkstation.total_votes}</span>
                      <span>Photos: {currentWorkstation.photos.length}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentIndex + 1} / {workstations.length}
                  </div>
                </div>

                {/* Carousel */}
                <Carousel photos={currentWorkstation.photos} getPhotoUrl={getPhotoUrl} />
              </div>

              {/* Navigation */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={goToPrevious}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={goToNext}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Keyboard Hint */}
              <div className="text-center text-sm text-gray-500">
                <p>Use ← → arrow keys to navigate</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
