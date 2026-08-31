import { prisma } from '@/lib/prisma'
import { deleteGalleryFile, saveGalleryFile } from '@/lib/galleryStorage'

export type GalleryAlbumWithPhotos = Awaited<ReturnType<typeof GalleryService.getAlbums>>[number]

export class GalleryService {
  static async getAlbums() {
    return prisma.galleryAlbum.findMany({
      include: {
        photos: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  static async getAlbumById(id: number) {
    return prisma.galleryAlbum.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    })
  }

  static async getPhotoById(id: number) {
    return prisma.galleryPhoto.findUnique({
      where: { id },
    })
  }

  static async createAlbumWithPhotos(input: {
    title?: string | null
    description?: string | null
    files: File[]
    photoDescriptions?: string[]
  }) {
    if (input.files.length === 0) {
      throw new Error('Selecteer minimaal één foto')
    }

    const savedFiles = await Promise.all(input.files.map((file) => saveGalleryFile(file)))

    return prisma.galleryAlbum.create({
      data: {
        title: input.title?.trim() || null,
        description: input.description?.trim() || null,
        photos: {
          create: savedFiles.map((saved, index) => ({
            filename: saved.filename,
            originalName: saved.originalName,
            description: input.photoDescriptions?.[index]?.trim() || null,
            sortOrder: index,
          })),
        },
      },
      include: {
        photos: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    })
  }

  static async deleteAlbum(id: number) {
    const album = await prisma.galleryAlbum.findUnique({
      where: { id },
      include: { photos: true },
    })

    if (!album) {
      throw new Error('Album niet gevonden')
    }

    await Promise.all(album.photos.map((photo) => deleteGalleryFile(photo.filename)))
    await prisma.galleryAlbum.delete({ where: { id } })
  }

  static async deletePhoto(id: number) {
    const photo = await prisma.galleryPhoto.findUnique({
      where: { id },
      include: { album: { include: { photos: true } } },
    })

    if (!photo) {
      throw new Error('Foto niet gevonden')
    }

    await deleteGalleryFile(photo.filename)
    await prisma.galleryPhoto.delete({ where: { id } })

    if (photo.album.photos.length === 1) {
      await prisma.galleryAlbum.delete({ where: { id: photo.albumId } })
    }
  }
}
