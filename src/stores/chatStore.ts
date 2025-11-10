import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { chatApi, ContextInfo, ApiKeyData, ApiKeyResponse, CreditStatus, CreditTransaction, CreditHistory } from '../services/api'
import { AIModelKey, AI_MODELS, LOCALSTORAGE_KEYS } from '../config/constants'

// Helper functions for localStorage
const saveSelectedModelToStorage = (model: AIModelKey) => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEYS.SELECTED_MODEL, model)
    console.log('💾 Saved selected model to localStorage:', model)
  } catch (error) {
    console.error('❌ Error saving model to localStorage:', error)
  }
}

const loadSelectedModelFromStorage = (): AIModelKey | null => {
  try {
    const savedModel = localStorage.getItem(LOCALSTORAGE_KEYS.SELECTED_MODEL) as AIModelKey
    if (savedModel && savedModel in AI_MODELS) {
      console.log('📂 Loaded selected model from localStorage:', savedModel)
      return savedModel
    }
  } catch (error) {
    console.error('❌ Error loading model from localStorage:', error)
  }
  return null
}

export interface ChatMessage {
  id: string
  uuid: string // Unique UUID for each message
  content: string
  isUser: boolean
  timestamp: Date
  isLoading?: boolean
  userId?: string
  contextId?: string // UUID of the chat history
  parentMessageId?: string // UUID of the parent message for threading
}

export interface ConversationHistory {
  role: 'user' | 'assistant'
  content: string
  uuid: string // UUID of the message
  contextId?: string // Chat history UUID
}

export interface UsageData {
  date: string
  requests: number
}

// Credit system interfaces (keeping for backward compatibility)
export interface DailyRequestsData {
  dailyLimit: number
  usedToday: number
  remainingToday: number
  lastResetDate: string
  totalRequests: number
}

interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  sessionId: string
  userId?: string
  selectedModel: AIModelKey
  currentContextId?: string // Current chat history
  messageHistory: ChatMessage[] // Full message history for chat history navigation
  serverContexts: ContextInfo[] // Contexts loaded from server
  contextsLoading: boolean
  usageData: UsageData[] // AI chat usage tracking
  dailyRequests: DailyRequestsData // Daily requests system (legacy)
  apiKey: ApiKeyData | null // Current API key
  apiKeyLoading: boolean // API key loading state
  // Credit system
  creditStatus: CreditStatus | null // Current credit status from backend
  creditTransactions: CreditTransaction[] // Credit transaction history
  creditHistory: CreditHistory | null // Credit usage history
  creditLoading: boolean // Credit system loading state
  sendMessage: (content: string, userId?: string, model?: AIModelKey, accessToken?: string, contextId?: string) => Promise<void>
  addMessage: (content: string, isUser: boolean, isLoading?: boolean, userId?: string, contextId?: string, parentMessageId?: string) => void
  clearChat: () => void
  hasMessages: boolean
  setUserId: (userId: string) => void
  setSelectedModel: (model: AIModelKey) => void
  setCurrentContext: (contextId: string) => void
  getMessagesByContext: (contextId: string) => ChatMessage[]
  createNewContext: () => string
  loadContextsFromServer: (accessToken?: string) => Promise<void>
  loadContextFromServer: (contextId: string, accessToken?: string) => Promise<void>
  shareChatHistory: () => Promise<void>
  loadSharedChatHistory: (sharedData: any) => void
  trackUsage: () => void
  getUsageData: () => UsageData[]
  checkDailyLimit: () => boolean
  useDailyRequest: () => boolean
  resetDailyRequests: () => void
  getDailyRequests: () => DailyRequestsData
  // API Key management
  createApiKey: (accessToken: string) => Promise<ApiKeyResponse>
  regenerateApiKey: (accessToken: string) => Promise<ApiKeyResponse>
  getApiKey: (accessToken: string) => Promise<ApiKeyResponse>
  updateApiKey: (updates: { name?: string; isActive?: boolean }, accessToken: string) => Promise<ApiKeyResponse>
  loadApiKeyFromServer: (accessToken: string) => Promise<void>
  // Credit system management
  loadCreditStatus: (accessToken?: string) => Promise<void>
  loadCreditTransactions: (limit?: number, accessToken?: string) => Promise<void>
  loadCreditHistory: (days?: number, accessToken?: string) => Promise<void>
  getCreditStatus: () => CreditStatus | null
  getCreditTransactions: () => CreditTransaction[]
  getCreditHistory: () => CreditHistory | null
}

