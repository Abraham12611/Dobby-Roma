import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { chatApi, SharedContextData } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'
import LoadingScreen from './LoadingScreen'
import Header from './Header'

interface SharedChatViewProps {
  shareId: string
}

const SharedChatView: React.FC<SharedChatViewProps> = ({ shareId }) => {
  const { themeColors } = useTheme()
  const [sharedData, setSharedData] = useState<SharedContextData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSharedContext = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await chatApi.getPublicSharedContext(shareId)
        
        // Check if response has success property (wrapped response)
        if (response.success && response.sharedContext) {
          setSharedData(response.sharedContext)
        } 
        // Check if response is the data directly (unwrapped response)
        else if (response.shareId && response.messages) {
          setSharedData(response as SharedContextData)
        } else {
          setError('Shared context not found')
        }
      } catch (err) {
        console.error('Error loading shared context:', err)
        setError('Failed to load shared context')
      } finally {
        setLoading(false)
      }
    }

    if (shareId) {
      loadSharedContext()
    }
  }, [shareId])

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className={`h-screen ${themeColors.background} flex flex-col relative overflow-hidden transition-colors duration-200`}>
        {/* Animated background gradients - only in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 animate-pulse dark:block hidden"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800/50 via-transparent to-transparent dark:block hidden"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-bounce-slow dark:block hidden"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow dark:block hidden"></div>
        
        <div className="relative z-10 flex flex-col h-full min-h-0">
          {/* Header */}
          <Header 
            title="Dobby AI"
            subtitle="Shared Conversation"
            showBackButton={true}
            onBack={() => window.location.href = '/'}
            showProfileButton={false}
            showLoginButton={false}
            showThemeToggle={true}
          />

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className={`text-2xl font-bold ${themeColors.text} mb-2`}>Error</h1>
              <p className={`${themeColors.textSecondary} mb-6`}>{error}</p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!sharedData) {
    return (
      <div className={`h-screen ${themeColors.background} flex flex-col relative overflow-hidden transition-colors duration-200`}>
        {/* Animated background gradients - only in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 animate-pulse dark:block hidden"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800/50 via-transparent to-transparent dark:block hidden"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-bounce-slow dark:block hidden"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow dark:block hidden"></div>
        
        <div className="relative z-10 flex flex-col h-full min-h-0">
          {/* Header */}
          <Header 
            title="Dobby AI"
            subtitle="Shared Conversation"
            showBackButton={true}
            onBack={() => window.location.href = '/'}
            showProfileButton={false}
            showLoginButton={false}
            showThemeToggle={true}
          />

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className={`text-2xl font-bold ${themeColors.text} mb-2`}>Not Found</h1>
              <p className={`${themeColors.textSecondary} mb-6`}>This shared conversation could not be found.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen ${themeColors.background} flex flex-col relative overflow-hidden transition-colors duration-200`}>
      {/* Animated background gradients - only in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 animate-pulse dark:block hidden"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-800/50 via-transparent to-transparent dark:block hidden"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-bounce-slow dark:block hidden"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow dark:block hidden"></div>
      
      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* Header */}
        <Header 
          title="Dobby AI"
          subtitle="Shared Conversation"
          showBackButton={true}
          onBack={() => window.location.href = '/'}
          showProfileButton={false}
          showLoginButton={false}
          showThemeToggle={true}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Conversation Header */}
            <div className={`${themeColors.backgroundSecondary} rounded-2xl shadow-2xl border ${themeColors.border} p-6 mb-6`}>
              <h2 className={`text-2xl font-bold ${themeColors.text} mb-2`}>{sharedData.title}</h2>
              <p className={`${themeColors.textSecondary} mb-4`}>{sharedData.description}</p>
              
              <div className={`flex flex-wrap items-center gap-4 text-sm ${themeColors.textTertiary}`}>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{sharedData.totalMessages} messages</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Created {new Date(sharedData.createdAt).toLocaleDateString()}</span>
                </div>
                
                {sharedData.model && (
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Model: {sharedData.model}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className={`${themeColors.backgroundSecondary} rounded-2xl shadow-2xl border ${themeColors.border} overflow-hidden`}>
              <div className="p-6 space-y-6">
                {sharedData.messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? `${themeColors.chatBubbleUser}`
                          : `${themeColors.chatBubbleAI} border ${themeColors.border}`
                      }`}
                    >
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom styling for different markdown elements
                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className={`border-l-4 ${themeColors.borderSecondary} pl-4 italic mb-2`} {...props} />,
                            code: ({node, ...props}: any) => 
                              props.inline ? 
                                <code className={`${themeColors.backgroundTertiary} px-1 py-0.5 rounded text-sm ${themeColors.text}`} {...props} /> :
                                <code className={`block ${themeColors.backgroundTertiary} p-2 rounded text-sm mb-2 ${themeColors.text}`} {...props} />,
                            pre: ({node, ...props}) => <pre className={`${themeColors.backgroundTertiary} p-2 rounded text-sm mb-2 overflow-x-auto ${themeColors.text}`} {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-gray-300' : themeColors.textTertiary
                      }`}>
                        {new Date(message.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className={`${themeColors.textSecondary} mb-4`}>
                This conversation was shared from Dobby AI
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Your Own Conversation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharedChatView
