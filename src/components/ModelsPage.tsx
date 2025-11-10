import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import Header from './Header'

interface ModelInfo {
  id: string
  name: string
  provider: string
  description: string
  capabilities: string[]
  maxTokens: number
  costPerToken: number
  isActive: boolean
}

const ModelsPage: React.FC = () => {
  const { themeColors } = useTheme()
  const navigate = useNavigate()
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string>('')

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockModels: ModelInfo[] = [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Most capable model for complex reasoning and analysis',
        capabilities: ['text-generation', 'analysis', 'reasoning', 'code-generation'],
        maxTokens: 128000,
        costPerToken: 0.00003,
        isActive: true
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: 'Faster and more cost-effective version of GPT-4o',
        capabilities: ['text-generation', 'analysis', 'reasoning'],
        maxTokens: 128000,
        costPerToken: 0.000015,
        isActive: false
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: 'Advanced reasoning and analysis capabilities',
        capabilities: ['text-generation', 'analysis', 'reasoning', 'code-generation'],
        maxTokens: 200000,
        costPerToken: 0.00003,
        isActive: false
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        description: 'Fast and efficient for simple tasks',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 200000,
        costPerToken: 0.00025,
        isActive: false
      }
    ]

    setModels(mockModels)
    setSelectedModel(mockModels.find(m => m.isActive)?.id || '')
    setLoading(false)
  }, [])

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
  }

  const handleSaveSettings = () => {
    // Here you would save the selected model to your backend
    console.log('Selected model:', selectedModel)
    // Show success message or navigate back
    navigate('/')
  }

  const handleBack = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={themeColors.textSecondary}>Loading models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="AI Models" 
        subtitle="Select and configure your AI models"
        showBackButton={true}
        onBack={handleBack}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${themeColors.text} mb-2`}>
            Available AI Models
          </h2>
          <p className={`${themeColors.textSecondary}`}>
            Choose the AI model that best fits your needs. Each model has different capabilities, costs, and performance characteristics.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                selectedModel === model.id
                  ? `${themeColors.borderPrimary} ${themeColors.backgroundPrimary}`
                  : `${themeColors.border} ${themeColors.backgroundSecondary} hover:${themeColors.borderPrimary}`
              }`}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-lg font-semibold ${themeColors.text}`}>
                      {model.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      model.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {model.isActive ? 'Active' : 'Available'}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${themeColors.textSecondary} mb-3`}>
                    {model.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {model.capabilities.map((capability) => (
                      <span
                        key={capability}
                        className={`px-2 py-1 rounded text-xs ${themeColors.backgroundTertiary} ${themeColors.textSecondary}`}
                      >
                        {capability.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={themeColors.textSecondary}>
                      Max tokens: {model.maxTokens.toLocaleString()}
                    </span>
                    <span className={themeColors.textSecondary}>
                      Cost: ${model.costPerToken.toFixed(6)}/token
                    </span>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedModel === model.id
                      ? `${themeColors.borderPrimary} ${themeColors.backgroundPrimary}`
                      : `${themeColors.border}`
                  }`}>
                    {selectedModel === model.id && (
                      <div className={`w-3 h-3 rounded-full ${themeColors.backgroundPrimary}`}></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleBack}
            className={`px-6 py-2 rounded-lg ${themeColors.buttonSecondary} ${themeColors.text} hover:scale-105 transition-all duration-200`}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            className={`px-6 py-2 rounded-lg ${themeColors.buttonPrimary} ${themeColors.textInverse} hover:scale-105 transition-all duration-200`}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModelsPage
