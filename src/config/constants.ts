export const API_URL = (import.meta as any).env?.VITE_API_URL
export const X_URL = 'https://x.com/monleru';
export const TELEGRAM_URL = 'https://t.me/askDobbybot';
export const PRIVY_APP_ID = (import.meta as any).env?.VITE_PRIVY_APP_ID || 'cmf5b6yvy004wk00cmj07a826';

export const AI_MODELS = {
  'dobby-70b': {
    endpoint: 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new',
    name: 'Dobby 70B',
    description: 'Full 70B parameter model for high-quality responses and complex reasoning'
  },
  'dobby-mini': {
    endpoint: 'accounts/sentientfoundation-serverless/models/dobby-mini-unhinged-plus-llama-3-1-8b',
    name: 'Dobby Mini',
    description: 'Lightweight 1.8B parameter model for fast responses'
  },  'dobby-ddg': {
    endpoint: 'mcp/dobby-unhinged-llama-3-3-70b-new',
    name: 'Dobby DDG',
    description: 'Full 70B parameter model for high-quality responses and DDG mcp integration'
  }
} as const;

export type AIModelKey = keyof typeof AI_MODELS;

// localStorage keys
export const LOCALSTORAGE_KEYS = {
  SELECTED_MODEL: 'dobby-selected-model',
  THEME: 'dobby-theme'
} as const;

// Theme types
export type Theme = 'light' | 'dark';

// Theme configuration
export const THEMES = {
  light: {
    name: 'Light',
    colors: {
      background: 'bg-gradient-to-br from-primary-50 to-secondary-50',
      backgroundSecondary: 'bg-white/80 backdrop-blur-sm',
      backgroundTertiary: 'bg-primary-100/50',
      text: 'text-secondary-900',
      textSecondary: 'text-secondary-700',
      textTertiary: 'text-secondary-500',
      border: 'border-secondary-200',
      borderSecondary: 'border-primary-300',
      hover: 'hover:bg-primary-100',
      hoverSecondary: 'hover:bg-secondary-100',
      input: 'bg-white/90 border-primary-300 text-secondary-900 placeholder-secondary-500',
      button: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25',
      buttonSecondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 border-secondary-300',
      buttonPrimary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white',
      textInverse: 'text-white',
      chatBubbleUser: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg',
      chatBubbleAI: 'bg-primary-100/80 text-secondary-900 border-primary-200 shadow-md',
      dropdown: 'bg-white/95 border-secondary-200 shadow-xl backdrop-blur-sm',
      dropdownItem: 'hover:bg-primary-100 text-secondary-900',
      dropdownItemSelected: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white',
      scrollbarTrack: 'bg-primary-100',
      scrollbarThumb: 'bg-secondary-400',
      scrollbarThumbHover: 'bg-secondary-500'
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      background: 'bg-gradient-to-br from-secondary-900 via-primary-900 to-secondary-950',
      backgroundSecondary: 'bg-secondary-800/60 backdrop-blur-sm border-primary-500/20',
      backgroundTertiary: 'bg-primary-800/40',
      text: 'text-primary-200',
      textSecondary: 'text-primary-300',
      textTertiary: 'text-primary-400',
      border: 'border-primary-700/50',
      borderSecondary: 'border-secondary-600/50',
      hover: 'hover:bg-primary-800/50',
      hoverSecondary: 'hover:bg-secondary-700/50',
      input: 'bg-secondary-800/80 border-primary-600 text-primary-100 placeholder-primary-400',
      button: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-secondary-900 hover:from-primary-400 hover:to-secondary-400 shadow-lg shadow-primary-500/40',
      buttonSecondary: 'bg-secondary-700/80 text-primary-200 hover:bg-secondary-600/80 border-primary-600/50',
      buttonPrimary: 'bg-gradient-to-r from-secondary-400 to-primary-400 text-secondary-900',
      textInverse: 'text-secondary-900',
      chatBubbleUser: 'bg-gradient-to-r from-secondary-400 to-primary-400 text-secondary-900 shadow-lg shadow-secondary-400/30',
      chatBubbleAI: 'bg-primary-800/60 text-primary-100 border-primary-600/50 shadow-md shadow-primary-600/20',
      dropdown: 'bg-secondary-800/90 border-primary-600/50 shadow-xl backdrop-blur-sm',
      dropdownItem: 'hover:bg-primary-700/50 text-primary-100',
      dropdownItemSelected: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-secondary-900',
      scrollbarTrack: 'bg-primary-800/50',
      scrollbarThumb: 'bg-secondary-600',
      scrollbarThumbHover: 'bg-secondary-500'
    }
  }
} as const; 