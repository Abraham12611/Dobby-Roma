import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const LoadingScreen: React.FC = () => {
  const { themeColors } = useTheme()
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing...')

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 30) // Update every 30ms for smooth progress

    // Update loading text based on progress
    const textInterval = setInterval(() => {
      setLoadingText(() => {
        if (progress < 30) return 'Initializing...'
        if (progress < 60) return 'Loading AI models...'
        if (progress < 90) return 'Preparing interface...'
        return 'Almost ready...'
      })
    }, 100)

    return () => {
      clearInterval(interval)
      clearInterval(textInterval)
    }
  }, [progress])

  return (
    <div 
      className={`fixed top-0 left-0 right-0 bottom-0 w-screen h-screen ${themeColors.background} flex items-center justify-center z-50 transition-colors duration-200 relative overflow-hidden`}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      {/* Animated background gradients - only in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 animate-pulse dark:block hidden"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-800/50 via-transparent to-transparent dark:block hidden"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-bounce-slow dark:block hidden"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow dark:block hidden"></div>
      
      <div className="text-center max-w-md mx-auto px-6 relative z-10">
        {/* Logo with animation */}
        <div className="mb-8">
          <img 
            src="/sentient.png" 
            alt="Sentient Logo" 
            className="w-24 h-24 mx-auto animate-pulse"
          />
        </div>
        
        {/* Loading text */}
        <div className={themeColors.text}>
          <h1 className={`text-2xl font-bold mb-2 ${themeColors.text}`}>Dobby AI</h1>
          <p className={`${themeColors.textSecondary} mb-6`}>{loadingText}</p>
          
          {/* Progress bar */}
          <div className={`w-full ${themeColors.backgroundTertiary} rounded-full h-2 mb-4`}>
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Progress percentage */}
          <p className={`text-sm ${themeColors.textTertiary} mb-6`}>{progress}%</p>
          
          {/* Loading spinner */}
          <div className="flex justify-center">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themeColors.text}`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
