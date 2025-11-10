import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-12 w-20 items-center rounded-full transition-all duration-300 ease-in-out border-2 shadow-xl hover:scale-110
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-secondary-600 to-primary-600 border-secondary-500 shadow-secondary-900/50' 
          : 'bg-gradient-to-r from-primary-300 to-secondary-300 border-primary-400 shadow-primary-400/30'
        }
        focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-4 focus:ring-offset-transparent
        hover:${theme === 'dark' ? 'from-secondary-500 to-primary-500' : 'from-primary-200 to-secondary-200'}
      `}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span
        className={`
          inline-block h-8 w-8 transform rounded-full bg-white shadow-2xl transition-transform duration-300 ease-in-out ring-2 ring-primary-500/30
          ${theme === 'dark' ? 'translate-x-10' : 'translate-x-1'}
        `}
      >
        <div className="flex h-full w-full items-center justify-center">
          {theme === 'dark' ? (
            // Moon icon for dark mode - transformed
            <svg
              className="h-6 w-6 text-secondary-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            // Sun icon for light mode - transformed
            <svg
              className="h-6 w-6 text-primary-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </span>
    </button>
  )
}

export default ThemeToggle
