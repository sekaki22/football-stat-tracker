import { NextRequest, NextResponse } from 'next/server'
import { GalleryService } from '@/lib/services/galleryService'
import { withAdminAuth } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const formData = await request.formData()
      const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File && entry.size > 0)
      const title = formData.get('title')
      const description = formData.get('description')
      const photoDescriptionsRaw = formData.get('photoDescriptions')

      let photoDescriptions: string[] | undefined
      if (typeof photoDescriptionsRaw === 'string' && photoDescriptionsRaw) {
        try {
          photoDescriptions = JSON.parse(photoDescriptionsRaw)
        } catch {
          photoDescriptions = undefined
        }
      }

      const album = await GalleryService.createAlbumWithPhotos({
        title: typeof title === 'string' ? title : null,
        description: typeof description === 'string' ? description : null,
        files,
        photoDescriptions,
      })

      return NextResponse.json(album, { status: 201 })
    } catch (error) {
      console.error('Error uploading gallery photos:', error)
      const message = error instanceof Error ? error.message : 'Failed to upload photos'
      return NextResponse.json({ error: message }, { status: 400 })
    }
  })
}
