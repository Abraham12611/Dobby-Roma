import React from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useTheme } from '../contexts/ThemeContext'

const LoginButton: React.FC = () => {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { themeColors } = useTheme()

  if (!ready) {
    return (
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-2xl ${themeColors.backgroundTertiary} animate-pulse shadow-lg`}></div>
        <span className={`text-lg font-semibold ${themeColors.textTertiary}`}>Loading...</span>
      </div>
    )
  }

  if (authenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        <button
          onClick={logout}
          className={`${themeColors.buttonSecondary} hover:scale-110 transition-all duration-300 p-3 rounded-2xl font-bold shadow-lg hover:shadow-xl`}
          title="Logout"
          aria-label="Logout"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={login}
      data-testid="login-button"
      className="text-lg bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 hover:scale-110 transition-all duration-300 text-secondary-900 px-6 py-3 rounded-2xl font-black flex items-center space-x-3 shadow-xl hover:shadow-primary-500/50"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      <span>Login</span>
    </button>
  )
}

export default LoginButton
