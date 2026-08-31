import { NextRequest, NextResponse } from 'next/server'
import { GalleryService } from '@/lib/services/galleryService'

export async function GET() {
  try {
    const albums = await GalleryService.getAlbums()
    return NextResponse.json(albums)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}
