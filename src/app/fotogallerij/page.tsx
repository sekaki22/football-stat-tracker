import { GalleryService } from '@/lib/services/galleryService'
import GalleryView from '@/components/GalleryView'

export const dynamic = 'force-dynamic'

export default async function FotogallerijPage() {
  const albums = await GalleryService.getAlbums()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Fotogallerij
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Teamfoto&apos;s en momenten
          </p>
        </div>

        <GalleryView albums={albums} />
      </div>
    </div>
  )
}
