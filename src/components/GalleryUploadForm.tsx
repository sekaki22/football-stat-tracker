'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import Modal from './Modal'

interface GalleryUploadFormProps {
  isOpen: boolean
  onClose: () => void
}

export default function GalleryUploadForm({ isOpen, onClose }: GalleryUploadFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [photoDescription, setPhotoDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function resetForm() {
    setTitle('')
    setDescription('')
    setSelectedFiles([])
    setPhotoDescription('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setSelectedFiles(files)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (selectedFiles.length === 0) {
      setError('Selecteer minimaal één foto')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append('files', file))

      if (title.trim()) formData.append('title', title.trim())
      if (description.trim()) formData.append('description', description.trim())

      if (selectedFiles.length === 1 && photoDescription.trim()) {
        formData.append('photoDescriptions', JSON.stringify([photoDescription.trim()]))
      }

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload mislukt')
      }

      router.refresh()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload mislukt')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Foto's uploaden" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Foto&apos;s selecteren
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-rose-600 file:text-white file:cursor-pointer hover:file:bg-rose-700"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Selecteer één foto of meerdere voor een set. Max. 10 MB per foto.
          </p>
          {selectedFiles.length > 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {selectedFiles.length} bestand{selectedFiles.length !== 1 ? 'en' : ''} geselecteerd
            </p>
          )}
        </div>

        <div>
          <label htmlFor="gallery-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Titel (optioneel)
          </label>
          <input
            id="gallery-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={selectedFiles.length > 1 ? 'bijv. Uitwedstrijd Gent' : 'bijv. Teamfoto'}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="gallery-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Beschrijving (optioneel)
          </label>
          <textarea
            id="gallery-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Beschrijving van dit album of deze foto"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
          />
        </div>

        {selectedFiles.length === 1 && (
          <div>
            <label htmlFor="photo-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fotobeschrijving (optioneel)
            </label>
            <input
              id="photo-description"
              type="text"
              value={photoDescription}
              onChange={(e) => setPhotoDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedFiles.length === 0}
            className="px-4 py-2 text-sm bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Uploaden...' : 'Uploaden'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
