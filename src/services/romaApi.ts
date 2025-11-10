// ROMA API Service
// Based on the ROMA_API_README.md documentation

const ROMA_BASE_URL = 'http://localhost:5001'

export interface Project {
  id: string
  title: string
  goal: string
  description: string
  status: 'completed' | 'running' | 'failed'
  completion_status: 'completed' | 'running' | 'failed'
  created_at: string
  updated_at: string
  max_steps: number
  node_count: number
  completion_percentage: number
  has_saved_results: boolean
  last_saved?: string
  error?: string
}

export interface TaskNode {
  id: string
  title: string
  status: 'DONE' | 'RUNNING' | 'PENDING' | 'FAILED'
  layer: number
  parent_node_id: string | null
  children: string[]
  output_summary: string
  full_result: any
  created_at: string
  updated_at: string
}

export interface TaskGraph {
  all_nodes: Record<string, TaskNode>
  overall_project_goal: string
  project_id: string
  execution_status: 'completed' | 'running' | 'failed'
}

export interface SystemInfo {
  system_initialized: boolean
  current_profile: string
  available_profiles: string[]
  framework_available: boolean
  timestamp: string
}

export interface HealthStatus {
  status: string
  initialized: boolean
  timestamp: string
}

export interface ReadinessStatus {
  ready: boolean
  components: {
    system_initialized: boolean
    websocket_hitl_ready: boolean
    cache_ready: boolean
    execution_engine_ready: boolean
  }
  websocket_hitl_status: string
  timestamp: string
}

export interface CreateProjectRequest {
  goal: string
  max_steps?: number
  agent?: string
}

export interface CreateProjectResponse {
  project: Project
  message: string
}

export interface ProjectsListResponse {
  projects: Project[]
  current_project_id: string
}

export interface SimpleExecuteRequest {
  goal: string
  max_steps?: number
  agent?: string
  options?: {
    enable_hitl?: boolean
  }
}

export interface ConfiguredProjectConfig {
  llm: {
    provider: string
    model: string
    temperature: number
    timeout: number
    max_retries: number
  }
  execution: {
    max_concurrent_nodes: number
    max_execution_steps: number
    max_recursion_depth: number
    task_timeout_seconds: number
    enable_hitl: boolean
    hitl_root_plan_only: boolean
    hitl_timeout_seconds: number
    hitl_after_plan_generation: boolean
    hitl_after_modified_plan: boolean
    hitl_after_atomizer: boolean
    hitl_before_execute: boolean
  }
  cache: {
    enabled: boolean
    ttl_seconds: number
    max_size: number
    cache_type: string
  }
  project: {
    goal: string
    max_steps: number
  }
}

export interface CreateConfiguredProjectRequest {
  goal: string
  max_steps: number
  config: ConfiguredProjectConfig
}

export interface CreateConfiguredProjectResponse {
  project: Project
  message: string
}

export interface SimpleExecuteResponse {
  execution_id: string
  goal: string
  status: string
  result: string
  timestamp: string
}

class ROMAApiService {
  private baseUrl: string

  constructor(baseUrl: string = ROMA_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    const response = await fetch(url, { ...defaultOptions, ...options })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // System Information
  async getSystemInfo(): Promise<SystemInfo> {
    return this.request<SystemInfo>('/api/system-info')
  }

  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/health')
  }

  async getReadiness(): Promise<ReadinessStatus> {
    return this.request<ReadinessStatus>('/readiness')
  }

  // Task Graph
  async getTaskGraph(): Promise<TaskGraph> {
    return this.request<TaskGraph>('/api/task-graph')
  }

  // Project Management
  async getProjects(): Promise<ProjectsListResponse> {
    return this.request<ProjectsListResponse>('/api/projects')
  }

  async createProject(projectData: CreateProjectRequest): Promise<CreateProjectResponse> {
    return this.request<CreateProjectResponse>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  }

  async createConfiguredProject(projectData: CreateConfiguredProjectRequest): Promise<CreateConfiguredProjectResponse> {
    return this.request<CreateConfiguredProjectResponse>('/api/projects/configured', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  }

  async getProject(projectId: string): Promise<{ project: Project; state: TaskGraph }> {
    return this.request<{ project: Project; state: TaskGraph }>(`/api/projects/${projectId}`)
  }

  async switchProject(projectId: string): Promise<{ project: Project; message: string }> {
    return this.request<{ project: Project; message: string }>(`/api/projects/${projectId}/switch`, {
      method: 'POST',
    })
  }

  async deleteProject(projectId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    })
  }

  async getProjectConfig(projectId: string): Promise<any> {
    return this.request<any>(`/api/projects/${projectId}/config`)
  }

  async saveProjectResults(projectId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/projects/${projectId}/save-results`, {
      method: 'POST',
    })
  }

  async loadProjectResults(projectId: string): Promise<any> {
    return this.request<any>(`/api/projects/${projectId}/load-results`)
  }

  async downloadProjectReport(projectId: string, format: 'markdown' | 'json' | 'html' = 'markdown'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/projects/${projectId}/download-report?format=${format}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.blob()
  }

  // Simple API
  async executeGoal(goalData: SimpleExecuteRequest): Promise<SimpleExecuteResponse> {
    return this.request<SimpleExecuteResponse>('/api/simple/execute', {
      method: 'POST',
      body: JSON.stringify(goalData),
    })
  }

  async research(topic: string, options: any = {}, enable_hitl: boolean = false): Promise<any> {
    return this.request<any>('/api/simple/research', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        options,
        enable_hitl,
      }),
    })
  }

  async analysis(dataDescription: string, options: any = {}, enable_hitl: boolean = false): Promise<any> {
    return this.request<any>('/api/simple/analysis', {
      method: 'POST',
      body: JSON.stringify({
        data_description: dataDescription,
        options,
        enable_hitl,
      }),
    })
  }

  async getSimpleStatus(): Promise<any> {
    return this.request<any>('/api/simple/status')
  }

  // HITL (Human-in-the-Loop) API
  async sendHITLRequest(requestData: {
    checkpoint_name: string
    context_message: string
    data_for_review: any
    node_id: string
    current_attempt: number
    request_id: string
    timestamp: string
  }): Promise<any> {
    return this.request<any>('/api/system/hitl-request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    })
  }

  async getHITLResponse(requestId: string): Promise<{
    has_response: boolean
    response?: {
      user_choice: 'approved' | 'request_modification' | 'aborted'
      message: string
      modification_instructions?: string
    }
    request_id: string
  }> {
    return this.request<any>(`/api/system/hitl-response/${requestId}`)
  }

  // WebSocket connection helper
  getWebSocketUrl(): string {
    return `${this.baseUrl.replace('http', 'ws')}/socket.io/`
  }
}

// Export singleton instance
export const romaApi = new ROMAApiService()

// Export class for custom instances
export default ROMAApiService
