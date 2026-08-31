import { NextRequest, NextResponse } from 'next/server'
import { GalleryService } from '@/lib/services/galleryService'
import { withAdminAuth } from '@/lib/middleware'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const albumId = parseInt(id, 10)

    if (isNaN(albumId)) {
      return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 })
    }

    const album = await GalleryService.getAlbumById(albumId)

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    return NextResponse.json(album)
  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      const albumId = parseInt(id, 10)

      if (isNaN(albumId)) {
        return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 })
      }

      await GalleryService.deleteAlbum(albumId)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting album:', error)
      const message = error instanceof Error ? error.message : 'Failed to delete album'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  })
}
