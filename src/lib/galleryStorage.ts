import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const GALLERY_DIR = path.join(process.cwd(), 'data', 'gallery')

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

export const MAX_GALLERY_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function getGalleryDir() {
  return GALLERY_DIR
}

export function getGalleryFilePath(filename: string) {
  return path.join(GALLERY_DIR, filename)
}

export function isAllowedImageType(mimeType: string) {
  return ALLOWED_MIME_TYPES.has(mimeType)
}

export function getMimeTypeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    default:
      return 'application/octet-stream'
  }
}

export async function saveGalleryFile(file: File): Promise<{ filename: string; originalName: string }> {
  if (!isAllowedImageType(file.type)) {
    throw new Error('Alleen JPEG, PNG, WebP en GIF afbeeldingen zijn toegestaan')
  }

  if (file.size > MAX_GALLERY_FILE_SIZE) {
    throw new Error('Afbeelding mag maximaal 10 MB zijn')
  }

  await mkdir(GALLERY_DIR, { recursive: true })

  const extension = EXTENSION_BY_MIME[file.type] ?? (path.extname(file.name) || '.jpg')
  const filename = `${randomUUID()}${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(getGalleryFilePath(filename), buffer)

  return {
    filename,
    originalName: file.name,
  }
}

export async function deleteGalleryFile(filename: string) {
  try {
    await unlink(getGalleryFilePath(filename))
  } catch {
    // File may already be removed
  }
}
