'use client'

import { useEffect, useState } from 'react'
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

const PAGE_SIZE = 20

export default function BrowsePage() {
  const [workstations, setWorkstations] = useState<WorkstationWithPhotos[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)
  const [selectedWorkstation, setSelectedWorkstation] = useState<WorkstationWithPhotos | null>(null)

  useEffect(() => {
    loadWorkstations(0)
  }, [])

  const loadWorkstations = async (pageNum: number, append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      const from = pageNum * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      // Get workstations with count
      const { data: workstationsData, error: wsError, count } = await supabase
        .from('workstations')
        .select('id, title, elo_rating, total_votes, created_at, is_dummy, user_id', { count: 'exact' })
        .eq('is_active', true)
        .order('elo_rating', { ascending: false })
        .range(from, to)

      if (wsError) throw wsError

      // Check if there are more results
      setHasMore((count || 0) > (pageNum + 1) * PAGE_SIZE)

      // Load photos and profiles for each workstation
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

      if (append) {
        setWorkstations(prev => [...prev, ...workstationsWithPhotos])
      } else {
        setWorkstations(workstationsWithPhotos)
      }
      setPage(pageNum)
    } catch (error) {
      console.error('Error loading workstations:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    loadWorkstations(page + 1, true)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Browse Workstations</h1>
            <p className="text-gray-400">Explore setups from the community</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-300">Loading workstations...</div>
          ) : workstations.length === 0 ? (
            <div className="text-center py-12 bg-gray-950 rounded-lg border border-blue-900/30">
              <p className="text-gray-400 mb-4">No workstations available to browse.</p>
            </div>
          ) : (
            <>
              {/* Grid of Workstations */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {workstations.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => setSelectedWorkstation(ws)}
                    className="bg-gray-950 rounded-lg border border-blue-900/30 hover:border-blue-500/50 transition cursor-pointer overflow-hidden"
                  >
                    {/* First Photo */}
                    {ws.photos[0] ? (
                      <div className="w-full aspect-video bg-black rounded-t-lg">
                        <img
                          src={getPhotoUrl(ws.photos[0].storage_path, 'medium')}
                          alt={ws.title || 'Workstation'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-black flex items-center justify-center rounded-t-lg">
                        <span className="text-gray-500">No photo</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2 truncate">
                        {ws.title || 'Untitled Workstation'}
                      </h3>
                      
                      {/* Display Name or Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ws.display_username && ws.username && (
                          <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs rounded-full">
                            {ws.username}
                          </span>
                        )}
                        {ws.is_dummy && (
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                            SHOWCASE
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{ws.total_votes} vote{ws.total_votes !== 1 ? 's' : ''}</span>
                        <span>{ws.photos.length} photo{ws.photos.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    Showing {workstations.length} workstations
                  </p>
                </div>
              )}

              {!hasMore && workstations.length >= PAGE_SIZE && (
                <div className="text-center mt-8 text-gray-500 text-sm">
                  No more workstations to load
                </div>
              )}
            </>
          )}
        </main>

        {/* Modal for viewing full workstation */}
        {selectedWorkstation && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedWorkstation(null)}
          >
            <div
              className="bg-gray-950 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-blue-900/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedWorkstation.title || 'Untitled Workstation'}
                    </h2>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedWorkstation.display_username && selectedWorkstation.username && (
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-xs font-semibold rounded-full">
                          {selectedWorkstation.username}
                        </span>
                      )}
                      {selectedWorkstation.is_dummy && (
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                          SHOWCASE
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 text-sm text-gray-400">
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
