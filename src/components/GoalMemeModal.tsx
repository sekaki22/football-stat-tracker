'use client'

import { Player } from '@prisma/client'
import { useState, useEffect } from 'react'

const CELEBRATION_GIFS = [
'https://media.giphy.com/media/KVVgzFKIlqBqx0OFIw/giphy.gif', // Soccer celebration
'https://media.giphy.com/media/3oz8xBn4lQ879j4UuI/giphy.gif', // Another celebration
'https://media.giphy.com/media/wXsCbEJPNZGSY/giphy.gif', // Another celebration
]

interface GoalMemeModalProps {
  player: Player
  isOpen: boolean
  onClose: () => void
}

export default function GoalMemeModal({ player, isOpen, onClose }: GoalMemeModalProps) {
  const [showMeme, setShowMeme] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowMeme(true)
      
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        setShowMeme(false)
        setTimeout(onClose, 0) // Wait for fade-out animation
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const randomGif = CELEBRATION_GIFS[Math.floor(Math.random() * CELEBRATION_GIFS.length)]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-500 relative ${
          showMeme ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={() => {
            setShowMeme(false)
            setTimeout(onClose, 500)
          }}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">
          GOAL! 🎉
        </h2>
        <p className="text-xl mb-4 text-gray-900 dark:text-gray-100 text-center">
          {player.name} scored!
        </p>
        <div className="relative aspect-video mb-4">
          <img
            src={randomGif}
            alt="Goal celebration"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Auto-closing in 10 seconds...
        </div>
      </div>
    </div>
  )
} 