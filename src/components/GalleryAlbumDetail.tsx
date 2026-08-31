'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

type GalleryPhoto = {
  id: number
  description: string | null
}

type GalleryAlbum = {
  id: number
  title: string | null
  description: string | null
  createdAt: string | Date
  photos: GalleryPhoto[]
}

interface GalleryAlbumDetailProps {
  album: GalleryAlbum
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function GalleryAlbumDetail({ album }: GalleryAlbumDetailProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null)
  const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null)

  const isAdmin = session?.user?.isAdmin === true
  const selectedPhoto = album.photos.find((p) => p.id === selectedPhotoId)

  async function handleDeletePhoto(photoId: number) {
    if (!confirm('Weet je zeker dat je deze foto wilt verwijderen?')) return

    setDeletingPhotoId(photoId)
    try {
      const response = await fetch(`/api/gallery/photos/${photoId}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Verwijderen mislukt')
      }

      if (album.photos.length <= 1) {
        router.push('/fotogallerij')
      } else {
        setSelectedPhotoId(null)
        router.refresh()
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Verwijderen mislukt')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  return (
    <>
      <Link
        href="/fotogallerij"
        className="inline-flex items-center text-rose-500 hover:text-rose-600 dark:text-rose-400 mb-6"
      >
        ← Terug naar galerij
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {album.title ?? (album.photos.length === 1 ? 'Foto' : 'Fotoalbum')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {formatDate(album.createdAt)} • {album.photos.length} foto{album.photos.length !== 1 ? "'s" : ''}
        </p>
        {album.description && (
          <p className="mt-3 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            {album.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {album.photos.map((photo) => (
          <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setSelectedPhotoId(photo.id)}
              className="block w-full aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/gallery/photos/${photo.id}`}
                alt={photo.description ?? album.title ?? 'Galerij foto'}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </button>
            {photo.description && (
              <p className="p-3 text-sm text-gray-600 dark:text-gray-300">{photo.description}</p>
            )}
            {isAdmin && (
              <div className="px-3 pb-3">
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={deletingPhotoId === photo.id}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 disabled:opacity-50"
                >
                  {deletingPhotoId === photo.id ? 'Verwijderen...' : 'Verwijderen'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoId(null)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/gallery/photos/${selectedPhoto.id}`}
              alt={selectedPhoto.description ?? album.title ?? 'Galerij foto'}
              className="max-h-[80vh] w-full object-contain rounded-lg"
            />
            {selectedPhoto.description && (
              <p className="mt-4 text-center text-white text-sm">{selectedPhoto.description}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
