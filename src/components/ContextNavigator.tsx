import React, { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useChatStore } from '../stores/chatStore'
import { useTheme } from '../contexts/ThemeContext'
import SharedContextManager from './SharedContextManager'

interface ChatHistoryInfo {
  historyId: string
  title: string
  messageCount: number
  lastMessage: Date
}

const ContextNavigator: React.FC = () => {
  const { getAccessToken } = usePrivy()
  const { 
    messageHistory, 
    currentContextId, 
    setCurrentContext, 
    createNewContext,
    getMessagesByContext,
    serverContexts,
    contextsLoading,
    loadContextFromServer
  } = useChatStore()
  const { themeColors } = useTheme()
  
  const [isOpen, setIsOpen] = useState(false)
  const [showSharedManager, setShowSharedManager] = useState(false)

  // Get unique chat histories from server contexts and local message history
  const getChatHistories = (): ChatHistoryInfo[] => {
    const historyMap = new Map<string, ChatHistoryInfo>()
    
    // First, add server contexts
    serverContexts.forEach(serverContext => {
      const firstUserMessage = serverContext.messages.find((msg: any) => msg.role === 'user')
      
      historyMap.set(serverContext.context, {
        historyId: serverContext.context,
        title: firstUserMessage?.content?.slice(0, 50) + '...' || 'Server Chat',
        messageCount: serverContext.totalMessages,
        lastMessage: new Date(serverContext.lastUpdated)
      })
    })
    
    // Then, add local contexts that aren't on server
    messageHistory.forEach(msg => {
      if (!msg.contextId) return
      
      if (!historyMap.has(msg.contextId)) {
        const historyMessages = getMessagesByContext(msg.contextId)
        const firstUserMessage = historyMessages.find(m => m.isUser)
        
        historyMap.set(msg.contextId, {
          historyId: msg.contextId,
          title: firstUserMessage?.content.slice(0, 50) + '...' || 'Local Chat',
          messageCount: historyMessages.length,
          lastMessage: msg.timestamp
        })
      }
    })
    
    return Array.from(historyMap.values()).sort((a, b) => 
      b.lastMessage.getTime() - a.lastMessage.getTime()
    )
  }

  const chatHistories = getChatHistories()

  const handleHistorySelect = async (historyId: string) => {
    // Check if this is a server context
    const serverContext = serverContexts.find(ctx => ctx.context === historyId)
    
    if (serverContext) {
      // Load from server with access token
      const accessToken = await getAccessToken()
      if (accessToken) {
        await loadContextFromServer(historyId, accessToken)
      } else {
        console.error('❌ No access token available for loading context')
      }
    } else {
      // Use local context
      setCurrentContext(historyId)
    }
    
    setIsOpen(false)
  }

  const handleNewChat = () => {
    createNewContext()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-4 px-6 py-4 ${themeColors.buttonSecondary} rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}
      >
        <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span className={`text-lg font-bold ${themeColors.text}`}>Chat History</span>
        <span className={`text-sm font-bold ${themeColors.backgroundTertiary} px-3 py-2 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-primary-500/30`}>
          {contextsLoading ? '...' : chatHistories.length}
        </span>
        <svg
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${themeColors.textSecondary}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 w-96 ${themeColors.dropdown} border-2 ${themeColors.border} rounded-2xl shadow-2xl z-50 backdrop-blur-xl`}>
          <div className="p-4">
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="w-full flex items-center space-x-4 px-6 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-secondary-900 rounded-2xl transition-all duration-300 mb-4 font-bold text-lg shadow-xl hover:shadow-primary-500/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-black">New Chat</span>
            </button>


            {/* Chat History List */}
            {chatHistories.length > 0 && (
              <div className={`border-t-2 ${themeColors.border} pt-4`}>
                <p className={`text-lg font-bold ${themeColors.textSecondary} px-4 py-2 mb-3`}>Recent Chats</p>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {chatHistories.map((chatHistory) => (
                    <button
                      key={chatHistory.historyId}
                      onClick={() => handleHistorySelect(chatHistory.historyId)}
                      className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                        chatHistory.historyId === currentContextId
                          ? `${themeColors.dropdownItemSelected} shadow-lg ring-2 ring-secondary-500/50`
                          : `${themeColors.dropdownItem} hover:${themeColors.backgroundTertiary}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold truncate mb-1">
                            {chatHistory.title}
                          </p>
                          <div className={`flex items-center space-x-3 text-sm ${themeColors.textTertiary} font-medium`}>
                            <span>{chatHistory.messageCount} messages</span>
                            <span>•</span>
                            <span>
                              {chatHistory.lastMessage.toLocaleDateString()} {chatHistory.lastMessage.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        {chatHistory.historyId === currentContextId && (
                          <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full ml-3 shadow-lg"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistories.length === 0 && (
              <div className="text-center py-8">
                <p className={`text-lg font-semibold ${themeColors.textTertiary}`}>No chat history yet</p>
                <p className={`text-base ${themeColors.textTertiary} mt-2 font-medium`}>Start a new chat to see it here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shared Context Manager Modal */}
      {showSharedManager && (
        <div className="fixed inset-0 bg-primary-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${themeColors.backgroundSecondary} rounded-3xl p-8 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border-2 ${themeColors.border} backdrop-blur-xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-3xl font-black ${themeColors.text} bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent`}>Shared Contexts</h2>
              <button
                onClick={() => setShowSharedManager(false)}
                className={`${themeColors.textTertiary} hover:${themeColors.text} transition-all duration-300 hover:scale-110 p-2 rounded-xl ${themeColors.buttonSecondary}`}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SharedContextManager />
          </div>
        </div>
      )}
    </div>
  )
}

export default ContextNavigator
