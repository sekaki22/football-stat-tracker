import { NextRequest, NextResponse } from 'next/server'
import { ContentManager } from '@/lib/content'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')

    // Get specific page by slug
    if (slug) {
      const page = await ContentManager.getPageBySlug(slug)
      if (!page) {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(page)
    }

    // Search pages
    if (search) {
      const results = await ContentManager.searchPages(search)
      return NextResponse.json(results)
    }

    // Get all pages
    const allPages = await ContentManager.getPages()
    return NextResponse.json(allPages)

  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}
