import { notFound } from 'next/navigation'
import { GalleryService } from '@/lib/services/galleryService'
import GalleryAlbumDetail from '@/components/GalleryAlbumDetail'

export default async function FotogallerijAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const albumId = parseInt(id, 10)

  if (isNaN(albumId)) {
    notFound()
  }

  const album = await GalleryService.getAlbumById(albumId)

  if (!album) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <GalleryAlbumDetail album={album} />
      </div>
    </div>
  )
}
