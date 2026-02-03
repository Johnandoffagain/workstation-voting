'use client'

import { useState } from 'react'

type Photo = {
  id: string
  path: string
}

type CarouselProps = {
  photos: Photo[]
  getPhotoUrl: (path: string, size?: 'thumb' | 'medium' | 'full') => string
}

export default function Carousel({ photos, getPhotoUrl }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  const openFullscreen = () => {
    setIsFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  if (photos.length === 0) {
    return (
      <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center border border-blue-900/20">
        <p className="text-gray-400">No photos</p>
      </div>
    )
  }

  return (
    <>
      <div className="relative">
        {/* Main Image */}
        <div className="relative w-full h-[500px] bg-black rounded-lg overflow-hidden border border-blue-900/20">
          <img
            src={getPhotoUrl(photos[currentIndex].path, 'medium')}
            alt={`Photo ${currentIndex + 1}`}
            className="w-full h-full object-contain cursor-zoom-in"
            onClick={openFullscreen}
          />

          {/* Navigation Arrows (only show if multiple photos) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Photo Counter */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm z-10">
            {currentIndex + 1} / {photos.length}
          </div>

          {/* Click to zoom hint */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs z-10">
            Click to zoom
          </div>
        </div>

        {/* Thumbnail Navigation (only show if multiple photos) */}
        {photos.length > 1 && (
          <div className="flex gap-2 mt-4 justify-center">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => goToIndex(index)}
                className={`w-16 h-16 rounded overflow-hidden border-2 transition ${
                  index === currentIndex
                    ? 'border-blue-500 opacity-100'
                    : 'border-blue-900/30 opacity-50 hover:opacity-75'
                }`}
              >
                <img
                  src={getPhotoUrl(photo.path, 'thumb')}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={closeFullscreen}
        >
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-50"
          >
            ×
          </button>

          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={getPhotoUrl(photos[currentIndex].path, 'full')}
              alt={`Photo ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation in fullscreen (only if multiple photos) */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-4 rounded-full transition"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Photo counter in fullscreen */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
