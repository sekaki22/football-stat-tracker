
import { ContentManager } from '@/lib/content'

export default async function Home() {
  const aboutPage = await ContentManager.getPageBySlug('home')
  return (
    <main className="min-h-screen p-8">
      {aboutPage && (
        <section className="mb-8">
          <div 
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: aboutPage.content }} 
          />
        </section>
      )}
    </main>
  )
}