// Helper function to load usage data from localStorage
const loadUsageDataFromStorage = (): UsageData[] => {
  try {
    const saved = localStorage.getItem('dobby-ai-usage-data')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('❌ Error loading usage data from localStorage:', error)
  }
  return []
}

// Helper function to save usage data to localStorage
const saveUsageDataToStorage = (data: UsageData[]) => {
  try {
    localStorage.setItem('dobby-ai-usage-data', JSON.stringify(data))
  } catch (error) {
    console.error('❌ Error saving usage data to localStorage:', error)
  }
}

// Helper function to generate mock usage data for demonstration
const generateMockUsageData = (): UsageData[] => {
  const data: UsageData[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Generate realistic usage pattern with some randomness
    const baseRequests = Math.floor(Math.random() * 15) + 5
    const dayOfWeek = date.getDay()
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.2
    const requests = Math.floor(baseRequests * weekendMultiplier)
    
    data.push({
      date: date.toISOString().split('T')[0],
      requests: Math.max(0, requests)
    })
  }
  
  return data
}

// Helper function to load daily requests data from localStorage
const loadDailyRequestsFromStorage = (): DailyRequestsData => {
  try {
    const saved = localStorage.getItem('dobby-ai-daily-requests')
    if (saved) {
      const data = JSON.parse(saved)
      const today = new Date().toISOString().split('T')[0]
      
      // Reset daily count if it's a new day
      if (data.lastResetDate !== today) {
        return {
          dailyLimit: 500,
          usedToday: 0,
          remainingToday: 500,
          lastResetDate: today,
          totalRequests: data.totalRequests || 0
        }
      }
      
      return data
    }
  } catch (error) {
    console.error('❌ Error loading daily requests from localStorage:', error)
  }
  
  // Default daily requests for new users
  const today = new Date().toISOString().split('T')[0]
  return {
    dailyLimit: 500,
    usedToday: 0,
    remainingToday: 500,
    lastResetDate: today,
    totalRequests: 0
  }
}

