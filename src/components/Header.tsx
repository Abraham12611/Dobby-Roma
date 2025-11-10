import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'
import ProfileButton from './ProfileButton'
import LoginButton from './LoginButton'

interface HeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
  showProfileButton?: boolean
  showLoginButton?: boolean
  showThemeToggle?: boolean
  customRightContent?: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({
  title = 'Dobby AI',
  subtitle = 'Dobby AI powered by Sentient',
  showBackButton = false,
  onBack,
  showProfileButton = true,
  showLoginButton = true,
  showThemeToggle = true,
  customRightContent
}) => {
  const { themeColors } = useTheme()
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/')
    }
  }

  return (
    <header className={`${themeColors.backgroundSecondary} shadow-2xl border-b ${themeColors.border} flex-shrink-0 backdrop-blur-lg`}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation Menu (moved from center) */}
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/roma')}
              className={`px-6 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-110 hover:rotate-1 ${
                window.location.pathname === '/roma' 
                  ? `${themeColors.buttonPrimary} ${themeColors.textInverse} shadow-lg` 
                  : `${themeColors.textSecondary} hover:${themeColors.text} ${themeColors.buttonSecondary}`
              }`}
            >
              ROMA
            </button>
            <button
              onClick={() => navigate('/models')}
              className={`px-6 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-110 hover:-rotate-1 ${
                window.location.pathname === '/models' 
                  ? `${themeColors.buttonPrimary} ${themeColors.textInverse} shadow-lg` 
                  : `${themeColors.textSecondary} hover:${themeColors.text} ${themeColors.buttonSecondary}`
              }`}
            >
              Models
            </button>
            <button
              onClick={() => navigate('/')}
              className={`px-6 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-110 hover:rotate-1 ${
                window.location.pathname === '/' 
                  ? `${themeColors.buttonPrimary} ${themeColors.textInverse} shadow-lg` 
                  : `${themeColors.textSecondary} hover:${themeColors.text} ${themeColors.buttonSecondary}`
              }`}
            >
              Chat
            </button>
          </nav>

          {/* Center - Back Button (moved from left) */}
          <div className="flex items-center justify-center">
            {showBackButton && (
              <button
                onClick={handleBack}
                className={`p-4 rounded-2xl ${themeColors.buttonSecondary} hover:scale-110 transition-all duration-300 hover:rotate-180 shadow-lg`}
                aria-label="Go back"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Right side - Logo and Title (moved from left, resized) */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <h1 className={`text-3xl font-black ${themeColors.text} tracking-tight`}>{title}</h1>
              <p className={`text-lg ${themeColors.textSecondary} font-medium`}>{subtitle}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden ring-4 ring-primary-500/30 shadow-xl hover:scale-110 transition-all duration-300">
              <img src="/logo.png" alt="Dobby AI Logo" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        {/* Bottom row - Action buttons (moved from top right) */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t ${themeColors.border}">
          <div className="flex items-center space-x-4">
            {customRightContent ? (
              customRightContent
            ) : (
              <>
                {showLoginButton && <LoginButton />}
                {showProfileButton && <ProfileButton />}
                {showThemeToggle && <ThemeToggle />}
              </>
            )}
          </div>
          <div className="text-sm text-primary-600 font-medium">
            {/* Optional status or info text */}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
