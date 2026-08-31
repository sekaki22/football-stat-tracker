'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import GalleryUploadForm from './GalleryUploadForm'

type GalleryPhoto = {
  id: number
  description: string | null
  sortOrder: number
}

type GalleryAlbum = {
  id: number
  title: string | null
  description: string | null
  createdAt: string | Date
  photos: GalleryPhoto[]
}

interface GalleryViewProps {
  albums: GalleryAlbum[]
}

function getAlbumLabel(album: GalleryAlbum) {
  if (album.title) return album.title
  if (album.photos.length === 1) return 'Foto'
  return `${album.photos.length} foto's`
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function GalleryView({ albums }: GalleryViewProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showUpload, setShowUpload] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const isAdmin = session?.user?.isAdmin === true

  async function handleDeleteAlbum(albumId: number) {
    if (!confirm('Weet je zeker dat je dit album wilt verwijderen?')) return

    setDeletingId(albumId)
    try {
      const response = await fetch(`/api/gallery/albums/${albumId}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Verwijderen mislukt')
      }
      router.refresh()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Verwijderen mislukt')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      {isAdmin && (
        <div className="mb-8">
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 text-sm font-medium"
          >
            Foto&apos;s uploaden
          </button>
        </div>
      )}

      {albums.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          Nog geen foto&apos;s in de galerij.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => {
            const cover = album.photos[0]
            if (!cover) return null

            return (
              <article
                key={album.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group"
              >
                <Link href={`/fotogallerij/${album.id}`} className="block">
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/gallery/photos/${cover.id}`}
                      alt={album.title ?? 'Galerij foto'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                      {getAlbumLabel(album)}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(album.createdAt)}
                      {album.photos.length > 1 && ` • ${album.photos.length} foto's`}
                    </p>
                    {album.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {album.description}
                      </p>
                    )}
                  </div>
                </Link>
                {isAdmin && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => handleDeleteAlbum(album.id)}
                      disabled={deletingId === album.id}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 disabled:opacity-50"
                    >
                      {deletingId === album.id ? 'Verwijderen...' : 'Album verwijderen'}
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      <GalleryUploadForm isOpen={showUpload} onClose={() => setShowUpload(false)} />
    </>
  )
}
