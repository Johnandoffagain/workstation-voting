'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'


export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (selectedFiles.length < 1) {
      setError('Please select at least 1 photo')
      return
    }
    
    if (selectedFiles.length > 3) {
      setError('Maximum 3 photos allowed')
      return
    }

    setFiles(selectedFiles)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    if (files.length < 1 || files.length > 3) {
      setError('Please select 1-3 photos')
      return
    }

    setUploading(true)
    setError('')

    try {
      const { data: workstation, error: wsError } = await supabase
        .from('workstations')
        .insert({
          user_id: user.id,
          title: title || null,
        })
        .select()
        .single()

      if (wsError) throw wsError

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${workstation.id}/${Date.now()}_${i}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('workstation-photos')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { error: photoError } = await supabase
          .from('photos')
          .insert({
            workstation_id: workstation.id,
            storage_path: fileName,
            display_order: i,
          })

        if (photoError) throw photoError
      }

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload workstation')
      setUploading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
	<Navbar />

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-gray-950 rounded-lg border border-blue-900/30 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-950/50 border border-red-500/50 text-red-300 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Workstation Title (Optional)
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My awesome setup"
                  className="w-full px-4 py-3 bg-black border border-blue-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="photos" className="block text-sm font-medium text-gray-300 mb-2">
                  Photos (1-3 required)
                </label>
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-black border border-blue-900/30 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700"
                  required
                />
                {files.length > 0 && (
                  <p className="mt-2 text-sm text-gray-400">
                    {files.length} photo{files.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {files.map((file, i) => (
                    <div key={i} className="relative">
                      <div className="w-full h-24 bg-black rounded overflow-hidden border border-blue-900/20">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading || files.length < 1 || files.length > 3}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {uploading ? 'Uploading...' : 'Upload Workstation'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 border border-blue-900/30 text-gray-300 font-semibold rounded-lg hover:border-blue-500/50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
