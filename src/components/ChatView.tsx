import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { usePrivy } from '@privy-io/react-auth'
import { useChatStore } from '../stores/chatStore'
import { useLoadingStore } from '../stores/loadingStore'
import { useTheme } from '../contexts/ThemeContext'
import ModelSelector from './ModelSelector'
import ContextNavigator from './ContextNavigator'
import LoadingScreen from './LoadingScreen'
import ShareModal from './ShareModal'
import VoiceInput from './VoiceInput'
import Header from './Header'

const ChatView: React.FC = () => {
  const { authenticated, user, login, getAccessToken, ready } = usePrivy()
  const { messages, isLoading, sendMessage, hasMessages, setUserId, selectedModel, setSelectedModel, loadContextsFromServer, currentContextId, loadCreditStatus, getCreditStatus, getDailyRequests } = useChatStore()
  const { minLoadingComplete, setMinLoadingComplete } = useLoadingStore()
  const { themeColors } = useTheme()
  const [inputMessage, setInputMessage] = useState('')
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Ensure minimum loading time of 3 seconds (only if not already completed)
  useEffect(() => {
    if (!minLoadingComplete) {
      const timer = setTimeout(() => {
        setMinLoadingComplete(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [minLoadingComplete, setMinLoadingComplete])

  const suggestions = [
    '2 + 2 = ?',
    'What is Sentient?',
    'When will Solana kill BTC?',
    'Who is Dobby AI?',
    'Tell me a joke'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return
    
    if (!authenticated) {
      alert('Please login to chat with Dobby!')
      return
    }
    
    const message = inputMessage
    setInputMessage('')
    
    // Get Privy access token for authentication
    const accessToken = await getAccessToken()
    
    await sendMessage(message, user?.id, undefined, accessToken || undefined)
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInputMessage(transcript)
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleShareClick = async () => {
    if (!currentContextId) {
      alert('No context to share. Please start a conversation first.')
      return
    }
    setIsShareModalOpen(true)
  }

  const handleShareSuccess = async (shareUrl: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      // Open shared chat in new window
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      // Still open the window even if clipboard fails
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }
  }

  useEffect(() => {
    console.log('📱 ChatView: Messages changed, count:', messages.length)
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (authenticated && user) {
      const userId = user.id
      setUserId(userId)
      
      // Load contexts and credit status from server when user is authenticated
      const loadData = async () => {
        const accessToken = await getAccessToken()
        if (accessToken) {
          await Promise.all([
            loadContextsFromServer(accessToken),
            loadCreditStatus(accessToken)
          ])
        }
      }
      
      loadData()
    }
  }, [authenticated, user, setUserId, getAccessToken, loadContextsFromServer, loadCreditStatus])

  // Check for shared chat history in URL

  // Show loading screen while Privy is initializing or minimum loading time hasn't passed
  if (!ready || !minLoadingComplete) {
    return <LoadingScreen />
  }


  return (
    <div className={`h-screen ${themeColors.background} flex flex-col transition-colors duration-300`}>
      <div className="flex flex-col h-full min-h-0">
        {/* Bottom Header - moved from top */}
        <div className="order-2">
          <Header />
        </div>

        {/* Chat Container or Login Prompt */}
        <div className="max-w-5xl mx-auto px-6 flex-1 py-4 flex flex-col min-h-0 order-1">
          {!authenticated ? (
            /* Login Prompt */
            <div className={`${themeColors.backgroundSecondary} rounded-lg border ${themeColors.border} overflow-hidden flex-1 flex flex-col min-h-0`}>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-24 h-24 rounded-lg flex items-center justify-center mx-auto mb-6 overflow-hidden">
                    <img src="/logo.png" alt="Dobby AI Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className={`text-3xl font-bold ${themeColors.text} mb-4`}>
                    Welcome to Dobby AI
                  </h2>
                  <p className={`${themeColors.textSecondary} mb-8 text-lg`}>
                    Please login to start chatting with Dobby AI
                  </p>
                  <button
                    onClick={login}
                    className={`w-full ${themeColors.button} font-semibold py-3 px-6 rounded-lg transition-all duration-200`}
                  >
                    Login
                  </button>
                  <p className={`text-sm ${themeColors.textTertiary} mt-4`}>
                    Login with Privy
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className={`${themeColors.backgroundSecondary} rounded-lg border ${themeColors.border} overflow-hidden flex-1 flex flex-col min-h-0`}>
              {/* Bottom Model Selector and Chat History Navigator */}
              <div className={`order-3 flex items-center justify-between p-4 border-t ${themeColors.border}`}>
                <div className="flex items-center space-x-4">
                  {/* Credit Count Display */}
                  <div className={`flex items-center space-x-2 px-4 py-2 ${themeColors.backgroundTertiary} border ${themeColors.border} rounded-lg`}>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className={`text-sm font-medium ${themeColors.text}`}>
                      {getCreditStatus()?.remainingCredits ?? getDailyRequests().remainingToday} {getCreditStatus() ? 'Credits' : 'Requests'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm ${themeColors.textSecondary} font-medium`}>Model:</span>
                    <ModelSelector
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <ContextNavigator />
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 chat-messages-container order-1">
                {/* Share Button */}
                {messages.length > 0 && (
                  <div className="sticky top-0 z-10 flex justify-start mb-4">
                    <button
                      onClick={handleShareClick}
                      className={`flex items-center space-x-2 px-4 py-2 ${themeColors.button} rounded-lg transition-colors text-sm font-medium`}
                      title="Share this chat conversation with others"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                )}
                
                {/* Welcome Message */}
                {!hasMessages && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6 overflow-hidden">
                      <img src="/logo.png" alt="Dobby AI Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className={`text-2xl font-bold ${themeColors.text} mb-3`}>
                      Hello! I'm Dobby AI
                    </h2>
                    <p className={`${themeColors.textSecondary} mb-8 max-w-xl mx-auto`}>
                      I'm Dobby AI and you can talk to me!
                    </p>
                    <div className="space-y-3">
                      <p className={`text-sm ${themeColors.textTertiary} font-medium`}>Try asking:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={async () => {
                              const accessToken = await getAccessToken()
                              sendMessage(suggestion, user?.id, undefined, accessToken || undefined)
                            }}
                            className={`px-4 py-2 text-sm font-medium ${themeColors.buttonSecondary} rounded-lg transition-all duration-200`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`chat-bubble slide-in max-w-2xl ${
                      message.isUser ? 'chat-bubble-user' : 'chat-bubble-ai'
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({node, ...props}) => <h1 className={`text-2xl font-bold mb-3 ${themeColors.text}`} {...props} />,
                            h2: ({node, ...props}) => <h2 className={`text-xl font-bold mb-2 ${themeColors.text}`} {...props} />,
                            h3: ({node, ...props}) => <h3 className={`text-lg font-semibold mb-2 ${themeColors.text}`} {...props} />,
                            p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className={`border-l-4 ${themeColors.border} pl-4 italic mb-3 ${themeColors.backgroundTertiary} py-2 rounded-r`} {...props} />,
                            code: ({node, ...props}: any) =>
                              props.inline ?
                                <code className={`${themeColors.backgroundTertiary} px-2 py-1 rounded text-sm font-mono ${themeColors.text} border ${themeColors.border}`} {...props} /> :
                                <code className={`block ${themeColors.backgroundTertiary} p-3 rounded text-sm font-mono mb-3 ${themeColors.text} border ${themeColors.border} overflow-x-auto`} {...props} />,
                            pre: ({node, ...props}) => <pre className={`${themeColors.backgroundTertiary} p-3 rounded text-sm font-mono mb-3 overflow-x-auto ${themeColors.text} border ${themeColors.border}`} {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            a: ({node, ...props}) => <a className={`${themeColors.text} underline hover:no-underline`} {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

              {/* Input Area */}
              <div className={`order-0 border-b ${themeColors.border} p-4 flex-shrink-0 min-h-0`}>
                <form onSubmit={handleSubmit} className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className={`px-6 py-2 ${themeColors.button} font-semibold rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm min-w-[100px]`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send'
                    )}
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything"
                      className={`w-full px-4 py-2 pr-12 border ${themeColors.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 ${themeColors.input} disabled:opacity-50`}
                      disabled={isLoading}
                    />
                    <VoiceInput
                      onTranscript={handleVoiceTranscript}
                      disabled={isLoading}
                    />
                  </div>
                </form>
              </div>
          </div>
          )}
        </div>
      </div>
      
      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          contextId={currentContextId || ''}
          onShareSuccess={handleShareSuccess}
          accessToken={async () => await getAccessToken()}
          messages={messages}
        />
      )}
    </div>
  )
}

export default ChatView 