import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { UsageData } from '../stores/chatStore'

interface UsageChartProps {
  data: UsageData[]
  title?: string
  subtitle?: string
}

const UsageChart: React.FC<UsageChartProps> = ({ 
  data, 
  title = "AI Chat Usage", 
  subtitle = "Requests per day" 
}) => {
  const { themeColors } = useTheme()
  const [chartWidth, setChartWidth] = useState(800)

  // Calculate responsive chart width
  useEffect(() => {
    const updateChartWidth = () => {
      const containerWidth = Math.min(800, window.innerWidth - 100)
      setChartWidth(containerWidth)
    }

    updateChartWidth()
    window.addEventListener('resize', updateChartWidth)
    return () => window.removeEventListener('resize', updateChartWidth)
  }, [])

  const chartHeight = 200
  const padding = 40
  const innerWidth = chartWidth - padding * 2
  const innerHeight = chartHeight - padding * 2

  // Find max value for scaling
  const maxRequests = Math.max(...data.map(d => d.requests), 1)
  const minRequests = Math.min(...data.map(d => d.requests), 0)

  // Generate SVG path for the line chart
  const generatePath = () => {
    if (data.length === 0) return ''

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * innerWidth
      const y = padding + innerHeight - ((item.requests - minRequests) / (maxRequests - minRequests)) * innerHeight
      return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
  }

  // Generate area path for gradient fill
  const generateAreaPath = () => {
    if (data.length === 0) return ''

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * innerWidth
      const y = padding + innerHeight - ((item.requests - minRequests) / (maxRequests - minRequests)) * innerHeight
      return `${x},${y}`
    })

    const firstPoint = points[0]
    const lastPoint = points[points.length - 1]
    const bottomY = padding + innerHeight

    return `M ${firstPoint} L ${points.join(' L ')} L ${lastPoint.split(',')[0]},${bottomY} L ${firstPoint.split(',')[0]},${bottomY} Z`
  }

  // Generate Y-axis labels
  const generateYAxisLabels = () => {
    const steps = 5
    const labels = []
    
    for (let i = 0; i <= steps; i++) {
      const value = minRequests + (maxRequests - minRequests) * (i / steps)
      const y = padding + innerHeight - (i / steps) * innerHeight
      labels.push({ value: Math.round(value), y })
    }
    
    return labels
  }

  // Generate X-axis labels (dates)
  const generateXAxisLabels = () => {
    const step = Math.max(1, Math.floor(data.length / 6))
    return data.filter((_, index) => index % step === 0 || index === data.length - 1)
  }

  const yAxisLabels = generateYAxisLabels()
  const xAxisLabels = generateXAxisLabels()

  return (
    <div className={`${themeColors.backgroundSecondary} rounded-xl shadow-lg border ${themeColors.border} p-6 w-full`}>
      <div className="mb-6">
        <h3 className={`text-lg font-semibold ${themeColors.text} mb-2`}>{title}</h3>
        <p className={`text-sm ${themeColors.textSecondary}`}>{subtitle}</p>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className={`text-sm ${themeColors.textSecondary}`}>No usage data available</p>
          </div>
        </div>
      ) : (
        <div className="relative w-full overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible" style={{ minWidth: '100%' }}>
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={themeColors.border} strokeWidth="0.5" opacity="0.3"/>
              </pattern>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            
            {/* Grid background */}
            <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />
            
            {/* Area fill */}
            <path
              d={generateAreaPath()}
              fill="url(#areaGradient)"
            />
            
            {/* Line */}
            <path
              d={generatePath()}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = padding + (index / (data.length - 1)) * innerWidth
              const y = padding + innerHeight - ((item.requests - minRequests) / (maxRequests - minRequests)) * innerHeight
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#8B5CF6"
                  stroke={themeColors.backgroundSecondary}
                  strokeWidth="2"
                  className="hover:r-6 transition-all duration-200"
                />
              )
            })}
            
            {/* Y-axis labels */}
            {yAxisLabels.map((label, index) => (
              <text
                key={index}
                x={padding - 10}
                y={label.y + 4}
                textAnchor="end"
                className={`text-xs ${themeColors.textSecondary} fill-current`}
              >
                {label.value}
              </text>
            ))}
            
            {/* X-axis labels */}
            {xAxisLabels.map((item, index) => {
              const x = padding + (data.indexOf(item) / (data.length - 1)) * innerWidth
              const date = new Date(item.date)
              const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - padding + 20}
                  textAnchor="middle"
                  className={`text-xs ${themeColors.textSecondary} fill-current`}
                >
                  {formattedDate}
                </text>
              )
            })}
          </svg>
          
          {/* Chart stats */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${themeColors.text}`}>
                {data.reduce((sum, item) => sum + item.requests, 0)}
              </div>
              <div className={`text-xs ${themeColors.textSecondary}`}>Total Requests</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${themeColors.text}`}>
                {Math.round(data.reduce((sum, item) => sum + item.requests, 0) / data.length)}
              </div>
              <div className={`text-xs ${themeColors.textSecondary}`}>Avg per Day</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${themeColors.text}`}>
                {maxRequests}
              </div>
              <div className={`text-xs ${themeColors.textSecondary}`}>Peak Day</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsageChart
