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
    <header className={`${themeColors.backgroundSecondary} border-b ${themeColors.border} flex-shrink-0`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Dobby AI Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${themeColors.text}`}>{title}</h1>
              <p className={`text-xs ${themeColors.textSecondary}`}>{subtitle}</p>
            </div>
          </div>

          {/* Center - Navigation */}
          <nav className="flex items-center space-x-2">
            {showBackButton && (
              <button
                onClick={handleBack}
                className={`p-2 rounded-lg ${themeColors.buttonSecondary} transition-all duration-200`}
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                window.location.pathname === '/'
                  ? `${themeColors.buttonPrimary} ${themeColors.textInverse}`
                  : `${themeColors.buttonSecondary}`
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => navigate('/models')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                window.location.pathname === '/models'
                  ? `${themeColors.buttonPrimary} ${themeColors.textInverse}`
                  : `${themeColors.buttonSecondary}`
              }`}
            >
              Models
            </button>
            <button
              onClick={() => navigate('/roma')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                window.location.pathname === '/roma'
                  ? `${themeColors.buttonPrimary} ${themeColors.textInverse}`
                  : `${themeColors.buttonSecondary}`
              }`}
            >
              ROMA
            </button>
          </nav>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
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
        </div>
      </div>
    </header>
  )
}

export default Header
