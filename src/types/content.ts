export interface PageFrontmatter {
  title: string
  slug: string
  description: string
  author: string
  date: string
  published: boolean
}

export interface PageContent {
  frontmatter: PageFrontmatter
  content: string
  slug: string
  filePath: string
}

export interface PageListItem {
  title: string
  slug: string
  description: string
  author: string
  date: string
  published: boolean
  filePath: string
}
