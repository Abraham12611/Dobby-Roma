import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import Header from './Header'
import { romaApi, Project, TaskGraph, CreateConfiguredProjectRequest } from '../services/romaApi'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Types are now imported from romaApi service

interface ROMAProps {
  projectId?: string
}

const ROMA: React.FC<ROMAProps> = ({ projectId }) => {
  const { themeColors } = useTheme()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [taskGraph, setTaskGraph] = useState<TaskGraph | null>(null)
  const [projectDetails, setProjectDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newGoal, setNewGoal] = useState('')
  const [maxSteps, setMaxSteps] = useState(15)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  const [markdownTitle, setMarkdownTitle] = useState('')
  const [showRawMarkdown, setShowRawMarkdown] = useState(false)
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const [showRootTasks, setShowRootTasks] = useState(true)
  const [showFinalResults, setShowFinalResults] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState('DataAnalysisAgent')

  // Load projects and task graph from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load projects
        const projectsResponse = await romaApi.getProjects()
        setProjects(projectsResponse.projects)
        
        // If projectId is provided, load that specific project
        if (projectId) {
          try {
            const projectData = await romaApi.getProject(projectId)
            setCurrentProject(projectData.project)
            setProjectDetails(projectData)
            setShowProjectDetails(true)
            
            // Load task graph for the specific project
            try {
              const taskGraphData = await romaApi.getTaskGraph()
              setTaskGraph(taskGraphData)
            } catch (error) {
              console.warn('Could not load task graph for specific project:', error)
            }
          } catch (error) {
            console.error('Error loading specific project:', error)
            // If project not found, show error message
            setCurrentProject(null)
            setShowProjectDetails(false)
          }
        } else {
          // Set current project if available (original behavior)
          if (projectsResponse.current_project_id) {
            const currentProjectData = projectsResponse.projects.find(
              p => p.id === projectsResponse.current_project_id
            )
            if (currentProjectData) {
              setCurrentProject(currentProjectData)
              
              // Load task graph for current project
              try {
                const taskGraphData = await romaApi.getTaskGraph()
                setTaskGraph(taskGraphData)
              } catch (error) {
                console.warn('Could not load task graph:', error)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading ROMA data:', error)
        // Fallback to mock data if API is not available
        const mockProjects: Project[] = [
          {
            id: 'project_1',
            title: 'Quantum Computing Research',
            goal: 'Research quantum computing applications in cryptography',
            description: 'Research quantum computing applications in cryptography',
            status: 'completed',
            completion_status: 'completed',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            max_steps: 250,
            node_count: 5,
            completion_percentage: 100,
            has_saved_results: true
          },
          {
            id: 'project_2',
            title: 'AI Ethics Analysis',
            goal: 'Analyze ethical implications of AI in healthcare',
            description: 'Analyze ethical implications of AI in healthcare',
            status: 'running',
            completion_status: 'running',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            max_steps: 200,
            node_count: 3,
            completion_percentage: 60,
            has_saved_results: false
          }
        ]
        setProjects(mockProjects)
        setCurrentProject(mockProjects[1])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectId])

  const handleCreateProject = async () => {
    if (!newGoal.trim()) return

    setIsCreatingProject(true)
    try {
      const agentFilename = getFilenameFromDisplayName(selectedAgent)
      
      const response = await romaApi.createProject({
        goal: newGoal,
        max_steps: maxSteps,
        agent: agentFilename
      })

      setProjects(prev => [response.project, ...prev])
      setCurrentProject(response.project)
      setNewGoal('')
      
      // Load task graph for the new project
      try {
        const taskGraphData = await romaApi.getTaskGraph()
        setTaskGraph(taskGraphData)
        console.log('Task graph loaded for new project:', taskGraphData)
      } catch (error) {
        console.warn('Could not load task graph for new project:', error)
      }

      // Start project execution
      try {
        const executionResponse = await romaApi.simpleExecute({
          goal: newGoal,
          max_steps: maxSteps,
          agent: agentFilename
        })
        console.log('Project execution started:', executionResponse)
        
        // Refresh the project list to get updated status
        setTimeout(async () => {
          try {
            const projectsResponse = await romaApi.getProjects()
            setProjects(projectsResponse.projects)
            
            // Update current project if it's still selected
            const updatedProject = projectsResponse.projects.find(p => p.id === response.project.id)
            if (updatedProject) {
              setCurrentProject(updatedProject)
            }
          } catch (error) {
            console.warn('Could not refresh projects:', error)
          }
        }, 2000)
      } catch (error) {
        console.warn('Could not start project execution:', error)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      // Show error message to user
      alert('Failed to create project. Please try again.')
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleCreateConfiguredProject = async () => {
    if (!newGoal.trim()) return

    setIsCreatingProject(true)
    try {
      const projectConfig: CreateConfiguredProjectRequest = {
        goal: newGoal,
        max_steps: 3,
        config: {
          llm: {
            provider: "openai",
            model: "gpt-4",
            temperature: 0.7,
            timeout: 30,
            max_retries: 3
          },
          execution: {
            max_concurrent_nodes: 2,
            max_execution_steps: 3,
            max_recursion_depth: 2,
            task_timeout_seconds: 600,
            enable_hitl: true,
            hitl_root_plan_only: true,
            hitl_timeout_seconds: 300,
            hitl_after_plan_generation: true,
            hitl_after_modified_plan: true,
            hitl_after_atomizer: false,
            hitl_before_execute: false
          },
          cache: {
            enabled: true,
            ttl_seconds: 3600,
            max_size: 1000,
            cache_type: "memory"
          },
          project: {
            goal: newGoal,
            max_steps: 3
          }
        }
      }

      const response = await romaApi.createConfiguredProject(projectConfig)

      setProjects(prev => [response.project, ...prev])
      setCurrentProject(response.project)
      setNewGoal('')
      
      // Load task graph for the new project
      try {
        const taskGraphData = await romaApi.getTaskGraph()
        setTaskGraph(taskGraphData)
        console.log('Task graph loaded for new configured project:', taskGraphData)
      } catch (error) {
        console.warn('Could not load task graph for new configured project:', error)
      }

      // Refresh the project list to get updated status
      setTimeout(async () => {
        try {
          const projectsResponse = await romaApi.getProjects()
          setProjects(projectsResponse.projects)
          
          // Update current project if it's still selected
          const updatedProject = projectsResponse.projects.find(p => p.id === response.project.id)
          if (updatedProject) {
            setCurrentProject(updatedProject)
          }
        } catch (error) {
          console.warn('Could not refresh projects:', error)
        }
      }, 2000)

    } catch (error) {
      console.error('Error creating configured project:', error)
      alert('Failed to create configured project. Please try again.')
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleProjectSelect = async (project: Project) => {
    // Navigate to project URL instead of just setting state
    navigate(`/roma/${project.id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'DONE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'running':
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'failed':
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getFilenameFromDisplayName = (displayName: string): string => {
    const nameMap: Record<string, string> = {
      'DataAnalysisAgent': 'general_agent',
      'DeepResearchAgent': 'deep_research_agent'
    };
    return nameMap[displayName] || displayName.toLowerCase().replace(/\s+/g, '_');
  }

  const availableAgents = [
    {
      id: 'DataAnalysisAgent',
      name: 'Data Analysis Agent',
      description: 'General purpose agent for data analysis and processing',
      icon: '📊'
    },
    {
      id: 'DeepResearchAgent', 
      name: 'Deep Research Agent',
      description: 'Specialized agent for deep research and investigation',
      icon: '🔍'
    },
    {
      id: 'CodeGenerationAgent',
      name: 'Code Generation Agent', 
      description: 'Agent specialized in code generation and programming tasks',
      icon: '💻'
    },
    {
      id: 'ContentCreationAgent',
      name: 'Content Creation Agent',
      description: 'Agent for creating written content, articles, and documentation',
      icon: '✍️'
    }
  ]

  const renderMarkdown = (content: any) => {
    try {
      const text = String(content || '')
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-sm font-bold mb-1" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xs font-bold mb-1" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xs font-bold mb-1" {...props} />,
              p: ({node, ...props}) => <p className="mb-1 text-xs" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-1 text-xs" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-1 text-xs" {...props} />,
              li: ({node, ...props}) => <li className="mb-0.5 text-xs" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-xs" {...props} />,
              em: ({node, ...props}) => <em className="italic text-xs" {...props} />,
              code: ({node, ...props}: any) => 
                props.inline ? 
                  <code className={`${themeColors.backgroundTertiary} px-1 py-0.5 rounded text-xs ${themeColors.text}`} {...props} /> :
                  <code className={`block ${themeColors.backgroundTertiary} p-1 rounded text-xs mb-1 ${themeColors.text}`} {...props} />,
              pre: ({node, ...props}) => <pre className={`${themeColors.backgroundTertiary} p-1 rounded text-xs mb-1 overflow-x-auto ${themeColors.text}`} {...props} />,
              a: ({node, ...props}) => <a className="text-blue-400 hover:underline text-xs" {...props} />,
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      )
    } catch (error) {
      console.error('Error rendering markdown:', error)
      return <div className="text-xs whitespace-pre-wrap">{String(content || '')}</div>
    }
  }

  const formatTaskExecutionToMarkdown = () => {
    if (!taskGraph && !projectDetails?.state?.all_nodes) {
      return "No task execution data available"
    }

    const nodes = taskGraph?.all_nodes || projectDetails?.state?.all_nodes || {}
    const projectGoal = taskGraph?.overall_project_goal || currentProject?.goal || "Unknown Project"
    
    let markdown = `# Task Execution Report\n\n`
    markdown += `**Project:** ${projectGoal}\n`
    markdown += `**Status:** ${currentProject?.status || 'Unknown'}\n`
    markdown += `**Total Tasks:** ${Object.keys(nodes).length}\n\n`
    
    // Filter to show only root tasks (layer 0 or root tasks)
    const rootTasks = Object.values(nodes).filter((node: any) => {
      return node.layer === 0 || node.layer === undefined || node.id === 'root'
    })

    if (rootTasks.length === 0) {
      return "No root task execution data available"
    }

    markdown += `## Root Tasks\n\n`
    
    rootTasks.forEach((node: any) => {
      const status = node.status || 'UNKNOWN'
      const title = node.title || node.goal || `Task ${node.id || node.task_id}`
      const summary = String(node.output_summary || 'No summary available')
      const updatedAt = node.updated_at || node.timestamp_updated || new Date().toISOString()
      
      markdown += `### ${title}\n\n`
      markdown += `- **Status:** ${status}\n`
      markdown += `- **Updated:** ${new Date(updatedAt).toLocaleString()}\n`
      if (node.model_display) {
        markdown += `- **Model:** ${node.model_display}\n`
      }
      markdown += `- **Summary:** ${summary}\n\n`
    })

    return markdown
  }

  const formatFinalResultsToMarkdown = () => {
    if (!projectDetails?.state?.all_nodes) {
      return "No final results available"
    }

    const completedTasks = Object.values(projectDetails.state.all_nodes)
      .filter((node: any) => node.status === 'DONE' && node.full_result)
      .sort((a: any, b: any) => (a.layer || 0) - (b.layer || 0))

    if (completedTasks.length === 0) {
      return "No completed tasks with results available"
    }

    let markdown = `# Final Results Report\n\n`
    markdown += `**Project:** ${currentProject?.title || 'Unknown Project'}\n`
    markdown += `**Goal:** ${currentProject?.goal || 'Unknown'}\n`
    markdown += `**Completed Tasks:** ${completedTasks.length}\n\n`

    completedTasks.forEach((node: any, index: number) => {
      const title = node.title || node.goal || `Task ${node.task_id}`
      const output = String(node.full_result || '')
      const model = node.model_display || 'Unknown Model'
      const updatedAt = node.updated_at || node.timestamp_updated || new Date().toISOString()
      
      markdown += `## ${index + 1}. ${title}\n\n`
      markdown += `**Model:** ${model}  \n`
      markdown += `**Completed:** ${new Date(updatedAt).toLocaleString()}\n\n`
      markdown += `### Result\n\n`
      markdown += `${output}\n\n`
      markdown += `---\n\n`
    })

    return markdown
  }

  const formatFullProjectToMarkdown = () => {
    if (!currentProject) {
      return "No project selected"
    }

    let markdown = `# Project Report: ${currentProject.title}\n\n`
    markdown += `**Goal:** ${currentProject.goal}\n`
    markdown += `**Status:** ${currentProject.status}\n`
    markdown += `**Progress:** ${currentProject.status === 'completed' ? '100%' : Math.round(currentProject.completion_percentage)}%\n`
    markdown += `**Created:** ${new Date(currentProject.created_at).toLocaleString()}\n`
    markdown += `**Updated:** ${new Date(currentProject.updated_at).toLocaleString()}\n\n`

    // Add task execution section
    const taskExecutionMarkdown = formatTaskExecutionToMarkdown()
    if (taskExecutionMarkdown !== "No task execution data available") {
      markdown += `---\n\n`
      markdown += taskExecutionMarkdown
    }

    // Add final results section
    const finalResultsMarkdown = formatFinalResultsToMarkdown()
    if (finalResultsMarkdown !== "No final results available") {
      markdown += `\n---\n\n`
      markdown += finalResultsMarkdown
    }

    return markdown
  }

  const downloadMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      alert('Markdown copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Markdown copied to clipboard!')
    }
  }

  const previewMarkdown = (type: 'task' | 'results') => {
    const content = type === 'task' ? formatTaskExecutionToMarkdown() : formatFinalResultsToMarkdown()
    const title = type === 'task' ? 'Root Tasks Report' : 'Final Results Report'
    setMarkdownContent(content)
    setMarkdownTitle(title)
    setShowMarkdownPreview(true)
  }

  const handleBack = () => {
    navigate('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionsDropdown) {
        const target = event.target as HTMLElement
        if (!target.closest('.dropdown-container')) {
          setShowActionsDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActionsDropdown])

  // Auto-refresh task graph for running projects
  useEffect(() => {
    if (!currentProject || currentProject.status === 'completed' || currentProject.status === 'failed') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const taskGraphData = await romaApi.getTaskGraph()
        setTaskGraph(taskGraphData)
        
        // Also refresh project status
        const projectsResponse = await romaApi.getProjects()
        setProjects(projectsResponse.projects)
        
        const updatedProject = projectsResponse.projects.find(p => p.id === currentProject.id)
        if (updatedProject) {
          setCurrentProject(updatedProject)
        }
      } catch (error) {
        console.warn('Could not refresh task graph:', error)
      }
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [currentProject])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={themeColors.textSecondary}>Loading ROMA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
      
      <Header 
        title="ROMA AI Agents" 
        subtitle="Advanced AI Agents     and task management"
        showBackButton={true}
        onBack={handleBack}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Create New Project - only show when not viewing project details */}
        {!showProjectDetails && (
          <div className={`p-6 rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border mb-8`}>
            <h2 className={`text-xl font-bold ${themeColors.text} mb-4`}>
              Create New Project
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Project Goal
                </label>
                <textarea
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Describe what you want to achieve..."
                  className={`w-full p-3 rounded-lg border ${themeColors.border} ${themeColors.input} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={3}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                  Select Agent
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedAgent === agent.id
                          ? `${themeColors.borderSecondary} ${themeColors.backgroundTertiary}`
                          : `${themeColors.border} ${themeColors.backgroundSecondary}`
                      }`}
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{agent.icon}</span>
                        <div className="flex-1">
                          <h4 className={`font-medium ${themeColors.text} text-sm`}>
                            {agent.name}
                          </h4>
                          <p className={`text-xs ${themeColors.textSecondary} mt-1`}>
                            {agent.description}
                          </p>
                        </div>
                        {selectedAgent === agent.id && (
                          <div className="text-blue-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                    Max Steps: {maxSteps}
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className={`text-xs ${themeColors.textSecondary}`}>10</span>
                    <input
                      type="range"
                      min="10"
                      max="20"
                      value={maxSteps}
                      onChange={(e) => setMaxSteps(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((maxSteps - 10) / 10) * 100}%, #e5e7eb ${((maxSteps - 10) / 10) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <span className={`text-xs ${themeColors.textSecondary}`}>20</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Quick</span>
                    <span>Thorough</span>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCreateProject}
                    disabled={!newGoal.trim() || isCreatingProject}
                    className={`flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      newGoal.trim() && !isCreatingProject
                        ? `${themeColors.buttonSecondary}`
                        : `${themeColors.buttonSecondary}`
                    }`}
                  >
                    {isCreatingProject ? 'Creating...' : 'Create Project'}
                  </button>
                  <button
                    onClick={handleCreateConfiguredProject}
                    disabled={!newGoal.trim() || isCreatingProject}
                    className={`flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      newGoal.trim() && !isCreatingProject
                        ? `${themeColors.button}`
                        : `${themeColors.buttonSecondary}`
                    }`}
                  >
                    {isCreatingProject ? 'Creating...' : 'Create Configured Project'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showProjectDetails && currentProject ? (
          /* Detailed Project View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${themeColors.text}`}>
                {currentProject.title}
              </h2>
              <div className="flex items-center space-x-2">
                {/* Actions Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    className={`px-4 py-2 rounded-lg ${themeColors.button} hover:scale-105 transition-all duration-200 flex items-center space-x-2`}
                  >
                    <span>Actions</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${showActionsDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showActionsDropdown && (
                    <div className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg ${themeColors.backgroundSecondary} ${themeColors.border} border z-50`}>
                      <div className="py-2">
                        {/* Root Tasks Section */}
                        <div className="px-4 py-2">
                          <h4 className={`text-xs font-semibold ${themeColors.textSecondary} uppercase tracking-wide mb-2`}>
                            Root Tasks
                          </h4>
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                previewMarkdown('task')
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              👁️ Preview Root Tasks
                            </button>
                            <button
                              onClick={() => {
                                const markdown = formatTaskExecutionToMarkdown()
                                copyToClipboard(markdown)
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              📋 Copy Root Tasks
                            </button>
                            <button
                              onClick={() => {
                                const markdown = formatTaskExecutionToMarkdown()
                                downloadMarkdown(markdown, `root-tasks-${currentProject.id}.md`)
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              💾 Export Root Tasks
                            </button>
                          </div>
                        </div>
                        
                        {/* Divider */}
                        <div className={`border-t ${themeColors.border} my-2`}></div>
                        
                        {/* Final Results Section */}
                        <div className="px-4 py-2">
                          <h4 className={`text-xs font-semibold ${themeColors.textSecondary} uppercase tracking-wide mb-2`}>
                            Final Results
                          </h4>
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                previewMarkdown('results')
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              👁️ Preview Results
                            </button>
                            <button
                              onClick={() => {
                                const markdown = formatFinalResultsToMarkdown()
                                copyToClipboard(markdown)
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              📋 Copy Results
                            </button>
                            <button
                              onClick={() => {
                                const markdown = formatFinalResultsToMarkdown()
                                downloadMarkdown(markdown, `final-results-${currentProject.id}.md`)
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              💾 Export Results
                            </button>
                          </div>
                        </div>
                        
                        {/* Divider */}
                        <div className={`border-t ${themeColors.border} my-2`}></div>
                        
                        {/* Full Report Section */}
                        <div className="px-4 py-2">
                          <h4 className={`text-xs font-semibold ${themeColors.textSecondary} uppercase tracking-wide mb-2`}>
                            Full Report
                          </h4>
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                const content = formatFullProjectToMarkdown()
                                const title = 'Full Project Report'
                                setMarkdownContent(content)
                                setMarkdownTitle(title)
                                setShowMarkdownPreview(true)
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              👁️ Preview Full Report
                            </button>
                            <button
                              onClick={() => {
                                const markdown = formatFullProjectToMarkdown()
                                copyToClipboard(markdown)
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              📋 Copy Full Report
                            </button>
                            <button
                              onClick={() => {
                                const markdown = formatFullProjectToMarkdown()
                                downloadMarkdown(markdown, `project-report-${currentProject.id}.md`)
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              💾 Export Full Report
                            </button>
                          </div>
                        </div>
                        
                        {/* Divider */}
                        <div className={`border-t ${themeColors.border} my-2`}></div>
                        
                        {/* Project Management Section */}
                        <div className="px-4 py-2">
                          <h4 className={`text-xs font-semibold ${themeColors.textSecondary} uppercase tracking-wide mb-2`}>
                            Project Management
                          </h4>
                          <div className="space-y-1">
                            <button
                              onClick={() => {
                                const projectUrl = `${window.location.origin}/roma/${currentProject.id}`
                                navigator.clipboard.writeText(projectUrl)
                                setShowActionsDropdown(false)
                                // Show a brief success message
                                alert('Project link copied to clipboard!')
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              🔗 Copy Project Link
                            </button>
                            <button
                              onClick={() => {
                                navigate('/roma')
                                setShowActionsDropdown(false)
                              }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:${themeColors.backgroundTertiary} ${themeColors.text}`}
                            >
                              ➕ Create New Project
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => navigate('/roma')}
                  className={`px-4 py-2 rounded-lg ${themeColors.buttonSecondary} ${themeColors.text} hover:scale-105 transition-all duration-200`}
                >
                  Back to Projects
                </button>
              </div>
            </div>

            {/* Project Overview */}
            <div className={`p-6 rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                  <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-1`}>Status</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentProject.status)}`}>
                    {currentProject.status}
                  </span>
                </div>
                <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                  <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-1`}>Progress</h3>
                  <p className={`text-lg font-semibold ${themeColors.text} mb-2`}>
                    {currentProject.status === 'completed' ? '100%' : Math.round(currentProject.completion_percentage)}%
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentProject.status === 'completed' 
                          ? 'bg-green-500' 
                          : currentProject.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ 
                        width: currentProject.status === 'completed' 
                          ? '100%' 
                          : `${Math.max(currentProject.completion_percentage, 5)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                  <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-1`}>Nodes</h3>
                  <p className={`text-lg font-semibold ${themeColors.text}`}>
                    {currentProject.node_count}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${themeColors.backgroundTertiary}`}>
                  <h3 className={`text-sm font-medium ${themeColors.textSecondary} mb-1`}>Created</h3>
                  <p className={`text-sm ${themeColors.text}`}>
                    {new Date(currentProject.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className={`text-lg font-semibold ${themeColors.text} mb-2`}>Goal</h3>
                <p className={`${themeColors.textSecondary}`}>{currentProject.goal}</p>
              </div>

              {currentProject.error && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                  <h3 className={`text-lg font-semibold text-red-800 dark:text-red-200 mb-2`}>Error</h3>
                  <p className="text-red-800 dark:text-red-200 text-sm">{currentProject.error}</p>
                </div>
              )}
            </div>

            {/* Task Graph and Results */}
            <div className="grid grid-cols-1 gap-6">
              {/* Root Tasks */}
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => setShowRootTasks(!showRootTasks)}
                >
                  <h3 className={`text-xl font-bold ${themeColors.text}`}>
                    Root Tasks
                    {(() => {
                      const nodes = taskGraph?.all_nodes || projectDetails?.state?.all_nodes || {}
                      const rootTasksCount = Object.values(nodes).filter((node: any) => 
                        node.layer === 0 || node.layer === undefined || node.id === 'root'
                      ).length
                      return rootTasksCount > 0 ? ` (${rootTasksCount})` : ''
                    })()}
                  </h3>
                  <svg 
                    className={`w-5 h-5 transition-transform ${showRootTasks ? 'rotate-180' : ''} ${themeColors.textSecondary}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {showRootTasks && (
                  <>
                    {(taskGraph && Object.keys(taskGraph.all_nodes).length > 0) || 
                     (projectDetails?.state?.all_nodes && Object.keys(projectDetails.state.all_nodes).length > 0) ? (
                      <div className={`p-4 rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border max-h-200 overflow-y-auto`}>
                        <div className="space-y-3">
                          {Object.values(
                            (taskGraph?.all_nodes || projectDetails?.state?.all_nodes) || {}
                          )
                          .filter((node: any) => {
                            // Show only root tasks (layer 0 or tasks without parent)
                            return node.layer === 0 || node.layer === undefined || node.id === 'root'
                          })
                          .map((node: any) => (
                            <div
                              key={node.id || node.task_id}
                              className={`p-3 rounded-lg border ${themeColors.border} ${themeColors.backgroundTertiary}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`font-medium ${themeColors.text} mb-1`}>
                                    {node.title || node.goal || `Task ${node.id}`}
                                  </h4>
                                  <div className={`text-sm ${themeColors.textSecondary} mb-2`}>
                                    {renderMarkdown(node.output_summary || 'Task completed')}
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs">
                                    <span className={themeColors.textSecondary}>
                                      Layer: {node.layer || 0}
                                    </span>
                                    <span className={themeColors.textSecondary}>
                                      {new Date(node.updated_at || node.timestamp_updated || Date.now()).toLocaleTimeString()}
                                    </span>
                                    {node.model_display && (
                                      <span className={themeColors.textSecondary}>
                                        Model: {node.model_display}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                                  {node.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`p-8 text-center rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border`}>
                        <p className={themeColors.textSecondary}>
                          No task execution data available
                        </p>
                        {currentProject?.status === 'completed' && (
                          <p className={`text-sm ${themeColors.textTertiary} mt-2`}>
                            This completed project may not have detailed task data available.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Final Results */}
              <div>
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => setShowFinalResults(!showFinalResults)}
                >
                  <h3 className={`text-xl font-bold ${themeColors.text}`}>
                    Final Results
                  </h3>
                  <svg 
                    className={`w-5 h-5 transition-transform ${showFinalResults ? 'rotate-180' : ''} ${themeColors.textSecondary}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {showFinalResults && (
                  <>
                    {projectDetails?.state?.all_nodes && Object.keys(projectDetails.state.all_nodes).length > 0 ? (
                      <div className={`p-4 rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border max-h-200 overflow-y-auto`}>
                        <div className="space-y-4">
                          {(() => {
                            const allNodes = Object.values(projectDetails.state.all_nodes)
                            console.log('All nodes:', allNodes)
                            console.log('Nodes with DONE status:', allNodes.filter((node: any) => node.status === 'DONE'))
                            console.log('Root nodes:', allNodes.filter((node: any) => node.layer === 0 || node.layer === undefined || node.id === 'root'))
                            
                            const filteredNodes = allNodes
                              .filter((node: any) => {
                                // Show only root tasks that are DONE
                                const isRootNode = node.layer === 0 || node.task_id.startsWith('root.1') || node.layer === undefined || node.id === 'root'
                                const isDone = node.status === 'DONE'
                                const hasOutput = node.full_result?.output_text || node.output_summary
                                console.log(`Node ${node.id}: isRoot=${isRootNode}, isDone=${isDone}, hasOutput=${!!hasOutput}`, node)
                                return isRootNode && isDone && hasOutput
                              })
                            
                            if (filteredNodes.length === 0) {
                              return (
                                <div className={`p-8 text-center rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border`}>
                                  <p className={themeColors.textSecondary}>
                                    No root results available yet
                                  </p>
                                </div>
                              )
                            }
                            
                            // Collect all results into one text using markdown separators
                            const allResults = filteredNodes.map((node: any) => {
                              const content = node.full_result?.output_text || node.output_summary || ''
                              return `# ${node.agent_name}\n\n${content}`
                            }).join('\n\n---\n\n')
                            
                            return (
                              <div className={`p-4 rounded-lg border ${themeColors.border} ${themeColors.backgroundTertiary}`}>
                                <div className={`text-sm ${themeColors.text}`}>
                                  {renderMarkdown(allResults)}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className={`p-8 text-center rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border`}>
                        <p className={themeColors.textSecondary}>
                          No final results available
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Projects List View */
          <div className="space-y-6">
            {/* Projects List - Full Width */}
            <div>
              <h2 className={`text-xl font-bold ${themeColors.text} mb-4`}>
                Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                      currentProject?.id === project.id
                        ? `${themeColors.borderSecondary} ${themeColors.backgroundTertiary}`
                        : `${themeColors.border} ${themeColors.backgroundSecondary}`
                    }`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold ${themeColors.text} text-sm`}>
                        {project.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className={`text-xs ${themeColors.textSecondary} mb-3 line-clamp-2`}>
                      {project.description || project.goal}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className={themeColors.textSecondary}>
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                        <span className={themeColors.textSecondary}>
                          {project.node_count} nodes
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={themeColors.textSecondary}>
                          {project.status === 'completed' ? '100%' : Math.round(project.completion_percentage)}%
                        </span>
                        {project.has_saved_results && (
                          <span className="text-green-600 dark:text-green-400 text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                    {project.error && (
                      <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded text-xs text-red-800 dark:text-red-200">
                        Error: {project.error.slice(0, 50)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Graph - Show when project is selected */}
            {currentProject && (
              <div>
                <h2 className={`text-xl font-bold ${themeColors.text} mb-4`}>
                  Task Graph - {currentProject.title}
                </h2>
                {taskGraph ? (
                  <div className={`p-4 rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border`}>
                    <div className="mb-4">
                      <h3 className={`font-semibold ${themeColors.text} mb-2`}>
                        {taskGraph.overall_project_goal}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(taskGraph.execution_status)}`}>
                        {taskGraph.execution_status}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.values(taskGraph.all_nodes).map((node) => (
                        <div
                          key={node.id}
                          className={`p-3 rounded-lg border ${themeColors.border} ${themeColors.backgroundTertiary}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium ${themeColors.text} mb-1`}>
                                {node.title}
                              </h4>
                              <p className={`text-sm ${themeColors.textSecondary} mb-2`}>
                                {node.output_summary}
                              </p>
                              <div className="flex items-center space-x-4 text-xs">
                                <span className={themeColors.textSecondary}>
                                  Layer: {node.layer}
                                </span>
                                <span className={themeColors.textSecondary}>
                                  Updated: {new Date(node.updated_at).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                              {node.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`p-8 text-center rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border`}>
                    <p className={themeColors.textSecondary}>
                      Loading task graph for {currentProject.title}...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Markdown Preview Modal */}
        {showMarkdownPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`max-w-4xl w-full max-h-[90vh] rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border shadow-xl`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-semibold ${themeColors.text}`}>
                  {markdownTitle}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowRawMarkdown(!showRawMarkdown)}
                    className={`px-3 py-1 rounded ${themeColors.buttonSecondary} text-sm`}
                  >
                    {showRawMarkdown ? 'Show Rendered' : 'Show Raw'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(markdownContent)}
                    className={`px-3 py-1 rounded ${themeColors.buttonSecondary} text-sm`}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      const filename = markdownTitle.toLowerCase().replace(/\s+/g, '-') + `-${currentProject?.id}.md`
                      downloadMarkdown(markdownContent, filename)
                    }}
                    className={`px-3 py-1 rounded ${themeColors.button} text-sm`}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setShowMarkdownPreview(false)}
                    className={`px-3 py-1 rounded ${themeColors.buttonSecondary} text-sm`}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                {showRawMarkdown ? (
                  <pre className={`whitespace-pre-wrap text-sm ${themeColors.text} font-mono`}>
                    {markdownContent}
                  </pre>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    {(() => {
                      try {
                        return (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Custom styling for different markdown elements
                              h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className={`border-l-4 ${themeColors.borderSecondary} pl-4 italic mb-2`} {...props} />,
                              code: ({node, ...props}: any) => 
                                props.inline ? 
                                  <code className={`${themeColors.backgroundTertiary} px-1 py-0.5 rounded text-sm ${themeColors.text}`} {...props} /> :
                                  <code className={`block ${themeColors.backgroundTertiary} p-2 rounded text-sm mb-2 ${themeColors.text}`} {...props} />,
                              pre: ({node, ...props}) => <pre className={`${themeColors.backgroundTertiary} p-2 rounded text-sm mb-2 overflow-x-auto ${themeColors.text}`} {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                              em: ({node, ...props}) => <em className="italic" {...props} />,
                              a: ({node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />,
                              table: ({node, ...props}) => <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 mb-2 text-sm" {...props} />,
                              th: ({node, ...props}) => <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left" {...props} />,
                              td: ({node, ...props}) => <td className="border border-gray-300 dark:border-gray-600 px-3 py-2" {...props} />,
                              hr: ({node, ...props}) => <hr className="border-gray-300 dark:border-gray-600 my-4" {...props} />,
                            }}
                          >
                            {(() => {
                              const content = markdownContent || ''
                              console.log('Rendering modal markdown content:', typeof content, content)
                              // Ensure it's a string and not an object
                              if (typeof content === 'object') {
                                console.error('Content is not a string:', content)
                                return 'No content available'
                              }
                              return String(content)
                            })()}
                          </ReactMarkdown>
                        )
                      } catch (error) {
                        console.error('Error rendering markdown:', error)
                        return <div className="text-sm">{String(markdownContent || '')}</div>
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Project not found message */}
        {projectId && !currentProject && !loading && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className={`p-8 text-center rounded-lg ${themeColors.backgroundSecondary} ${themeColors.border} border`}>
              <h2 className={`text-2xl font-bold ${themeColors.text} mb-4`}>
                Project Not Found
              </h2>
              <p className={`text-lg ${themeColors.textSecondary} mb-6`}>
                The project with ID "{projectId}" could not be found.
              </p>
              <button
                onClick={() => navigate('/roma')}
                className={`px-6 py-3 rounded-lg ${themeColors.button} ${themeColors.textInverse} hover:scale-105 transition-all duration-200`}
              >
                Back to ROMA Projects
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ROMA

