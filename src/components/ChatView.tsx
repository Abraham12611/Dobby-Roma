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
    <div className={`h-screen ${themeColors.background} flex flex-col relative overflow-hidden transition-colors duration-300`}>
      {/* Animated background gradients - transformed with new colors */}
      <div className="absolute inset-0 bg-gradient-to-l from-secondary-500/20 via-transparent to-primary-500/20 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/30 via-transparent to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/30 rounded-full blur-3xl animate-bounce-slow"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
      
      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* Bottom Header - moved from top */}
        <div className="order-2">
          <Header />
        </div>

        {/* Chat Container or Login Prompt */}
        <div className="max-w-5xl mx-auto px-6 flex-1 py-4 flex flex-col min-h-0 order-1">
          {!authenticated ? (
            /* Login Prompt - transformed layout */
            <div className={`${themeColors.backgroundSecondary} rounded-3xl shadow-2xl border ${themeColors.border} overflow-hidden flex-1 flex flex-col min-h-0 backdrop-blur-xl`}>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center py-12 max-w-lg mx-auto p-8">
                  <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-8 overflow-hidden ring-8 ring-primary-500/40 shadow-2xl hover:scale-110 transition-all duration-500">
                    <img src="/logo.png" alt="Dobby AI Logo" className="w-full h-full object-cover" />
                  </div>
                  <h2 className={`text-5xl font-black ${themeColors.text} mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent`}>
                    Welcome to Dobby AI
                  </h2>
                  <p className={`${themeColors.textSecondary} mb-12 text-2xl font-medium leading-relaxed`}>
                    Please login to start chatting with Dobby AI
                  </p>
                  <div className="space-y-8">
                    <p className={`text-lg ${themeColors.textTertiary} font-medium`}>Choose your preferred login method:</p>
                    <div className="flex flex-col space-y-6">
                      <button
                        onClick={login}
                        className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-secondary-900 font-black py-6 px-8 rounded-3xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-primary-500/50 text-2xl"
                      >
                        Login
                      </button>
                      <p className={`text-base ${themeColors.textTertiary} font-medium`}>
                        Login with Privy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface - transformed layout */
            <div className={`${themeColors.backgroundSecondary} rounded-3xl shadow-2xl border ${themeColors.border} overflow-hidden flex-1 flex flex-col min-h-0 backdrop-blur-xl`}>
              {/* Bottom Model Selector and Chat History Navigator - moved from top */}
              <div className={`order-3 flex items-center justify-between p-6 border-t ${themeColors.border} ${themeColors.backgroundTertiary}`}>
                <div className="flex items-center space-x-6">
                  {/* Credit Count Display - resized */}
                  <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-2 border-primary-500/40 rounded-2xl shadow-lg">
                    <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse shadow-lg shadow-primary-500/50"></div>
                    <span className={`text-lg font-bold ${themeColors.text}`}>
                      {getCreditStatus()?.remainingCredits ?? getDailyRequests().remainingToday} {getCreditStatus() ? 'Credits' : 'Requests'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`text-lg ${themeColors.textSecondary} font-medium`}>AI Model:</span>
                    <ModelSelector 
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <ContextNavigator />
                </div>
              </div>
              
              {/* Messages Area - transformed */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 min-h-0 chat-messages-container relative order-1">
                {/* Share Button - Show when there are messages - moved to left */}
                {(() => {
                  console.log('🔍 Debug Share Button - hasMessages:', hasMessages, 'messages.length:', messages.length, 'messages:', messages)
                  // Use messages.length directly instead of hasMessages
                  return messages.length > 0
                })() && (
                  <div className="sticky top-0 z-10 flex justify-start mb-6 pb-4 from-primary-900/90 to-transparent">
                    <button
                      onClick={handleShareClick}
                      className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-secondary-500 to-primary-500 hover:from-secondary-400 hover:to-primary-400 text-secondary-900 rounded-2xl transition-colors shadow-xl hover:shadow-secondary-500/50 font-bold text-lg"
                      title="Share this chat conversation with others"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span className="font-bold">Share Chat</span>
                    </button>
                  </div>
                )}
                
                {/* Welcome Message - transformed */}
                {!hasMessages && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 overflow-hidden ring-8 ring-secondary-500/40 shadow-2xl hover:scale-110 transition-all duration-500">
                      <img src="/logo.png" alt="Dobby AI Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className={`text-4xl font-black ${themeColors.text} mb-4 bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent`}>
                      Hello! I'm Dobby AI
                    </h2>
                    <p className={`${themeColors.textSecondary} mb-10 max-w-2xl mx-auto text-xl font-medium leading-relaxed`}>
                      I'm Dobby AI and you can talk to me!
                    </p>
                    <div className="space-y-4">
                      <p className={`text-lg ${themeColors.textTertiary} font-semibold`}>Try asking:</p>
                      <div className="flex flex-wrap gap-4 justify-center">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={async () => {
                              const accessToken = await getAccessToken()
                              sendMessage(suggestion, user?.id, undefined, accessToken || undefined)
                            }}
                            className={`px-6 py-3 text-lg font-semibold ${themeColors.buttonSecondary} rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              {/* Messages - transformed layout */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`chat-bubble slide-in max-w-3xl ${
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
                      <div className="prose prose-lg max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Custom styling for different markdown elements - resized
                            h1: ({node, ...props}) => <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-black mb-3 text-primary-600" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-bold mb-2 text-secondary-600" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-lg leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-2 text-base" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className={`border-l-4 ${themeColors.borderSecondary} pl-6 italic mb-4 text-lg font-medium bg-primary-100/30 py-2 rounded-r-lg`} {...props} />,
                            code: ({node, ...props}: any) => 
                              props.inline ? 
                                <code className={`${themeColors.backgroundTertiary} px-2 py-1 rounded-lg text-sm font-mono ${themeColors.text} border ${themeColors.border}`} {...props} /> :
                                <code className={`block ${themeColors.backgroundTertiary} p-4 rounded-xl text-sm font-mono mb-4 ${themeColors.text} border ${themeColors.border} overflow-x-auto`} {...props} />,
                            pre: ({node, ...props}) => <pre className={`${themeColors.backgroundTertiary} p-4 rounded-xl text-sm font-mono mb-4 overflow-x-auto ${themeColors.text} border ${themeColors.border}`} {...props} />,
                            strong: ({node, ...props}) => <strong className="font-black text-primary-600" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-secondary-600 font-semibold" {...props} />,
                            a: ({node, ...props}) => <a className="text-secondary-500 hover:text-secondary-400 underline font-semibold hover:no-underline transition-colors" {...props} />,
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

              {/* Top Input Area - moved from bottom */}
              <div className={`order-0 border-b ${themeColors.border} p-6 flex-shrink-0 min-h-0 bg-gradient-to-b from-primary-500/10 to-transparent`}>
                <form onSubmit={handleSubmit} className="flex space-x-6">
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-secondary-900 font-black rounded-2xl hover:from-primary-400 hover:to-secondary-400 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-4 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg shadow-xl hover:shadow-primary-500/50 min-w-[120px]"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-secondary-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Thinking...
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
                      className={`w-full px-6 py-4 pr-16 border-2 ${themeColors.border} rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500 focus:border-transparent ${themeColors.input} text-lg font-medium disabled:opacity-50`}
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