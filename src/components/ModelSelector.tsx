import React, { useState } from 'react'
import { AI_MODELS, AIModelKey } from '../config/constants'
import { useTheme } from '../contexts/ThemeContext'

interface ModelSelectorProps {
  selectedModel: AIModelKey
  onModelChange: (model: AIModelKey) => void
  disabled?: boolean
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { themeColors } = useTheme()

  const selectedModelData = AI_MODELS[selectedModel]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-4 px-6 py-4 ${themeColors.buttonSecondary} rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-xl min-w-[200px]`}
      >
        <div className="flex flex-col items-start">
          <span className={`text-lg font-bold ${themeColors.text}`}>{selectedModelData.name}</span>
          <span className={`text-sm ${themeColors.textTertiary} truncate max-w-48 font-medium`}>
            {selectedModelData.description.split(' ').slice(0, 6).join(' ')}...
          </span>
        </div>
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
        <div className={`absolute top-full right-0 mt-2 w-96 ${themeColors.dropdown} border-2 ${themeColors.border} rounded-2xl shadow-2xl z-50 backdrop-blur-xl`}>
          <div className="p-4 flex flex-col gap-3">
            {Object.entries(AI_MODELS).map(([key, model]) => (
              <button
                key={key}
                onClick={() => {
                  onModelChange(key as AIModelKey)
                  setIsOpen(false)
                }}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 hover:scale-102 ${
                  selectedModel === key
                    ? `${themeColors.dropdownItemSelected} shadow-lg ring-2 ring-primary-500/50`
                    : `${themeColors.dropdownItem} hover:${themeColors.backgroundTertiary}`
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{model.name}</span>
                    {selectedModel === key && (
                      <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-base ${themeColors.textSecondary} mt-2 font-medium leading-relaxed`}>
                    {model.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-primary-900/20 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ModelSelector
