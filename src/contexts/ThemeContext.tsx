import React, { createContext, useContext, useEffect, useState } from 'react'
import { Theme, THEMES, LOCALSTORAGE_KEYS } from '../config/constants'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  themeColors: typeof THEMES.light.colors | typeof THEMES.dark.colors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Helper functions for localStorage
const saveThemeToStorage = (theme: Theme) => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEYS.THEME, theme)
    console.log('💾 Saved theme to localStorage:', theme)
  } catch (error) {
    console.error('❌ Error saving theme to localStorage:', error)
  }
}

const loadThemeFromStorage = (): Theme | null => {
  try {
    const savedTheme = localStorage.getItem(LOCALSTORAGE_KEYS.THEME) as Theme
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      console.log('📂 Loaded theme from localStorage:', savedTheme)
      return savedTheme
    }
  } catch (error) {
    console.error('❌ Error loading theme from localStorage:', error)
  }
  return null
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check for saved theme, default to dark
    return loadThemeFromStorage() || 'dark'
  })

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    saveThemeToStorage(newTheme)
    
    // Update document class for CSS variables
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const themeColors = THEMES[theme].colors

  // Apply theme to document on mount and theme change
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
