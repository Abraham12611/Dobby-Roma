import React, { useState } from 'react'
import { chatApi } from '../services/api'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  contextId: string
  onShareSuccess: (shareUrl: string) => void
  accessToken: () => Promise<string | null>
  messages: Array<{isUser: boolean, content: string}>
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  contextId,
  onShareSuccess,
  accessToken,
  messages
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('A conversation shared from Dobby AI')
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate title from first user message
  const generateTitle = () => {
    const firstUserMessage = messages.find(msg => msg.isUser)
    if (firstUserMessage) {
      // Take first sentence and limit to 50 characters
      const firstSentence = firstUserMessage.content.split('.')[0].trim()
      return firstSentence.length > 50 
        ? firstSentence.substring(0, 47) + '...'
        : firstSentence
    }
    return 'Shared Conversation'
  }

  // Set title when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTitle(generateTitle())
    }
  }, [isOpen, messages])

  const handleShare = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsSharing(true)
    setError(null)

    try {
      const token = await accessToken()
      if (!token) {
        setError('Authentication required. Please login again.')
        return
      }

      const result = await chatApi.shareContext(
        contextId,
        title.trim(),
        description.trim(),
        token
      )

      if (result.success) {
        onShareSuccess(result.shareUrl)
        onClose()
      } else {
        setError('Failed to share context')
      }
    } catch (err) {
      console.error('Error sharing context:', err)
      setError('Failed to share context. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  const handleClose = () => {
    if (!isSharing) {
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Share Chat</h2>
          <button
            onClick={handleClose}
            disabled={isSharing}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a title for your shared chat"
              disabled={isSharing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your conversation"
              rows={3}
              disabled={isSharing}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleClose}
              disabled={isSharing}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing || !title.trim()}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSharing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sharing...
                </>
              ) : (
                'Share Chat'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal
