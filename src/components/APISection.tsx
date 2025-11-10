import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useChatStore } from '../stores/chatStore'
import { usePrivy } from '@privy-io/react-auth'
import CodeHighlighter from './CodeHighlighter'

const APISection: React.FC = () => {
  const { themeColors } = useTheme()
  const { getDailyRequests, getUsageData, apiKey, apiKeyLoading, createApiKey, regenerateApiKey, updateApiKey, getCreditStatus } = useChatStore()
  const { getAccessToken } = usePrivy()
  const [showApiKey, setShowApiKey] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [hasShownConfirmation, setHasShownConfirmation] = useState(false)
  
  const dailyRequests = getDailyRequests()
  const usageData = getUsageData()
  const creditStatus = getCreditStatus()
  
  // Calculate API usage statistics
  const totalRequests = usageData.reduce((sum, item) => sum + item.requests, 0)
  const last30DaysRequests = usageData.slice(-30).reduce((sum, item) => sum + item.requests, 0)
  const averagePerDay = Math.round(totalRequests / Math.max(usageData.length, 1))

  const copyApiKey = () => {
    if (apiKey?.key) {
      navigator.clipboard.writeText(apiKey.key)
      // You could add a toast notification here
    }
  }

  const handleCreateApiKey = async () => {
    setShowCreateModal(true)
  }

  const confirmCreateApiKey = async () => {
    setIsCreating(true)
    try {
      const accessToken = await getAccessToken()
      if (accessToken) {
        await createApiKey(accessToken)
        setShowCreateModal(false)
        // Show confirmation modal only once after successful creation
        if (!hasShownConfirmation) {
          setShowConfirmationModal(true)
          setHasShownConfirmation(true)
        }
      }
    } catch (error) {
      console.error('Error creating API key:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRegenerateApiKey = async () => {
    setIsRegenerating(true)
    try {
      const accessToken = await getAccessToken()
      if (accessToken) {
        await regenerateApiKey(accessToken)
      }
    } catch (error) {
      console.error('Error regenerating API key:', error)
    } finally {
      setIsRegenerating(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* API Key Management */}
      <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
        <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>API Key</h3>
        
        {apiKeyLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className={`ml-3 ${themeColors.textSecondary}`}>Loading API key...</span>
          </div>
        ) : apiKey ? (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                Your API Key
              </label>
              <div className="flex space-x-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={showApiKey ? apiKey.key : '•'.repeat(apiKey.key?.length || 0)}
                  readOnly
                  className={`flex-1 px-3 py-2 ${themeColors.backgroundTertiary} border ${themeColors.border} rounded-lg ${themeColors.text} font-mono text-sm`}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className={`px-3 py-2 ${themeColors.buttonSecondary} rounded-lg transition-colors duration-200`}
                >
                  {showApiKey ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={copyApiKey}
                  className={`px-3 py-2 ${themeColors.buttonSecondary} rounded-lg transition-colors duration-200`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={handleRegenerateApiKey}
                  disabled={isRegenerating}
                  className={`px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50`}
                >
                  {isRegenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`text-xs ${themeColors.textSecondary}`}>
                Keep your API key secure and never share it publicly. This key provides access to your account.
              </div>
            </div>
            
            <div className={`text-xs ${themeColors.textTertiary}`}>
              <div>Name: {apiKey.name}</div>
              <div>Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</div>
              <div>Status: {apiKey.isActive ? 'Active' : 'Inactive'}</div>
              {apiKey.lastUsed && <div>Last used: {new Date(apiKey.lastUsed).toLocaleString()}</div>}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className={`text-lg ${themeColors.text} mb-4`}>No API Key Found</div>
            <p className={`text-sm ${themeColors.textSecondary} mb-6`}>
              Create an API key to access Dobby AI programmatically
            </p>
            <button
              onClick={handleCreateApiKey}
              disabled={isCreating}
              className={`px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50`}
            >
              {isCreating ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create API Key'
              )}
            </button>
          </div>
        )}
      </div>

      {/* API Usage Statistics */}
      <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
        <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>API Usage Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-2xl font-bold text-blue-500`}>{totalRequests}</div>
            <div className={`text-sm ${themeColors.textSecondary}`}>Total Requests</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-green-500`}>{last30DaysRequests}</div>
            <div className={`text-sm ${themeColors.textSecondary}`}>Last 30 Days</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-purple-500`}>{averagePerDay}</div>
            <div className={`text-sm ${themeColors.textSecondary}`}>Avg per Day</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold text-orange-500`}>
              {creditStatus?.remainingCredits ?? dailyRequests.remainingToday}
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>
              {creditStatus ? 'Credits Left Today' : 'Requests Left Today'}
            </div>
          </div>
        </div>
      </div>

      {/* OpenAI-Compatible API Documentation */}
      <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
        <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>OpenAI-Compatible API</h3>
        
        <div className="space-y-6">
          {/* Overview */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-2`}>Overview</h4>
            <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
              The Dobby backend supports OpenAI-compatible API endpoints that work with your existing OpenAI client libraries and tools.
            </p>
          </div>

          {/* Authentication */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-3`}>Authentication</h4>
            <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
              All OpenAI API endpoints require API key authentication:
            </p>
            <div className="space-y-3">
              <div className={`${themeColors.backgroundTertiary} rounded-lg border ${themeColors.border} overflow-hidden`}>
                <div className={`px-3 py-2 border-b ${themeColors.border} flex items-center space-x-2`}>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-xs ${themeColors.textSecondary}`}>Method 1</span>
                </div>
                <code className={`px-3 py-3 text-sm font-mono ${themeColors.text} block`}>
                  X-API-Key: {apiKey?.key ? apiKey.key.substring(0, 20) + '...' : 'dobby_your_api_key_here'}
                </code>
              </div>
              <div className={`${themeColors.backgroundTertiary} rounded-lg border ${themeColors.border} overflow-hidden`}>
                <div className={`px-3 py-2 border-b ${themeColors.border} flex items-center space-x-2`}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className={`text-xs ${themeColors.textSecondary}`}>Method 2</span>
                </div>
                <code className={`px-3 py-3 text-sm font-mono ${themeColors.text} block`}>
                  Authorization: ApiKey {apiKey?.key ? apiKey.key.substring(0, 20) + '...' : 'dobby_your_api_key_here'}
                </code>
              </div>
            </div>
          </div>

          {/* Available Endpoints */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-2`}>Available Endpoints</h4>
            <div className="space-y-3">
              <div className={`${themeColors.backgroundTertiary} p-3 rounded`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-green-500 font-mono text-sm">POST</span>
                  <code className={`text-sm font-mono ${themeColors.text}`}>/v1/chat/completions</code>
                </div>
                <p className={`text-xs ${themeColors.textSecondary}`}>Create a chat completion using your models</p>
              </div>
              <div className={`${themeColors.backgroundTertiary} p-3 rounded`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-blue-500 font-mono text-sm">GET</span>
                  <code className={`text-sm font-mono ${themeColors.text}`}>/v1/models</code>
                </div>
                <p className={`text-xs ${themeColors.textSecondary}`}>List available models</p>
              </div>
            </div>
          </div>

          {/* Available Models */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-2`}>Available Models</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`${themeColors.backgroundTertiary} p-3 rounded`}>
                <h5 className={`font-medium text-sm ${themeColors.text} mb-1`}>Dobby Models</h5>
                <ul className={`text-xs ${themeColors.textSecondary} space-y-1`}>
                  <li>• <code>Dobby-70b</code> - Main Dobby model (70B parameters)</li>
                  <li>• <code>Dobby mini</code> - Lightweight 1.8B parameter model for fast responses</li>
                  <li>• <code>Dobby DDG</code> - Dobby 70B with DDG mcp integration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Example Request */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-3`}>Example Request</h4>
            <div className={`${themeColors.backgroundTertiary} rounded-lg border ${themeColors.border} overflow-hidden`}>
              <div className={`px-4 py-2 border-b ${themeColors.border} flex items-center space-x-2`}>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className={`text-xs ${themeColors.textSecondary} ml-2`}>Terminal</span>
              </div>
              <div className="p-4">
                <CodeHighlighter
                  code={`curl -X POST https://api.dobby.monleru.fun/v1/chat/completions \\
  -H "X-API-Key: ${apiKey?.key ? apiKey.key.substring(0, 20) + '...' : 'dobby_your_api_key_here'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "dobby-70b",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 150
  }'`}
                  language="bash"
                  className={themeColors.text}
                />
              </div>
            </div>
          </div>

          {/* Python Example */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-3`}>Python Example</h4>
            <div className={`${themeColors.backgroundTertiary} rounded-lg border ${themeColors.border} overflow-hidden`}>
              <div className={`px-4 py-2 border-b ${themeColors.border} flex items-center space-x-2`}>
                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <span className={`text-xs ${themeColors.textSecondary}`}>Python</span>
              </div>
              <div className="p-4">
                <CodeHighlighter
                  code={`import openai

# Configure the client
openai.api_base = "https://api.dobby.monleru.fun/v1"
openai.api_key = "${apiKey?.key ? apiKey.key.substring(0, 20) + '...' : 'dobby_your_api_key_here'}"

# Create a chat completion
response = openai.ChatCompletion.create(
    model="dobby-70b",
    messages=[
        {"role": "user", "content": "Explain quantum computing"}
    ],
    temperature=0.7,
    max_tokens=200
)

print(response.choices[0].message.content)`}
                  language="python"
                  className={themeColors.text}
                />
              </div>
            </div>
          </div>

          {/* JavaScript Example */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-3`}>JavaScript Example</h4>
            <div className={`${themeColors.backgroundTertiary} rounded-lg border ${themeColors.border} overflow-hidden`}>
              <div className={`px-4 py-2 border-b ${themeColors.border} flex items-center space-x-2`}>
                <div className="w-4 h-4 bg-yellow-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">JS</span>
                </div>
                <span className={`text-xs ${themeColors.textSecondary}`}>JavaScript</span>
              </div>
              <div className="p-4">
                <CodeHighlighter
                  code={`import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.dobby.monleru.fun/v1',
  apiKey: '${apiKey?.key ? apiKey.key.substring(0, 20) + '...' : 'dobby_your_api_key_here'}',
});

async function chatWithDobby() {
  const completion = await openai.chat.completions.create({
    model: 'dobby-70b',
    messages: [
      { role: 'user', content: 'What is the meaning of life?' }
    ],
    temperature: 0.7,
    max_tokens: 150
  });

  console.log(completion.choices[0].message.content);
}`}
                  language="javascript"
                  className={themeColors.text}
                />
              </div>
            </div>
          </div>

          {/* Response Example */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-3`}>Response Example</h4>
            <div className={`${themeColors.backgroundTertiary} rounded-lg border ${themeColors.border} overflow-hidden`}>
              <div className={`px-4 py-2 border-b ${themeColors.border} flex items-center space-x-2`}>
                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">JSON</span>
                </div>
                <span className={`text-xs ${themeColors.textSecondary}`}>Response</span>
              </div>
              <div className="p-4">
                <CodeHighlighter
                  code={`{
  "id": "chatcmpl-1234567890-abcdef",
  "object": "chat.completion",
  "created": 1677610602,
  "model": "dobby-70b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking. How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 12,
    "completion_tokens": 18,
    "total_tokens": 30
  }
}`}
                  language="json"
                  className={themeColors.text}
                />
              </div>
            </div>
          </div>

          {/* Credit System */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-2`}>Credit System</h4>
            <div className={`${themeColors.backgroundTertiary} p-3 rounded`}>
              <ul className={`text-sm ${themeColors.textSecondary} space-y-1`}>
                <li>• Each API request costs <strong className={themeColors.text}>1 credit</strong></li>
                <li>• Daily allowance: <strong className={themeColors.text}>500 credits</strong></li>
                <li>• Credits reset daily at midnight UTC</li>
                <li>• Check credits: <code>GET /credits/status</code></li>
              </ul>
            </div>
          </div>

          {/* Error Handling */}
          <div>
            <h4 className={`font-medium ${themeColors.text} mb-3`}>Error Handling</h4>
            <div className="space-y-3">
              <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden`}>
                <div className={`px-3 py-2 flex items-center space-x-2`}>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className={`text-xs text-red-600 dark:text-red-400 font-medium`}>Authentication Error</span>
                </div>
                <code className={`px-3 py-3 text-sm font-mono text-red-700 dark:text-red-300 block`}>401 - Invalid API key</code>
              </div>
              <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden`}>
                <div className={`px-3 py-2 flex items-center space-x-2`}>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className={`text-xs text-red-600 dark:text-red-400 font-medium`}>Payment Required</span>
                </div>
                <code className={`px-3 py-3 text-sm font-mono text-red-700 dark:text-red-300 block`}>402 - Insufficient credits</code>
              </div>
              <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden`}>
                <div className={`px-3 py-2 flex items-center space-x-2`}>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className={`text-xs text-red-600 dark:text-red-400 font-medium`}>Bad Request</span>
                </div>
                <code className={`px-3 py-3 text-sm font-mono text-red-700 dark:text-red-300 block`}>400 - Bad Request</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
        <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Rate Limits</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={themeColors.textSecondary}>Daily credit allowance</span>
            <span className={`font-medium ${themeColors.text}`}>500 credits</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={themeColors.textSecondary}>Cost per request</span>
            <span className={`font-medium ${themeColors.text}`}>1 credit</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={themeColors.textSecondary}>Credit reset time</span>
            <span className={`font-medium ${themeColors.text}`}>Daily at midnight UTC</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={themeColors.textSecondary}>Max requests per day</span>
            <span className={`font-medium ${themeColors.text}`}>500</span>
          </div>
        </div>
      </div>

      {/* Create API Key Confirmation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-xl border ${themeColors.border} p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold ${themeColors.text}`}>Create API Key</h3>
            </div>
            
            <p className={`text-sm ${themeColors.textSecondary} mb-4`}>
              You are about to create a new API key. This key will allow you to access Dobby AI programmatically.
            </p>
            
            <div className={`${themeColors.backgroundTertiary} rounded-lg p-4 mb-6`}>
              <h4 className={`text-sm font-medium ${themeColors.text} mb-2`}>Important Security Notes:</h4>
              <ul className={`text-xs ${themeColors.textSecondary} space-y-1`}>
                <li>• Keep your API key secure and never share it publicly</li>
                <li>• Store it in environment variables, not in your code</li>
                <li>• You can regenerate or deactivate it anytime</li>
                <li>• Each request costs 1 credit from your daily allowance</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
                className={`flex-1 px-4 py-2 ${themeColors.buttonSecondary} rounded-lg transition-colors duration-200 disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={confirmCreateApiKey}
                disabled={isCreating}
                className={`flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2`}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Create API Key</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Generated Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-xl border ${themeColors.border} p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold ${themeColors.text}`}>API Key Generated!</h3>
            </div>
            
            <p className={`text-sm ${themeColors.textSecondary} mb-4`}>
              Your API key has been successfully created. You can now use it to access Dobby AI programmatically.
            </p>
            
            <div className={`${themeColors.backgroundTertiary} rounded-lg p-4 mb-6`}>
              <h4 className={`text-sm font-medium ${themeColors.text} mb-2`}>Next Steps:</h4>
              <ul className={`text-xs ${themeColors.textSecondary} space-y-1`}>
                <li>• Copy your API key from the field above</li>
                <li>• Store it securely in your environment variables</li>
                <li>• Use it with the OpenAI-compatible API endpoints</li>
                <li>• Check the documentation below for examples</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className={`flex-1 px-4 py-2 ${themeColors.buttonSecondary} rounded-lg transition-colors duration-200`}
              >
                Got it!
              </button>
              <button
                onClick={() => {
                  setShowConfirmationModal(false)
                  setShowApiKey(true)
                }}
                className={`flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200`}
              >
                Show API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default APISection

