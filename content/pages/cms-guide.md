---
title: "CMS Gebruikshandleiding"
slug: "cms-guide"
description: "Complete gids voor het gebruik van het flat file content management systeem"
author: "Developer"
date: "2025-01-01"
published: true
---

# Content Management System - Gebruikshandleiding

Dit document legt uit hoe je het flat file content management systeem gebruikt om pagina's te maken en te beheren in je React applicatie.

## 📁 Bestandsstructuur

Het CMS gebruikt een eenvoudige mapstructuur:

```
content/
  pages/
    about.md
    cms-guide.md
    jouw-pagina.md
```

Alle content wordt opgeslagen als markdown bestanden in de `content/pages/` map.

## 📝 Markdown Bestand Format

Elk markdown bestand moet beginnen met **frontmatter** (metadata) gevolgd door de content:

```markdown
---
title: "Titel van je pagina"
slug: "url-slug"
description: "Korte beschrijving van de pagina"
author: "Jouw naam"
date: "2025-01-01"
published: true
---

# Hoofdtitel

Je markdown content hier...

## Subtitel

- Bullet point 1
- Bullet point 2

**Vet tekst** en *cursieve tekst*.

[Link naar Google](https://google.com)
```

### Frontmatter Velden

| Veld | Type | Beschrijving |
|------|------|-------------|
| `title` | string | Titel van de pagina (verplicht) |
| `slug` | string | URL slug (bijv. "team-info" wordt `/content/team-info`) |
| `description` | string | Korte beschrijving voor overzichtspagina's |
| `author` | string | Naam van de auteur |
| `date` | string | Datum in YYYY-MM-DD format |
| `published` | boolean | `true` om te publiceren, `false` voor concept |

## 🌐 Content Toegang

Content wordt **niet** via directe URLs getoond, maar gebruikt in React components:

- **In Server Components**: `ContentManager.getPageBySlug('team-regels')`
- **Via API endpoints**: `fetch('/api/content?slug=team-regels')`
- **Embedded in bestaande pagina's**: Integreer content in je huidige page strukture

## 💻 Gebruik in React Components

### 1. Alle Pagina's Ophalen

```typescript
import { ContentManager } from '@/lib/content'

// In een Server Component
export default async function MyComponent() {
  const pages = await ContentManager.getPages()
  
  return (
    <div>
      {pages.map(page => (
        <div key={page.slug}>
          <h2>{page.title}</h2>
          <p>{page.description}</p>
          <p>Door: {page.author}</p>
        </div>
      ))}
    </div>
  )
}
```

### 2. Specifieke Pagina Ophalen en Tonen

```typescript
import { ContentManager } from '@/lib/content'

export default async function TeamInfoPage() {
  const page = await ContentManager.getPageBySlug('team-info')
  
  if (!page) {
    return <div>Pagina niet gevonden</div>
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {page.frontmatter.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span>Door {page.frontmatter.author}</span>
            <span>•</span>
            <time dateTime={page.frontmatter.date}>
              {new Date(page.frontmatter.date).toLocaleDateString('nl-NL')}
            </time>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {page.frontmatter.description}
          </p>
        </header>

        {/* Render de markdown content als HTML */}
        <div 
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </article>
    </div>
  )
}
```

### 3. Content Integreren in Bestaande Pagina's

```typescript
import { ContentManager } from '@/lib/content'

// Bijvoorbeeld in je home page of team info sectie
export default async function HomePage() {
  // Haal specifieke content op om te tonen
  const teamRules = await ContentManager.getPageBySlug('team-regels')
  const aboutPage = await ContentManager.getPageBySlug('about')
  
  return (
    <div>
      <h1>Quick 1888 Zaterdag 2</h1>
      
      {/* Team info sectie */}
      {aboutPage && (
        <section className="mb-8">
          <h2>{aboutPage.frontmatter.title}</h2>
          <div 
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: aboutPage.content }} 
          />
        </section>
      )}
      
      {/* Andere page content... */}
    </div>
  )
}
```

### 4. Client-Side Gebruik (met API)

Voor client components kun je de API endpoints gebruiken:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { PageListItem, PageContent } from '@/types/content'

export default function ClientContentExample() {
  const [pages, setPages] = useState<PageListItem[]>([])
  const [selectedPage, setSelectedPage] = useState<PageContent | null>(null)
  
  useEffect(() => {
    // Haal alle pagina's op
    fetch('/api/content')
      .then(res => res.json())
      .then(setPages)
  }, [])
  
  const loadPage = async (slug: string) => {
    const response = await fetch(`/api/content?slug=${slug}`)
    const page = await response.json()
    setSelectedPage(page)
  }
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Pagina lijst */}
      <div>
        <h3>Beschikbare Pagina's</h3>
        {pages.map(page => (
          <button 
            key={page.slug}
            onClick={() => loadPage(page.slug)}
            className="block w-full text-left p-2 hover:bg-gray-100"
          >
            {page.title}
          </button>
        ))}
      </div>
      
      {/* Geselecteerde pagina */}
      <div>
        {selectedPage && (
          <div>
            <h3>{selectedPage.frontmatter.title}</h3>
            <div 
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: selectedPage.content }} 
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

## 🎨 Styling

