import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import { PageContent, PageListItem, PageFrontmatter } from '@/types/content'

const contentDirectory = path.join(process.cwd(), 'content', 'pages')

// Configure marked for better HTML output
marked.setOptions({
  gfm: true,
  breaks: true,
})

export class ContentManager {
  /**
   * Get all published pages
   */
  static async getPages(): Promise<PageListItem[]> {
    if (!fs.existsSync(contentDirectory)) {
      return []
    }

    const files = fs.readdirSync(contentDirectory)
    const markdownFiles = files.filter(file => file.endsWith('.md'))

    const pages = markdownFiles.map(file => {
      const filePath = path.join(contentDirectory, file)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data } = matter(fileContents)
      const frontmatter = data as PageFrontmatter

      return {
        title: frontmatter.title,
        slug: frontmatter.slug,
        description: frontmatter.description,
        author: frontmatter.author,
        date: frontmatter.date,
        published: frontmatter.published,
        filePath: file
      }
    })

    // Filter published content and sort by date (newest first)
    return pages
      .filter(page => page.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  /**
   * Get a specific page by slug
   */
  static async getPageBySlug(slug: string): Promise<PageContent | null> {
    if (!fs.existsSync(contentDirectory)) {
      return null
    }

    const files = fs.readdirSync(contentDirectory)
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      
      const filePath = path.join(contentDirectory, file)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      const frontmatter = data as PageFrontmatter

      if (frontmatter.slug === slug && frontmatter.published) {
        return {
          frontmatter,
          content: await marked(content),
          slug: frontmatter.slug,
          filePath: file
        }
      }
    }

    return null
  }

  /**
   * Search pages by title or description
   */
  static async searchPages(query: string): Promise<PageListItem[]> {
    const allPages = await this.getPages()
    const searchQuery = query.toLowerCase()

    return allPages.filter(page => 
      page.title.toLowerCase().includes(searchQuery) ||
      page.description.toLowerCase().includes(searchQuery)
    )
  }
}
