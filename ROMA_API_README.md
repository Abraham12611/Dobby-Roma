# Backend API Documentation

This document describes how to connect any frontend to the Sentient Research Agent backend.

## Server Configuration

- **Default Port**: 5001 (changed from 5000)
- **Host**: 0.0.0.0 (all interfaces)
- **Protocol**: HTTP/HTTPS + WebSocket (Socket.IO)

## API Endpoints

### System Information

#### GET `/api/system-info`
Get system information and statistics.

**Response:**
```json
{
  "system_initialized": true,
  "current_profile": "general_agent",
  "available_profiles": ["general_agent", "crypto_analytics_agent"],
  "framework_available": true,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "initialized": true,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET `/readiness`
Get system readiness status.

**Response:**
```json
{
  "ready": true,
  "components": {
    "system_initialized": true,
    "websocket_hitl_ready": true,
    "cache_ready": true,
    "execution_engine_ready": true
  },
  "websocket_hitl_status": "ready",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Task Graph

#### GET `/api/task-graph`
Get current task graph data for visualization.

**Response:**
```json
{
  "all_nodes": {
    "node_id": {
      "id": "node_id",
      "title": "Task Title",
      "status": "DONE|RUNNING|PENDING|FAILED",
      "layer": 0,
      "parent_node_id": null,
      "children": ["child1", "child2"],
      "output_summary": "Task result summary",
      "full_result": {...},
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  },
  "overall_project_goal": "Main project goal",
  "project_id": "project_123",
  "execution_status": "completed|running|failed"
}
```

### Project Management

#### GET `/api/projects`
Get all projects.

**Response:**
```json
{
  "projects": [
    {
      "id": "project_123",
      "title": "Project Title",
      "goal": "Project goal description",
      "status": "completed|running|failed",
      "created_at": "2024-01-01T00:00:00Z",
      "max_steps": 250
    }
  ],
  "current_project_id": "project_123"
}
```

#### POST `/api/projects`
Create a new project.

**Request:**
```json
{
  "goal": "Research quantum computing applications",
  "max_steps": 250
}
```

**Response:**
```json
{
  "project": {
    "id": "project_123",
    "title": "Project Title",
    "goal": "Research quantum computing applications",
    "status": "running",
    "created_at": "2024-01-01T00:00:00Z",
    "max_steps": 250
  },
  "message": "Project created and started"
}
```

#### POST `/api/projects/configured`
Create a project with custom configuration.

**Request:**
```json
{
  "goal": "Research quantum computing applications",
  "max_steps": 250,
  "config": {
    "active_profile_name": "crypto_analytics_agent",
    "llm": {
      "provider": "openai",
      "model": "gpt-4o",
      "temperature": 0.7,
      "max_tokens": 4000,
      "timeout": 60,
      "max_retries": 3
    },
    "execution": {
      "max_concurrent_nodes": 6,
      "max_execution_steps": 250,
      "max_recursion_depth": 2,
      "task_timeout_seconds": 300,
      "enable_hitl": true,
      "hitl_timeout_seconds": 300
    },
    "cache": {
      "enabled": true,
      "ttl_seconds": 3600,
      "max_size": 1000,
      "cache_type": "memory"
    }
  }
}
```

#### GET `/api/projects/{project_id}`
Get a specific project and its state.

**Response:**
```json
{
  "project": {
    "id": "project_123",
    "title": "Project Title",
    "goal": "Project goal",
    "status": "completed",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "state": {
    "all_nodes": {...},
    "overall_project_goal": "Main goal",
    "execution_status": "completed"
  }
}
```

#### POST `/api/projects/{project_id}/switch`
Switch to a different project.

**Response:**
```json
{
  "project": {...},
  "message": "Switched to project project_123"
}
```

#### DELETE `/api/projects/{project_id}`
Delete a project.

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

#### GET `/api/projects/{project_id}/config`
Get project configuration.

#### POST `/api/projects/{project_id}/save-results`
Save project results for persistence.

#### GET `/api/projects/{project_id}/load-results`
Load saved project results.

#### GET `/api/projects/{project_id}/download-report`
Download project report.

**Query Parameters:**
- `format`: `markdown|json|html` (default: `markdown`)

### Simple API

#### POST `/api/simple/execute`
Execute any goal directly.

**Request:**
```json
{
  "goal": "Research quantum computing applications",
  "options": {
    "enable_hitl": false
  }
}
```

**Response:**
```json
{
  "execution_id": "exec_123",
  "goal": "Research quantum computing applications",
  "status": "completed",
  "result": "Detailed research results...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/simple/research`
Quick research tasks.

**Request:**
```json
{
  "topic": "quantum computing applications",
  "options": {},
  "enable_hitl": false
}
```

#### POST `/api/simple/analysis`
Quick analysis tasks.

**Request:**
```json
{
  "data_description": "Analyze sales data for Q4",
  "options": {},
  "enable_hitl": false
}
```

#### GET `/api/simple/status`
Get Simple API status.

**Response:**
```json
{
  "framework_available": true,
  "simple_agent_ready": true,
  "config_loaded": true,
  "endpoints": [
    "/api/simple/execute",
    "/api/simple/research",
    "/api/simple/analysis",
    "/api/simple/stream"
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### HITL (Human-in-the-Loop) API

#### POST `/api/system/hitl-request`
Send HITL request via HTTP.

**Request:**
```json
{
  "checkpoint_name": "planning_checkpoint",
  "context_message": "Please review the generated plan",
  "data_for_review": {...},
  "node_id": "node_123",
  "current_attempt": 1,
  "request_id": "hitl_req_123",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET `/api/system/hitl-response/{request_id}`
Get HITL response for a specific request.

**Response:**
```json
{
  "has_response": true,
  "response": {
    "user_choice": "approved|request_modification|aborted",
    "message": "User approved checkpoint",
    "modification_instructions": "Optional modification instructions"
  },
  "request_id": "hitl_req_123"
}
```

## WebSocket Events

### Connection

Connect to WebSocket at `ws://localhost:5001/socket.io/`

### Client → Server Events

#### `connect`
Connect to the server.

#### `disconnect`
Disconnect from the server.

#### `request_initial_state`
Request initial state when connecting.

#### `start_project`
Start a new project.

**Data:**
```json
{
  "goal": "Research quantum computing applications",
  "max_steps": 250
}
```

#### `simple_execute_stream`
Stream simple API execution.

**Data:**
```json
{
  "goal": "Research quantum computing applications",
  "options": {
    "enable_hitl": false
  }
}
```

#### `hitl_response`
Respond to HITL request.

**Data:**
```json
{
  "request_id": "hitl_req_123",
  "action": "approve|modify|abort",
  "modification_instructions": "Optional instructions"
}
```

### Server → Client Events

#### `projects_list`
List of all projects.

**Data:**
```json
{
  "projects": [...],
  "current_project_id": "project_123"
}
```

#### `task_graph_update`
Real-time task graph updates.

**Data:**
```json
{
  "all_nodes": {...},
  "overall_project_goal": "Main goal",
  "project_id": "project_123",
  "execution_status": "running|completed|failed"
}
```

#### `project_started`
Project started confirmation.

**Data:**
```json
{
  "message": "Project started: Research quantum computing applications",
  "project": {...}
}
```

#### `simple_execution_started`
Simple execution started.

**Data:**
```json
{
  "message": "Simple execution started: Research quantum computing...",
  "goal": "Research quantum computing applications"
}
```

#### `simple_execution_error`
Simple execution error.

**Data:**
```json
{
  "message": "Error description"
}
```

#### `hitl_request`
HITL request from server.

**Data:**
```json
{
  "checkpoint_name": "planning_checkpoint",
  "context_message": "Please review the generated plan",
  "data_for_review": {...},
  "node_id": "node_123",
  "current_attempt": 1,
  "request_id": "hitl_req_123",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### `hitl_error`
HITL error.

**Data:**
```json
{
  "message": "Error description"
}
```

#### `error`
General error.

**Data:**
```json
{
  "message": "Error description"
}
```

## Frontend Integration Examples

### JavaScript/TypeScript with Socket.IO

```javascript
import { io } from 'socket.io-client';

// Connect to WebSocket
const socket = io('http://localhost:5001', {
  transports: ['polling'],
  timeout: 20000
});

// Listen for events
socket.on('connect', () => {
  console.log('Connected to backend');
  socket.emit('request_initial_state');
});

socket.on('task_graph_update', (data) => {
  console.log('Task graph updated:', data);
  // Update your UI with the new graph data
});

socket.on('hitl_request', (data) => {
  console.log('HITL request:', data);
  // Show HITL modal to user
});

// Send events
socket.emit('start_project', {
  goal: 'Research quantum computing applications',
  max_steps: 250
});

socket.emit('hitl_response', {
  request_id: 'hitl_req_123',
  action: 'approve',
  modification_instructions: 'Optional instructions'
});
```

### HTTP API Example

```javascript
// Create a project
const createProject = async (goal, maxSteps = 250) => {
  const response = await fetch('http://localhost:5001/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      goal,
      max_steps: maxSteps
    })
  });
  
  return await response.json();
};

