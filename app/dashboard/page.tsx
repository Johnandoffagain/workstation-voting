'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getPhotoUrl } from '@/lib/imageUtils'

type WorkstationWithPhotos = {
  id: string
  title: string | null
  elo_rating: number
  total_votes: number
  created_at: string
  photos: { id: string; storage_path: string; display_order: number }[]
}

type Profile = {
  username: string | null
  display_username: boolean
  opt_out_voting: boolean
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [workstations, setWorkstations] = useState<WorkstationWithPhotos[]>([])
  const [loading, setLoading] = useState(true)
  
  // Profile state
  const [username, setUsername] = useState('')
  const [displayUsername, setDisplayUsername] = useState(false)
  const [optOutVoting, setOptOutVoting] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  useEffect(() => {
    loadWorkstations()
    loadProfile()
  }, [user])

  const loadWorkstations = async () => {
    if (!user) return

    try {
      const { data: workstationsData, error: wsError } = await supabase
        .from('workstations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (wsError) throw wsError

      const workstationsWithPhotos = await Promise.all(
        (workstationsData || []).map(async (ws) => {
          const { data: photos } = await supabase
            .from('photos')
            .select('id, storage_path, display_order')
            .eq('workstation_id', ws.id)
            .order('display_order')

          return { ...ws, photos: photos || [] }
        })
      )

      setWorkstations(workstationsWithPhotos)
    } catch (error) {
      console.error('Error loading workstations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, display_username, opt_out_voting')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setUsername(data.username || '')
        setDisplayUsername(data.display_username || false)
        setOptOutVoting(data.opt_out_voting || false)
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setSavingProfile(true)

    try {
      if (username && username.length < 3) {
        setProfileError('Username must be at least 3 characters')
        setSavingProfile(false)
        return
      }

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          username: username || null,
          display_username: displayUsername,
          opt_out_voting: optOutVoting,
          updated_at: new Date().toISOString(),
        })

      if (upsertError) throw upsertError

      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err: any) {
      if (err.code === '23505') {
        setProfileError('Username already taken')
      } else {
        setProfileError(err.message || 'Failed to update profile')
      }
    } finally {
      setSavingProfile(false)
    }
  }

  const deletePhoto = async (photoId: string, storagePath: string) => {
    if (!confirm('Delete this photo?')) return

    try {
      const { error: storageError } = await supabase.storage
        .from('workstation-photos')
        .remove([storagePath])

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)

      if (dbError) throw dbError

      await loadWorkstations()
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Failed to delete photo')
    }
  }

  const deleteWorkstation = async (workstationId: string) => {
    if (!confirm('Delete this entire workstation? All photos will be removed.')) return

    try {
      const { data: photos } = await supabase
        .from('photos')
        .select('storage_path')
        .eq('workstation_id', workstationId)

      if (photos && photos.length > 0) {
        const paths = photos.map((p) => p.storage_path)
        await supabase.storage.from('workstation-photos').remove(paths)
      }

      const { error } = await supabase
        .from('workstations')
        .delete()
        .eq('id', workstationId)

      if (error) throw error

      await loadWorkstations()
    } catch (error) {
      console.error('Error deleting workstation:', error)
      alert('Failed to delete workstation')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Profile Settings Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
            <div className="bg-gray-950 rounded-lg border border-blue-900/30 p-6 max-w-3xl">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {profileError && (
                  <div className="bg-red-950/50 border border-red-500/50 text-red-300 px-4 py-3 rounded">
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="bg-green-950/50 border border-green-500/50 text-green-300 px-4 py-3 rounded">
                    {profileSuccess}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name (Optional)
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-black border border-blue-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-400">
                      Minimum 3 characters. Can include spaces.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        id="display"
                        type="checkbox"
                        checked={displayUsername}
                        onChange={(e) => setDisplayUsername(e.target.checked)}
                        className="w-5 h-5 rounded border-blue-900/30 bg-black text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="display" className="text-sm text-gray-300">
                        Display my name on the leaderboard
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="optout"
                        type="checkbox"
                        checked={optOutVoting}
                        onChange={(e) => setOptOutVoting(e.target.checked)}
                        className="w-5 h-5 rounded border-blue-900/30 bg-black text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="optout" className="text-sm text-gray-300">
                        Opt out of voting (hide my workstations from voting)
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>

          {/* Workstations Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">My Workstations</h2>
              <Link
                href="/upload"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                + Upload New Workstation
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-300">Loading your workstations...</div>
            ) : workstations.length === 0 ? (
              <div className="text-center py-12 bg-gray-950 rounded-lg border border-blue-900/30">
                <p className="text-gray-400 mb-4">You haven't uploaded any workstations yet.</p>
                <Link
                  href="/upload"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Upload your first workstation →
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {workstations.map((ws) => (
                  <div key={ws.id} className="bg-gray-950 rounded-lg border border-blue-900/30 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {ws.title || 'Untitled Workstation'}
                        </h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-400">
                          <span className="text-blue-400 font-medium">Rating: {ws.elo_rating}</span>
                          <span>Votes: {ws.total_votes}</span>
                          <span>Photos: {ws.photos.length}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteWorkstation(ws.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition"
                      >
                        Delete Workstation
                      </button>
                    </div>

                    {ws.photos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {ws.photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <div className="w-full h-32 bg-black rounded overflow-hidden border border-blue-900/20">
                              <img
                                src={getPhotoUrl(photo.storage_path, 'thumb')}
                                alt="Workstation photo"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <button
                              onClick={() => deletePhoto(photo.id, photo.storage_path)}
                              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No photos uploaded yet</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