// Helper function to save daily requests data to localStorage
const saveDailyRequestsToStorage = (dailyRequests: DailyRequestsData) => {
  try {
    localStorage.setItem('dobby-ai-daily-requests', JSON.stringify(dailyRequests))
  } catch (error) {
    console.error('❌ Error saving daily requests to localStorage:', error)
  }
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  sessionId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  userId: undefined,
  selectedModel: loadSelectedModelFromStorage() || 'dobby-70b',
  currentContextId: undefined,
  messageHistory: [],
  serverContexts: [],
  contextsLoading: false,
  usageData: loadUsageDataFromStorage().length > 0 ? loadUsageDataFromStorage() : generateMockUsageData(),
  dailyRequests: loadDailyRequestsFromStorage(),
  apiKey: null,
  apiKeyLoading: false,
  creditStatus: null,
  creditTransactions: [],
  creditHistory: null,
  creditLoading: false,

  setUserId: (userId: string) => {
    set({ userId })
  },

  setSelectedModel: (model: AIModelKey) => {
    set({ selectedModel: model })
    saveSelectedModelToStorage(model)
  },

  addMessage: (content: string, isUser: boolean, isLoading = false, userId?: string, contextId?: string, parentMessageId?: string) => {
    const { currentContextId } = get()
    const messageUuid = uuidv4()
    const messageHistoryId = contextId || currentContextId || uuidv4()
    
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      uuid: messageUuid,
      content,
      isUser,
      timestamp: new Date(),
      isLoading,
      userId: userId || get().userId,
      contextId: messageHistoryId,
      parentMessageId
    }
    
    set((state) => ({
      messages: [...state.messages, message],
      messageHistory: [...state.messageHistory, message],
      currentContextId: messageHistoryId // Always set current context
    }))
  },

  sendMessage: async (content: string, userId?: string, model?: AIModelKey, accessToken?: string, contextId?: string) => {
    if (!content.trim()) return

    const { addMessage, messages, sessionId, userId: currentUserId, selectedModel, currentContextId, trackUsage, apiKey, creditStatus } = get()
    const finalUserId = userId || currentUserId
    const finalModel = model || selectedModel
    const finalHistoryId = contextId || currentContextId || uuidv4() // Create new context if none exists
    
    // Check if user has credits available (backend will handle the actual charging)
    if (creditStatus && !creditStatus.canMakeRequest) {
      addMessage('Insufficient credits. You have used all your daily credits. Please try again tomorrow.', false, false, finalUserId, finalHistoryId)
      return
    }
    
    // Build conversation history for chat history
    const conversationHistory: ConversationHistory[] = messages
      .filter(msg => !msg.isLoading && msg.contextId === finalHistoryId) // Only current chat history messages
      .map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content,
        uuid: msg.uuid,
        contextId: msg.contextId
      }))
    
    console.log('🔍 Debug - Current contextId:', currentContextId, 'Final historyId:', finalHistoryId, 'Messages count:', messages.length, 'Conversation history length:', conversationHistory.length)
    
    // Track usage when user sends a message
    trackUsage()
    
    // Добавляем сообщение пользователя
    addMessage(content, true, false, finalUserId, finalHistoryId)
    
    // Добавляем индикатор загрузки
    const loadingMessageId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const loadingMessage: ChatMessage = {
      id: loadingMessageId,
      uuid: uuidv4(),
      content: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
      userId: finalUserId,
      contextId: finalHistoryId
    }
    
    set((state) => ({
      messages: [...state.messages, loadingMessage],
      messageHistory: [...state.messageHistory, loadingMessage],
      isLoading: true
    }))

    try {
      const modelEndpoint = finalModel ? AI_MODELS[finalModel].endpoint : 'default'
      console.log('📤 Sending message with model:', finalModel, 'endpoint:', modelEndpoint, 'for user:', finalUserId, 'with auth method:', apiKey ? 'API Key' : accessToken ? 'Privy Token' : 'None', 'context ID:', finalHistoryId)
      const response = await chatApi.sendMessage(content, sessionId, conversationHistory, finalModel, accessToken, finalHistoryId, apiKey?.key)
      
      // Удаляем индикатор загрузки и добавляем ответ
      set((state) => ({
        messages: state.messages.filter(msg => msg.id !== loadingMessageId),
        messageHistory: state.messageHistory.filter(msg => msg.id !== loadingMessageId),
        isLoading: false
      }))
      
      addMessage(response.response, false, false, finalUserId, finalHistoryId)
      
      // Refresh credit status after successful request
      if (accessToken) {
        get().loadCreditStatus(accessToken)
      }
    } catch (error: any) {
      console.error('Error in chat store:', error)
      
      // Удаляем индикатор загрузки и добавляем сообщение об ошибке
      set((state) => ({
        messages: state.messages.filter(msg => msg.id !== loadingMessageId),
        messageHistory: state.messageHistory.filter(msg => msg.id !== loadingMessageId),
        isLoading: false
      }))
      
      // Handle credit errors specifically
      if (error.response?.status === 402) {
        addMessage('Insufficient credits. You have used all your daily credits. Please try again tomorrow.', false, false, finalUserId, finalHistoryId)
        // Refresh credit status to update UI
        if (accessToken) {
          get().loadCreditStatus(accessToken)
        }
      } else {
        addMessage('Sorry, an error occurred. Please try again!', false, false, finalUserId, finalHistoryId)
      }
    }
  },

  clearChat: () => {
    set({ 
      messages: [],
      messageHistory: [],
      currentContextId: undefined,
      sessionId: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    })
  },

  setCurrentContext: (contextId: string) => {
    const { messageHistory } = get()
    const contextMessages = messageHistory.filter(msg => msg.contextId === contextId)
    
    console.log('🔄 Setting current context:', contextId, 'Found', contextMessages.length, 'messages in messageHistory')
    
    set({
      currentContextId: contextId,
      messages: contextMessages
    })
  },

  getMessagesByContext: (contextId: string) => {
    const { messageHistory } = get()
    return messageHistory.filter(msg => msg.contextId === contextId)
  },

  createNewContext: () => {
    const newContextId = uuidv4()
    set({
      currentContextId: newContextId,
      messages: []
    })
    return newContextId
  },

  loadContextsFromServer: async (accessToken?: string) => {
    if (!accessToken) {
      console.log('⚠️ No access token provided for loading contexts')
      return
    }

    set({ contextsLoading: true })
    
    try {
      console.log('📥 Loading contexts from server...')
      const { apiKey } = get()
      const response = await chatApi.getContexts(accessToken, apiKey?.key)
      
      console.log('✅ Loaded contexts from server:', response.contexts.length, 'contexts')
      
      set({
        serverContexts: response.contexts,
        contextsLoading: false
      })
    } catch (error) {
      console.error('❌ Error loading contexts from server:', error)
      set({ contextsLoading: false })
    }
  },

  loadContextFromServer: async (contextId: string, accessToken?: string) => {
    if (!accessToken) {
      console.log('⚠️ No access token provided for loading context')
      return
    }

    try {
      console.log('📥 Loading context from server:', contextId)
      const { apiKey } = get()
      const contextInfo = await chatApi.getContext(contextId, accessToken, apiKey?.key)
      
      // Convert server messages to local format
      const serverMessages: ChatMessage[] = contextInfo.messages.map((msg: any) => ({
        id: msg.id || uuidv4(),
        uuid: msg.uuid || uuidv4(),
        content: msg.content,
        isUser: msg.role === 'user',
        timestamp: new Date(msg.timestamp || Date.now()),
        isLoading: false,
        userId: msg.userId,
        contextId: contextInfo.context,
        parentMessageId: msg.parentMessageId
      }))
      
      console.log('✅ Loaded context from server:', contextId, 'with', serverMessages.length, 'messages')
      
      set((state) => ({
        currentContextId: contextId,
        messages: serverMessages,
        messageHistory: [...state.messageHistory, ...serverMessages.filter(msg => 
          !state.messageHistory.some(existing => existing.uuid === msg.uuid)
        )]
      }))
      
      console.log('✅ Context loaded and set. Current messages count:', serverMessages.length)
    } catch (error) {
      console.error('❌ Error loading context from server:', error)
    }
  },

  shareChatHistory: async () => {
    const { messages, currentContextId, selectedModel } = get()
    
    if (messages.length === 0) {
      console.log('⚠️ No messages to share')
      return
    }

    try {
      // Create shareable data
      const shareData = {
        contextId: currentContextId,
        model: selectedModel,
        messages: messages.map(msg => ({
          content: msg.content,
          isUser: msg.isUser,
          timestamp: msg.timestamp.toISOString()
        })),
        sharedAt: new Date().toISOString()
      }

      // Generate shareable URL (you can customize this based on your needs)
      const shareUrl = `${window.location.origin}?shared=${encodeURIComponent(JSON.stringify(shareData))}`
      
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Dobby AI Chat History',
          text: `Check out this chat with Dobby AI (${selectedModel})`,
          url: shareUrl
        })
        console.log('✅ Chat history shared via Web Share API')
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        console.log('✅ Chat history URL copied to clipboard')
        
        // Show a temporary notification (you might want to add a toast notification)
        alert('Chat history URL copied to clipboard!')
      }
    } catch (error) {
      console.error('❌ Error sharing chat history:', error)
      
      // Fallback: copy messages as text
      try {
        const textContent = messages.map(msg => 
          `${msg.isUser ? 'You' : 'Dobby AI'}: ${msg.content}`
        ).join('\n\n')
        
        await navigator.clipboard.writeText(textContent)
        console.log('✅ Chat history copied as text to clipboard')
        alert('Chat history copied as text to clipboard!')
      } catch (clipboardError) {
        console.error('❌ Error copying to clipboard:', clipboardError)
        alert('Unable to share chat history. Please try again.')
      }
    }
  },

  loadSharedChatHistory: (sharedData: any) => {
    try {
      console.log('📥 Loading shared chat history:', sharedData)
      
      // Convert shared messages to local format
      const sharedMessages: ChatMessage[] = sharedData.messages.map((msg: any, index: number) => ({
        id: `shared_${index}_${Date.now()}`,
        uuid: uuidv4(),
        content: msg.content,
        isUser: msg.isUser,
        timestamp: new Date(msg.timestamp),
        isLoading: false,
        userId: undefined, // Shared messages don't have user ID
        contextId: sharedData.contextId || 'shared',
        parentMessageId: undefined
      }))
      
      // Set the model if provided
      if (sharedData.model) {
        set({ selectedModel: sharedData.model })
      }
      
      // Set the messages
      set({
        currentContextId: sharedData.contextId || 'shared',
        messages: sharedMessages,
        messageHistory: [...get().messageHistory, ...sharedMessages]
      })
      
      console.log('✅ Shared chat history loaded:', sharedMessages.length, 'messages')
    } catch (error) {
      console.error('❌ Error loading shared chat history:', error)
    }
  },

  get hasMessages() {
    return get().messages.length > 0
  },

  trackUsage: () => {
    const { usageData } = get()
    const today = new Date().toISOString().split('T')[0]
    
    // Find today's entry or create it
    const todayIndex = usageData.findIndex(item => item.date === today)
    
    if (todayIndex >= 0) {
      // Increment today's count
      const updatedData = [...usageData]
      updatedData[todayIndex] = {
        ...updatedData[todayIndex],
        requests: updatedData[todayIndex].requests + 1
      }
      
      set({ usageData: updatedData })
      saveUsageDataToStorage(updatedData)
    } else {
      // Add new entry for today
      const updatedData = [
        ...usageData,
        { date: today, requests: 1 }
      ]
      
      set({ usageData: updatedData })
      saveUsageDataToStorage(updatedData)
    }
    
    console.log('📊 Usage tracked for', today)
  },

  getUsageData: () => {
    return get().usageData
  },

  checkDailyLimit: () => {
    const { dailyRequests } = get()
    const today = new Date().toISOString().split('T')[0]
    
    // Reset if it's a new day
    if (dailyRequests.lastResetDate !== today) {
      const updatedDailyRequests: DailyRequestsData = {
        dailyLimit: 500,
        usedToday: 0,
        remainingToday: 500,
        lastResetDate: today,
        totalRequests: dailyRequests.totalRequests
      }
      
      set({ dailyRequests: updatedDailyRequests })
      saveDailyRequestsToStorage(updatedDailyRequests)
      
      return true // Can use request after reset
    }
    
    return dailyRequests.remainingToday > 0
  },

  useDailyRequest: () => {
    const { dailyRequests } = get()
    const today = new Date().toISOString().split('T')[0]
    
    // Reset if it's a new day
    if (dailyRequests.lastResetDate !== today) {
      const updatedDailyRequests: DailyRequestsData = {
        dailyLimit: 500,
        usedToday: 1,
        remainingToday: 499,
        lastResetDate: today,
        totalRequests: dailyRequests.totalRequests + 1
      }
      
      set({ dailyRequests: updatedDailyRequests })
      saveDailyRequestsToStorage(updatedDailyRequests)
      
      console.log('📊 Daily request used (reset): 1/500')
      return true
    }
    
    if (dailyRequests.remainingToday <= 0) {
      console.log('❌ Daily request limit reached:', dailyRequests.usedToday, '/', dailyRequests.dailyLimit)
      return false
    }
    
    const updatedDailyRequests: DailyRequestsData = {
      ...dailyRequests,
      usedToday: dailyRequests.usedToday + 1,
      remainingToday: dailyRequests.remainingToday - 1,
      totalRequests: dailyRequests.totalRequests + 1
    }
    
    set({ dailyRequests: updatedDailyRequests })
    saveDailyRequestsToStorage(updatedDailyRequests)
    
    console.log('📊 Daily request used:', updatedDailyRequests.usedToday, '/', updatedDailyRequests.dailyLimit, 'Remaining:', updatedDailyRequests.remainingToday)
    return true
  },

  resetDailyRequests: () => {
    const today = new Date().toISOString().split('T')[0]
    const updatedDailyRequests: DailyRequestsData = {
      dailyLimit: 500,
      usedToday: 0,
      remainingToday: 500,
      lastResetDate: today,
      totalRequests: get().dailyRequests.totalRequests
    }
    
    set({ dailyRequests: updatedDailyRequests })
    saveDailyRequestsToStorage(updatedDailyRequests)
    
    console.log('🔄 Daily requests reset for new day')
  },

  getDailyRequests: () => {
    return get().dailyRequests
  },

  // API Key management methods
  createApiKey: async (accessToken: string) => {
    set({ apiKeyLoading: true })
    
    try {
      const response = await chatApi.createDefaultApiKey(accessToken)
      
      if (response.success && response.data) {
        set({ apiKey: response.data, apiKeyLoading: false })
        console.log('✅ API key created successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ Error creating API key:', error)
      set({ apiKeyLoading: false })
      throw error
    }
  },

  regenerateApiKey: async (accessToken: string) => {
    set({ apiKeyLoading: true })
    
    try {
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      
      const response = await chatApi.regenerateApiKey(
        'Dobby AI API Key',
        ['chat:send', 'chat:history', 'chat:contexts', 'chat:shared'],
        oneYearFromNow.toISOString(),
        accessToken
      )
      
      if (response.success && response.data) {
        set({ apiKey: response.data, apiKeyLoading: false })
        console.log('✅ API key regenerated successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ Error regenerating API key:', error)
      set({ apiKeyLoading: false })
      throw error
    }
  },

  getApiKey: async (accessToken: string) => {
    set({ apiKeyLoading: true })
    
    try {
      const response = await chatApi.getApiKey(accessToken)
      
      if (response.success && response.data) {
        set({ apiKey: response.data, apiKeyLoading: false })
        console.log('✅ API key loaded successfully')
      } else {
        set({ apiKey: null, apiKeyLoading: false })
        console.log('ℹ️ No API key found')
      }
      
      return response
    } catch (error) {
      console.error('❌ Error loading API key:', error)
      set({ apiKey: null, apiKeyLoading: false })
      throw error
    }
  },

  updateApiKey: async (updates: { name?: string; isActive?: boolean }, accessToken: string) => {
    set({ apiKeyLoading: true })
    
    try {
      const response = await chatApi.updateApiKey(updates, accessToken)
      
      if (response.success && response.data) {
        set({ apiKey: response.data, apiKeyLoading: false })
        console.log('✅ API key updated successfully')
      }
      
      return response
    } catch (error) {
      console.error('❌ Error updating API key:', error)
      set({ apiKeyLoading: false })
      throw error
    }
  },

  loadApiKeyFromServer: async (accessToken: string) => {
    try {
      await get().getApiKey(accessToken)
    } catch (error) {
      console.error('❌ Error loading API key from server:', error)
    }
  },

  // Credit system management methods
  loadCreditStatus: async (accessToken?: string) => {
    if (!accessToken) {
      console.log('⚠️ No access token provided for loading credit status')
      return
    }

    set({ creditLoading: true })
    
    try {
      const { apiKey } = get()
      const response = await chatApi.getCreditStatus(accessToken, apiKey?.key)
      
      if (response.success && response.data) {
        set({ creditStatus: response.data as CreditStatus, creditLoading: false })
        console.log('✅ Credit status loaded successfully')
      } else {
        set({ creditStatus: null, creditLoading: false })
        console.log('ℹ️ No credit status found')
      }
    } catch (error) {
      console.error('❌ Error loading credit status:', error)
      set({ creditStatus: null, creditLoading: false })
    }
  },

  loadCreditTransactions: async (limit: number = 50, accessToken?: string) => {
    if (!accessToken) {
      console.log('⚠️ No access token provided for loading credit transactions')
      return
    }

    set({ creditLoading: true })
    
    try {
      const { apiKey } = get()
      const response = await chatApi.getCreditTransactions(limit, accessToken, apiKey?.key)
      
      if (response.success && response.data) {
        set({ creditTransactions: response.data as CreditTransaction[], creditLoading: false })
        console.log('✅ Credit transactions loaded successfully')
      } else {
        set({ creditTransactions: [], creditLoading: false })
        console.log('ℹ️ No credit transactions found')
      }
    } catch (error) {
      console.error('❌ Error loading credit transactions:', error)
      set({ creditTransactions: [], creditLoading: false })
    }
  },

  loadCreditHistory: async (days: number = 7, accessToken?: string) => {
    if (!accessToken) {
      console.log('⚠️ No access token provided for loading credit history')
      return
    }

    set({ creditLoading: true })
    
    try {
      const { apiKey } = get()
      const response = await chatApi.getCreditHistory(days, accessToken, apiKey?.key)
      
      if (response.success && response.data) {
        set({ creditHistory: response.data as CreditHistory, creditLoading: false })
        console.log('✅ Credit history loaded successfully')
      } else {
        set({ creditHistory: null, creditLoading: false })
        console.log('ℹ️ No credit history found')
      }
    } catch (error) {
      console.error('❌ Error loading credit history:', error)
      set({ creditHistory: null, creditLoading: false })
    }
  },

  getCreditStatus: () => {
    return get().creditStatus
  },

  getCreditTransactions: () => {
    return get().creditTransactions
  },

  getCreditHistory: () => {
    return get().creditHistory
  }
})) 