De markdown content gebruikt de `prose-content` CSS klasse voor styling. Deze is al geconfigureerd in `globals.css` met:

- Responsive typografie
- Dark mode ondersteuning  
- Consistent kleurenschema
- Mooie code highlighting

## 📋 API Endpoints

Het systeem biedt deze API endpoints:

### GET `/api/content`
- **Alle pagina's**: `GET /api/content`
- **Zoeken**: `GET /api/content?search=zoekterm`
- **Specifieke pagina**: `GET /api/content?slug=page-slug`

### Response Format

```typescript
// Lijst van pagina's
interface PageListItem {
  title: string
  slug: string  
  description: string
  author: string
  date: string
  published: boolean
  filePath: string
}

// Volledige pagina content
interface PageContent {
  frontmatter: PageFrontmatter
  content: string // HTML
  slug: string
  filePath: string
}
```

## 🚀 Praktische Voorbeelden

### Team Regels Pagina

**Bestand**: `content/pages/team-regels.md`

```markdown
---
title: "Team Regels"
slug: "team-regels"
description: "Alle regels en richtlijnen voor teamleden"
author: "Team Manager"
date: "2025-01-01"
published: true
---

# Team Regels & Richtlijnen

## Training Regels

1. **Aanwezigheid**: Wees op tijd bij alle trainingen
2. **Uitrusting**: Neem altijd voetbalschoenen en scheenbeschermers mee
3. **Houding**: Houd een positieve en respectvolle houding

## Wedstrijddag Regels

1. **Aankomst**: Kom 30 minuten voor aftrap aan
2. **Tenue**: Draag het officiële teamtenue
3. **Gedrag**: Respecteer tegenstanders, scheidsrechters en toeschouwers
```

### Spelerslijst Pagina

**Bestand**: `content/pages/spelerslijst.md`

```markdown
---
title: "Spelerslijst 2025"
slug: "spelerslijst"
description: "Overzicht van alle teamleden seizoen 2025"
author: "Team Manager" 
date: "2025-01-01"
published: true
---

# Spelerslijst Seizoen 2025

## Keepers
- **Jan de Vries** - #1
- **Piet Janssen** - #12

## Verdedigers
- **Klaas de Wit** - #2
- **Henk van Dam** - #3

## Middenvelders  
- **Tom Bakker** - #6
- **Sander Koster** - #8

## Aanvallers
- **Marco Visser** - #9
- **Dennis Smit** - #11
```

## 🔧 Geavanceerd Gebruik

### Custom Component met Pagina Data

```typescript
import { ContentManager } from '@/lib/content'
import Link from 'next/link'

interface TeamPageProps {
  highlightedPages?: string[] // Slugs van uit te lichten pagina's
}

export default async function TeamInfoSection({ highlightedPages = [] }: TeamPageProps) {
  const allPages = await ContentManager.getPages()
  
  // Filter highlighted pages
  const highlighted = allPages.filter(page => 
    highlightedPages.includes(page.slug)
  )
  
  const regular = allPages.filter(page => 
    !highlightedPages.includes(page.slug)
  )
  
  return (
    <div>
      {/* Featured Pages */}
      {highlighted.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Belangrijke Info</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {highlighted.map(page => (
              <div key={page.slug} className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold">
                  <Link href={`/content/${page.slug}`}>
                    {page.title}
                  </Link>
                </h3>
                <p className="text-sm text-gray-600">{page.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Regular Pages */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Alle Team Info</h2>
        <div className="space-y-2">
          {regular.map(page => (
            <Link 
              key={page.slug} 
              href={`/content/${page.slug}`}
              className="block p-3 hover:bg-gray-50 rounded"
            >
              <div className="font-medium">{page.title}</div>
              <div className="text-sm text-gray-500">{page.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

// Gebruik:
// <TeamInfoSection highlightedPages={['team-regels', 'spelerslijst']} />
```

## ✅ Best Practices

1. **Consistente Slugs**: Gebruik kebab-case (`team-regels` niet `teamRegels`)
2. **Beschrijvende Titels**: Maak titels duidelijk en specifiek
3. **Goede Descriptions**: Schrijf nuttige beschrijvingen voor overzichtspagina's
4. **Datum Format**: Gebruik altijd YYYY-MM-DD formaat
5. **Published Flag**: Zet `published: false` voor concepten
6. **Bestandsnamen**: Gebruik duidelijke namen (`team-regels.md` niet `file1.md`)

## 🐛 Troubleshooting

### Pagina Verschijnt Niet
- ✅ Check of `published: true` in frontmatter staat
- ✅ Controleer of frontmatter correct geformatteerd is (met `---`)
- ✅ Verify dat het bestand in `content/pages/` staat

### Markdown Rendert Niet Correct
- ✅ Check of speciale karakters geëscaped zijn
- ✅ Controleer of de frontmatter compleet is
- ✅ Test markdown syntax in een online editor

### Styling Problemen
- ✅ Gebruik de `prose-content` CSS klasse
- ✅ Check of Tailwind CSS correct geladen is
- ✅ Controleer custom CSS in `globals.css`

---

Nu kun je eenvoudig pagina's maken door markdown bestanden toe te voegen aan `content/pages/` en ze gebruiken in je React components! 🚀
