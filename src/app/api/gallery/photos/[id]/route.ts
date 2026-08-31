import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { GalleryService } from '@/lib/services/galleryService'
import { withAdminAuth } from '@/lib/middleware'
import {
  getGalleryFilePath,
  getMimeTypeFromFilename,
} from '@/lib/galleryStorage'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const photoId = parseInt(id, 10)

    if (isNaN(photoId)) {
      return NextResponse.json({ error: 'Invalid photo ID' }, { status: 400 })
    }

    const photo = await GalleryService.getPhotoById(photoId)

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const filePath = getGalleryFilePath(photo.filename)
    const buffer = await readFile(filePath)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': getMimeTypeFromFilename(photo.filename),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving gallery photo:', error)
    return NextResponse.json({ error: 'Failed to load photo' }, { status: 404 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async () => {
    try {
      const { id } = await params
      const photoId = parseInt(id, 10)

      if (isNaN(photoId)) {
        return NextResponse.json({ error: 'Invalid photo ID' }, { status: 400 })
      }

      await GalleryService.deletePhoto(photoId)
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting photo:', error)
      const message = error instanceof Error ? error.message : 'Failed to delete photo'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  })
}
