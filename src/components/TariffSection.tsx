import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useChatStore } from '../stores/chatStore'

const TariffSection: React.FC = () => {
  const { themeColors } = useTheme()
  const { getDailyRequests, getCreditStatus } = useChatStore()
  const dailyRequests = getDailyRequests()
  const creditStatus = getCreditStatus()

  const requestPackages = [
    { name: 'Free', dailyRequests: 500, price: 'Free', popular: true, description: '500 requests per day' },
    { name: 'Pro', dailyRequests: 1000, price: '$10/month', popular: false, description: '1000 requests per day' },
    { name: 'Enterprise', dailyRequests: 5000, price: '$50/month', popular: false, description: '5000 requests per day' },
  ]

  return (
    <div className="space-y-6">
      {/* Current Credits Status */}
      <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
        <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>
          {creditStatus ? 'Credits' : 'Daily Requests'}
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-3xl font-bold text-green-500`}>
              {creditStatus?.remainingCredits ?? dailyRequests.remainingToday}
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>
              {creditStatus ? 'Remaining Credits' : 'Remaining Today'}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold text-blue-500`}>
              {creditStatus?.usedCredits ?? dailyRequests.usedToday}
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>
              {creditStatus ? 'Used Credits' : 'Used Today'}
            </div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold text-purple-500`}>
              {creditStatus?.dailyCredits ?? dailyRequests.dailyLimit}
            </div>
            <div className={`text-sm ${themeColors.textSecondary}`}>
              {creditStatus ? 'Daily Credits' : 'Daily Limit'}
            </div>
          </div>
        </div>

        {/* Credits/Requests Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className={themeColors.textSecondary}>
              {creditStatus ? 'Credit Usage' : 'Daily Usage'}
            </span>
            <span className={themeColors.textSecondary}>
              {creditStatus 
                ? Math.round((creditStatus.usedCredits / creditStatus.dailyCredits) * 100)
                : Math.round((dailyRequests.usedToday / dailyRequests.dailyLimit) * 100)
              }%
            </span>
          </div>
          <div className={`w-full bg-gray-700 rounded-full h-2`}>
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(
                  creditStatus 
                    ? (creditStatus.usedCredits / creditStatus.dailyCredits) * 100
                    : (dailyRequests.usedToday / dailyRequests.dailyLimit) * 100, 
                  100
                )}%` 
              }}
            ></div>
          </div>
        </div>

        <div className={`text-xs ${themeColors.textSecondary}`}>
          {creditStatus 
            ? `Last reset: ${new Date(creditStatus.lastResetDate).toLocaleDateString()}`
            : `Last reset: ${new Date(dailyRequests.lastResetDate).toLocaleDateString()}`
          }
        </div>
      </div>

      {/* Request Packages */}
      <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
        <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Request Packages</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {requestPackages.map((pkg, index) => (
            <div
              key={index}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                pkg.popular 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : `${themeColors.border} ${themeColors.backgroundTertiary}`
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Current Plan</span>
                </div>
              )}
              
              <div className="text-center">
                <h4 className={`text-lg font-semibold ${themeColors.text} mb-2`}>{pkg.name}</h4>
                <div className={`text-2xl font-bold ${pkg.popular ? 'text-purple-500' : themeColors.text} mb-1`}>
                  {pkg.dailyRequests} Requests/Day
                </div>
                <div className={`text-sm ${themeColors.textSecondary} mb-2`}>{pkg.price}</div>
                <div className={`text-xs ${themeColors.textTertiary} mb-4`}>{pkg.description}</div>
                
                <button
                  disabled={true}
                  className="w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-gray-600 text-white opacity-50 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Information */}
      <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6`}>
        <h3 className={`text-lg font-semibold ${themeColors.text} mb-4`}>Usage Information</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className={themeColors.textSecondary}>
              {creditStatus ? '500 free credits per day' : '500 free requests per day'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className={themeColors.textSecondary}>
              {creditStatus ? '1 credit per chat request' : 'Daily limit resets at midnight'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className={themeColors.textSecondary}>
              {creditStatus ? 'Credits reset daily at midnight' : 'Unused requests don\'t carry over'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TariffSection

