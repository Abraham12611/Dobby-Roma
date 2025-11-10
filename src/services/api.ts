import axios from 'axios'
import { AIModelKey, AI_MODELS } from '../config/constants'


console.log('env',(import.meta as any).env.DEV)
const API_BASE_URL = (import.meta as any).env?.DEV ? 'http://localhost:3001' : 'https://api.uselessai.fun/'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ChatResponse {
  response: string
  timestamp: Date
}

export interface ContextInfo {
  context: string
  messages: any[]
  createdAt: string
  lastUpdated: string
  totalMessages: number
  sessionId: string
  model: string
}

export interface ContextsResponse {
  userId: string
  contexts: ContextInfo[]
  stats: {
    totalMessages: number
    totalContexts: number
    lastUpdated: string
  }
}

export interface SharedContextInfo {
  shareId: string
  title: string
  description: string
  totalMessages: number
  createdAt: string
  lastUpdated: string
  model: string
}

export interface SharedContextsResponse {
  success: boolean
  sharedContexts: SharedContextInfo[]
}

export interface ShareContextRequest {
  contextId: string
  title: string
  description: string
  isPublic: boolean
}

export interface ShareContextResponse {
  success: boolean
  shareId: string
  shareUrl: string
  message: string
}

export interface SharedContextData {
  shareId: string
  title: string
  description: string
  originalUserId: string
  originalContextId: string
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    sessionId: string
    contextId: string
    model: string
  }>
  totalMessages: number
  createdAt: string
  lastUpdated: string
  model: string
}

export interface SharedContextResponse {
  success?: boolean
  sharedContext?: SharedContextData
  // Direct response format (when server returns data directly)
  shareId?: string
  title?: string
  description?: string
  messages?: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    sessionId: string
    contextId: string
    model: string
  }>
  totalMessages?: number
  createdAt?: string
  lastUpdated?: string
  model?: string
}

// API Key interfaces
export interface ApiKeyData {
  id: string
  userId: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  lastUsed?: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface ApiKeyResponse {
  success: boolean
  data: ApiKeyData | null
  message: string
}

export interface CreateApiKeyRequest {
  name: string
  permissions: string[]
  expiresAt: string
}

export interface UpdateApiKeyRequest {
  name?: string
  isActive?: boolean
}

// Credit System interfaces
export interface CreditStatus {
  userId: string
  dailyCredits: number
  usedCredits: number
  remainingCredits: number
  lastResetDate: string
  canMakeRequest: boolean
}

export interface CreditTransaction {
  id: string
  type: 'charge' | 'refund' | 'reset'
  amount: number
  description: string
  timestamp: string
}

export interface CreditHistory {
  userId: string
  dailyUsage: Array<{
    date: string
    usedCredits: number
    remainingCredits: number
  }>
  totalUsed: number
  averageDailyUsage: number
}

export interface CreditResponse {
  success: boolean
  data: CreditStatus | CreditTransaction[] | CreditHistory | null
  message?: string
}

export const chatApi = {
  async sendMessage(
    message: string, 
    sessionId?: string, 
    conversationHistory?: Array<{role: 'user' | 'assistant'; content: string; uuid: string; contextId?: string}>,
    model?: AIModelKey,
    accessToken?: string,
    contextId?: string,
    apiKey?: string
  ): Promise<ChatResponse> {
    // Get the endpoint for the selected model
    const modelEndpoint = model ? AI_MODELS[model].endpoint : undefined
    
    const requestData = {
      message,
      sessionId,
      conversationHistory,
      model: modelEndpoint, // Send endpoint instead of model key
      contextId, // Send chat context UUID
    }
    
    // Prepare headers with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Add authentication - prioritize API key over Privy token
    if (apiKey) {
      headers['X-API-Key'] = apiKey
      console.log('🔑 Using API key authentication')
    } else if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
      console.log('🔐 Using Privy token authentication')
    }
    
    // Log the request to verify model endpoint, auth, and context are being sent
    console.log('🚀 Sending API request with model endpoint:', modelEndpoint, 'Auth method:', apiKey ? 'API Key' : accessToken ? 'Privy Token' : 'None', 'Context ID:', contextId)
    console.log('📋 Full request data:', JSON.stringify(requestData, null, 2))
    
    const response = await api.post<ChatResponse>('/chat/send', requestData, { headers })
    return response.data
  },

  async getContexts(accessToken?: string, apiKey?: string): Promise<ContextsResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey
    } else if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    console.log('📥 Fetching contexts from server with auth method:', apiKey ? 'API Key' : accessToken ? 'Privy Token' : 'None')
    
    const response = await api.get<ContextsResponse>('/chat/contexts', { headers })
    return response.data
  },

  async getContext(contextId: string, accessToken?: string, apiKey?: string): Promise<ContextInfo> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey
    } else if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    console.log('📥 Fetching context:', contextId, 'with auth method:', apiKey ? 'API Key' : accessToken ? 'Privy Token' : 'None')
    
    const response = await api.get<ContextInfo>(`/chat/context/${contextId}`, { headers })
    return response.data
  },

  // Shared Context methods
  async shareContext(
    contextId: string, 
    title: string, 
    description: string, 
    accessToken: string
  ): Promise<ShareContextResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
    
    const requestData: ShareContextRequest = {
      contextId,
      title,
      description,
      isPublic: true
    }
    
    console.log('🔗 Sharing context:', contextId, 'with title:', title)
    
    const response = await api.post<ShareContextResponse>('/chat/shared', requestData, { headers })
    return response.data
  },

  async getSharedContexts(accessToken: string): Promise<SharedContextsResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
    
    console.log('📥 Fetching shared contexts')
    
    const response = await api.get<SharedContextsResponse>('/chat/shared', { headers })
    return response.data
  },

  async deleteSharedContext(shareId: string, accessToken: string): Promise<{ success: boolean; message: string }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
    
    console.log('🗑️ Deleting shared context:', shareId)
    
    const response = await api.post<{ success: boolean; message: string }>(`/chat/shared/${shareId}/delete`, {}, { headers })
    return response.data
  },

  async getPublicSharedContext(shareId: string): Promise<SharedContextResponse> {
    console.log('📖 Fetching public shared context:', shareId)
    
    const response = await api.get<SharedContextResponse>(`/shared/${shareId}`)
    return response.data
  },

  // API Key Management methods
  async createApiKey(
    name: string,
    permissions: string[],
    expiresAt: string,
    accessToken: string
  ): Promise<ApiKeyResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
    
    const requestData: CreateApiKeyRequest = {
      name,
      permissions,
      expiresAt
    }
    
    console.log('🔑 Creating API key:', name)
    
    const response = await api.post<ApiKeyResponse>('/api-key', requestData, { headers })
    return response.data
  },

  async regenerateApiKey(
    name: string,
    permissions: string[],
    expiresAt: string,
    accessToken: string
  ): Promise<ApiKeyResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
    
    const requestData: CreateApiKeyRequest = {
      name,
      permissions,
      expiresAt
    }
    
    console.log('🔄 Regenerating API key:', name)
    
    const response = await api.post<ApiKeyResponse>('/api-key/regenerate', requestData, { headers })
    return response.data
  },

  async getApiKey(accessToken: string): Promise<ApiKeyResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
    
    console.log('📥 Fetching API key')
    
    const response = await api.get<ApiKeyResponse>('/api-key', { headers })
    return response.data
  },

  async updateApiKey(
    updates: UpdateApiKeyRequest,
    accessToken: string
  ): Promise<ApiKeyResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
    
    console.log('✏️ Updating API key:', updates)
    
    const response = await api.put<ApiKeyResponse>('/api-key', updates, { headers })
    return response.data
  },

  // Helper method to create API key with default permissions
  async createDefaultApiKey(accessToken: string): Promise<ApiKeyResponse> {
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    
    return this.createApiKey(
      'Dobby AI API Key',
      ['chat:send', 'chat:history', 'chat:contexts', 'chat:shared'],
      oneYearFromNow.toISOString(),
      accessToken
    )
  },

  // Credit System methods
  async getCreditStatus(accessToken?: string, apiKey?: string): Promise<CreditResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey
    } else if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    console.log('📊 Fetching credit status with auth method:', apiKey ? 'API Key' : accessToken ? 'Privy Token' : 'None')
    
    const response = await api.get<CreditResponse>('/credits/status', { headers })
    return response.data
  },

  async getCreditTransactions(limit: number = 50, accessToken?: string, apiKey?: string): Promise<CreditResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey
    } else if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    console.log('📋 Fetching credit transactions with limit:', limit)
    
    const response = await api.get<CreditResponse>(`/credits/transactions?limit=${limit}`, { headers })
    return response.data
  },

  async getCreditHistory(days: number = 7, accessToken?: string, apiKey?: string): Promise<CreditResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey
    } else if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    
    console.log('📈 Fetching credit history for', days, 'days')
    
    const response = await api.get<CreditResponse>(`/credits/history?days=${days}`, { headers })
    return response.data
  },
}

export default api 