// Get task graph
const getTaskGraph = async () => {
  const response = await fetch('http://localhost:5001/api/task-graph');
  return await response.json();
};

// Simple API execution
const executeGoal = async (goal, options = {}) => {
  const response = await fetch('http://localhost:5001/api/simple/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      goal,
      options
    })
  });
  
  return await response.json();
};
```

### React Hook Example

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useBackendConnection = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [taskGraph, setTaskGraph] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:5001', {
      transports: ['polling'],
      timeout: 20000
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('request_initial_state');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('task_graph_update', (data) => {
      setTaskGraph(data);
    });

    newSocket.on('projects_list', (data) => {
      setProjects(data.projects);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const startProject = (goal, maxSteps = 250) => {
    if (socket) {
      socket.emit('start_project', { goal, max_steps: maxSteps });
    }
  };

  const respondToHITL = (requestId, action, instructions = '') => {
    if (socket) {
      socket.emit('hitl_response', {
        request_id: requestId,
        action,
        modification_instructions: instructions
      });
    }
  };

  return {
    socket,
    isConnected,
    taskGraph,
    projects,
    startProject,
    respondToHITL
  };
};
```

## CORS Configuration

The backend is configured to allow CORS from `http://localhost:3000` by default. For other frontends, you may need to update the CORS configuration in the backend code.

## Error Handling

All API endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a JSON object with an `error` field:

```json
{
  "error": "Error description"
}
```

## Authentication

Currently, the backend does not implement authentication. All endpoints are publicly accessible. For production use, you should implement proper authentication and authorization.

## Rate Limiting

No rate limiting is currently implemented. Consider implementing rate limiting for production use.

## WebSocket Reconnection

The backend supports WebSocket reconnection. Clients should implement reconnection logic to handle network interruptions gracefully.

## Development vs Production

- **Development**: Backend runs on `http://localhost:5001`
- **Production**: Update the backend URL in your frontend configuration

## Troubleshooting

1. **Connection Issues**: Ensure the backend is running on port 5001
2. **CORS Errors**: Check CORS configuration for your frontend domain
3. **WebSocket Issues**: Verify Socket.IO client version compatibility
4. **HITL Not Working**: Ensure HITL is enabled in the backend configuration

## Additional Resources

- Backend source code: `src/sentientresearchagent/server/`
- Frontend example: `frontend/src/`
- Configuration: `sentient.yaml`
