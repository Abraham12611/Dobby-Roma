import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { usePrivy } from '@privy-io/react-auth'

interface ProfileButtonProps {
  className?: string
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ className = '' }) => {
  const { themeColors } = useTheme()
  const { user } = usePrivy()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Determine login method and display info
  const getLoginInfo = () => {
    if (!user) return { type: 'default', icon: null, displayText: 'Profile' }

    // Check for Twitter login
    if (user.twitter) {
      return {
        type: 'twitter',
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        ),
        displayText: `@${user.twitter.username}`
      }
    }

    // Check for Google login
    if (user.google) {
      return {
        type: 'google',
        icon: (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        ),
        displayText: user.google.email || 'Google Account'
      }
    }

    // Check for wallet login
    if (user.wallet) {
      return {
        type: 'wallet',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
        displayText: `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
      }
    }

    // Default fallback
    return { type: 'default', icon: null, displayText: 'Profile' }
  }

  const loginInfo = getLoginInfo()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMenuClick = (action: string) => {
    setIsOpen(false)
    
    switch (action) {
      case 'docs':
        window.open('https://docs.dobby.monleru.fun', '_blank')
        break
      case 'api':
        window.open('https://docs.dobby.monleru.fun/api-reference/introduction', '_blank')
        break
      case 'profile':
        // Navigate to profile page
        navigate('/profile')
        break
      default:
        break
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300
          ${themeColors.buttonSecondary} hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary-500 shadow-lg hover:shadow-xl
        `}
        aria-label="Profile menu"
      >
        {/* Login Method Icon */}
        {loginInfo.icon ? (
          <div className="w-8 h-8 flex items-center justify-center">
            {loginInfo.icon}
          </div>
        ) : (
          <svg 
            className="w-8 h-8" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
        )}
        
        {/* Display Text */}
        <span className="text-lg font-bold hidden sm:block">
          {loginInfo.displayText}
        </span>
        
        {/* Dropdown Arrow */}
        <svg 
          className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${themeColors.textSecondary}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl border-2 z-50 backdrop-blur-xl
          ${themeColors.backgroundSecondary} ${themeColors.border}
        `}>
          <div className="py-2">
            {/* Docs */}
            <button
              onClick={() => handleMenuClick('docs')}
              className={`
                w-full text-left px-6 py-4 text-lg transition-all duration-300 hover:scale-105
                ${themeColors.text} hover:${themeColors.backgroundTertiary}
                flex items-center space-x-4 font-semibold
              `}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Documentation</span>
            </button>

            {/* API */}
            <button
              onClick={() => handleMenuClick('api')}
              className={`
                w-full text-left px-6 py-4 text-lg transition-all duration-300 hover:scale-105
                ${themeColors.text} hover:${themeColors.backgroundTertiary}
                flex items-center space-x-4 font-semibold
              `}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>API Reference</span>
            </button>

            {/* Divider */}
            <div className={`border-t-2 ${themeColors.border} my-2`}></div>

            {/* Profile */}
            <button
              onClick={() => handleMenuClick('profile')}
              className={`
                w-full text-left px-6 py-4 text-lg transition-all duration-300 hover:scale-105
                ${themeColors.text} hover:${themeColors.backgroundTertiary}
                flex items-center space-x-4 font-semibold
              `}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileButton
