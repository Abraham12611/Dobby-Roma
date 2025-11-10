import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { useTheme } from '../contexts/ThemeContext'
import { useChatStore } from '../stores/chatStore'
import Header from './Header'
import UsageChart from './UsageChart'
import TariffSection from './TariffSection'
import APISection from './APISection'

const ProfilePageRoute: React.FC = () => {
  const { user, authenticated, logout, ready, getAccessToken } = usePrivy()
  const { themeColors } = useTheme()
  const { getUsageData, getDailyRequests, loadApiKeyFromServer, loadCreditStatus, getCreditStatus } = useChatStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'pricing' | 'api'>('profile')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleBack = () => {
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      // Here you would typically call an API to delete the account
      // For now, we'll just logout and show a message
      console.log('Account deletion requested')
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Logout after successful deletion
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error deleting account:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // Load API key and credit status when user is authenticated
  useEffect(() => {
    if (authenticated && user) {
      const loadData = async () => {
        const accessToken = await getAccessToken()
        if (accessToken) {
          await Promise.all([
            loadApiKeyFromServer(accessToken),
            loadCreditStatus(accessToken)
          ])
        }
      }
      
      loadData()
    }
  }, [authenticated, user, getAccessToken, loadApiKeyFromServer, loadCreditStatus])

  // Show loading while Privy is initializing
  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Not Authenticated</h1>
          <p className="text-gray-400">Please log in to view your profile.</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const getLoginMethodInfo = () => {
    if (user.twitter) {
      return {
        type: 'Twitter',
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        ),
        details: {
          username: `@${user.twitter.username}`,
          name: user.twitter.name || 'Twitter User'
        }
      }
    }

    if (user.google) {
      return {
        type: 'Google',
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        ),
        details: {
          email: user.google.email,
          name: user.google.name || 'Google User'
        }
      }
    }

    if (user.wallet) {
      return {
        type: 'Wallet',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
        details: {
          address: user.wallet.address,
          walletType: user.wallet.walletClientType || 'Unknown'
        }
      }
    }

    return {
      type: 'Unknown',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      details: {}
    }
  }

  const loginInfo = getLoginMethodInfo()

  return (
    <div className={`h-screen ${themeColors.background} flex flex-col relative overflow-hidden transition-colors duration-200`}>
      {/* Animated background gradients - only in dark mode */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 animate-pulse dark:block hidden"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-800/50 via-transparent to-transparent dark:block hidden"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-bounce-slow dark:block hidden"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow dark:block hidden"></div>
      
      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* Header */}
        <Header 
          title="Profile"
          subtitle="Manage your account settings"
          showBackButton={true}
          onBack={handleBack}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6 mb-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    {loginInfo.icon}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${themeColors.text}`}>
                      {loginInfo.type === 'Twitter' && loginInfo.details.name}
                      {loginInfo.type === 'Google' && loginInfo.details.name}
                      {loginInfo.type === 'Wallet' && 'Wallet User'}
                      {loginInfo.type === 'Unknown' && 'User'}
                    </h2>
                    <p className={`text-sm ${themeColors.textSecondary}`}>
                      Connected via {loginInfo.type}
                    </p>
                  </div>
                </div>
                
                {/* Credits Display */}
                <div className="text-right">
                  <div className={`text-2xl font-bold text-green-500`}>
                    {getCreditStatus()?.remainingCredits || getDailyRequests().remainingToday}
                  </div>
                  <div className={`text-sm ${themeColors.textSecondary}`}>
                    {getCreditStatus() ? 'Credits Left' : 'Daily Requests Left'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} mb-6`}>
              <div className="relative flex justify-center border-b border-gray-600">
                {/* Animated Tab Indicator */}
                <div 
                  className="absolute bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ease-in-out"
                  style={{
                    width: '120px',
                    left: activeTab === 'profile' ? 'calc(50% - 180px)' : activeTab === 'pricing' ? 'calc(50% - 60px)' : 'calc(50% + 60px)'
                  }}
                />
                
                {[
                  { id: 'profile', label: 'Profile', icon: '👤' },
                  { id: 'pricing', label: 'Pricing', icon: '💳' },
                  { id: 'api', label: 'API', icon: '🔧' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 text-center font-medium transition-all duration-300 ease-in-out relative min-w-[120px] ${
                      activeTab === tab.id
                        ? `${themeColors.text}`
                        : `${themeColors.textSecondary} hover:${themeColors.text} hover:scale-105`
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-96 relative">
              <div 
                className={`transition-all duration-500 ease-in-out ${
                  activeTab === 'profile' 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                }`}
              >
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                  {/* Account Information */}
                  <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
                    <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Account Information</h3>
                    
                    <div className="space-y-4">
                      {/* Twitter Details */}
                      {loginInfo.type === 'Twitter' && (
                        <>
                          <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                            <div className="flex items-center space-x-3 mb-2">
                              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                              <span className={`font-medium ${themeColors.text}`}>Twitter Username</span>
                            </div>
                            <p className={`text-sm ${themeColors.textSecondary}`}>{loginInfo.details.username}</p>
                          </div>
                          
                          <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                            <div className="flex items-center space-x-3 mb-2">
                              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className={`font-medium ${themeColors.text}`}>Display Name</span>
                            </div>
                            <p className={`text-sm ${themeColors.textSecondary}`}>{loginInfo.details.name}</p>
                          </div>
                        </>
                      )}

                      {/* Google Details */}
                      {loginInfo.type === 'Google' && (
                        <>
                          <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                            <div className="flex items-center space-x-3 mb-2">
                              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                              <span className={`font-medium ${themeColors.text}`}>Email Address</span>
                            </div>
                            <p className={`text-sm ${themeColors.textSecondary}`}>{loginInfo.details.email}</p>
                          </div>
                          
                          <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                            <div className="flex items-center space-x-3 mb-2">
                              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className={`font-medium ${themeColors.text}`}>Display Name</span>
                            </div>
                            <p className={`text-sm ${themeColors.textSecondary}`}>{loginInfo.details.name}</p>
                          </div>
                        </>
                      )}

                      {/* Wallet Details */}
                      {loginInfo.type === 'Wallet' && (
                        <>
                          <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                            <div className="flex items-center space-x-3 mb-2">
                              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              <span className={`font-medium ${themeColors.text}`}>Wallet Address</span>
                            </div>
                            <p className={`text-sm ${themeColors.textSecondary} font-mono`}>{loginInfo.details.address}</p>
                          </div>
                          
                          <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                            <div className="flex items-center space-x-3 mb-2">
                              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className={`font-medium ${themeColors.text}`}>Wallet Type</span>
                            </div>
                            <p className={`text-sm ${themeColors.textSecondary}`}>{loginInfo.details.walletType}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Usage Statistics */}
                  <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
                    <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Usage Statistics</h3>
                    <UsageChart 
                      data={getUsageData()}
                      title="AI Chat Usage"
                      subtitle="Daily requests to AI chat"
                    />
                  </div>

                  {/* Actions */}
                  <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
                    <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      <a
                        href="https://docs.dobby.monleru.fun/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Documentation</span>
                      </a>
                      <button
                        onClick={logout}
                        className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className={`px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
                )}
              </div>

              <div 
                className={`transition-all duration-500 ease-in-out ${
                  activeTab === 'pricing' 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                }`}
              >
                {activeTab === 'pricing' && <TariffSection />}
              </div>

              <div 
                className={`transition-all duration-500 ease-in-out ${
                  activeTab === 'api' 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                }`}
              >
                {activeTab === 'api' && <APISection />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-xl border ${themeColors.border} p-6 max-w-md w-full mx-4`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className={`text-lg font-semibold ${themeColors.text}`}>Delete Account</h3>
            </div>
            
            <p className={`text-sm ${themeColors.textSecondary} mb-6`}>
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, including:
            </p>
            
            <ul className={`text-sm ${themeColors.textSecondary} mb-6 space-y-1`}>
              <li>• All chat history</li>
              <li>• API keys and usage data</li>
              <li>• Credit history</li>
              <li>• Account settings</li>
            </ul>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className={`flex-1 px-4 py-2 ${themeColors.buttonSecondary} rounded-lg transition-colors duration-200 disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2`}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePageRoute
