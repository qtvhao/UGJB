import axios from 'axios'

// Base API client configured to work with nginx proxy
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auth event for components to subscribe to
export const authEvents = {
  listeners: new Set<() => void>(),
  onUnauthorized(callback: () => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  },
  emitUnauthorized() {
    this.listeners.forEach((callback) => callback())
  },
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - emit event for React Router navigation
      localStorage.removeItem('auth_token')
      authEvents.emitUnauthorized()
    }
    return Promise.reject(error)
  }
)

// API endpoints organized by bounded context

// HR Management
export const hrApi = {
  employees: {
    list: () => api.get('/hr-management/employees'),
    get: (id: string) => api.get(`/hr-management/employees/${id}`),
    create: (data: unknown) => api.post('/hr-management/employees', data),
    update: (id: string, data: unknown) => api.put(`/hr-management/employees/${id}`, data),
    delete: (id: string) => api.delete(`/hr-management/employees/${id}`),
  },
  skills: {
    list: () => api.get('/hr-management/skills'),
    pending: () => api.get('/hr-management/skills/pending'),
    create: (data: unknown) => api.post('/hr-management/skills', data),
    approve: (id: string) => api.post(`/hr-management/skills/${id}/approve`),
    reject: (id: string) => api.post(`/hr-management/skills/${id}/reject`),
    gaps: () => api.get('/hr-management/skills/gaps'),
    recommendations: () => api.get('/hr-management/skills/recommendations'),
  },
  assignments: {
    list: () => api.get('/hr-management/assignments'),
    create: (data: unknown) => api.post('/hr-management/assignments', data),
    update: (id: string, data: unknown) => api.put(`/hr-management/assignments/${id}`, data),
    overAllocated: () => api.get('/hr-management/assignments/over-allocated'),
    resolve: (employeeId: string, data: unknown) => api.post(`/hr-management/assignments/resolve/${employeeId}`, data),
  },
  learningPaths: {
    list: () => api.get('/hr-management/learning-paths'),
    get: (id: string) => api.get(`/hr-management/learning-paths/${id}`),
    enroll: (id: string, employeeId: string) => api.post(`/hr-management/learning-paths/${id}/enroll`, { employeeId }),
  },
}

// Project Management
export const projectsApi = {
  list: () => api.get('/project-management/projects'),
  get: (id: string) => api.get(`/project-management/projects/${id}`),
  create: (data: unknown) => api.post('/project-management/projects', data),
}

// Engineering Analytics
export const analyticsApi = {
  metrics: {
    dora: () => api.get('/engineering-analytics/metrics/dora'),
    deployments: () => api.get('/engineering-analytics/deployments'),
    codeQuality: () => api.get('/engineering-analytics/metrics/code-quality'),
  },
  kpi: {
    calculate: (params: unknown) => api.post('/engineering-analytics/kpi/calculate', params),
  },
}

// Goal Management
export const goalsApi = {
  objectives: {
    list: () => api.get('/goal-management/objectives'),
    create: (data: unknown) => api.post('/goal-management/objectives', data),
    update: (id: string, data: unknown) => api.put(`/goal-management/objectives/${id}`, data),
  },
  keyResults: {
    list: (objectiveId: string) => api.get(`/goal-management/objectives/${objectiveId}/key-results`),
    update: (id: string, data: unknown) => api.put(`/goal-management/key-results/${id}`, data),
  },
}

// Project Management
export const projectApi = {
  sprints: {
    list: () => api.get('/project-management/sprints'),
    current: () => api.get('/project-management/sprints/current'),
    create: (data: unknown) => api.post('/project-management/sprints', data),
  },
  tasks: {
    list: (sprintId?: string) =>
      api.get('/project-management/tasks', { params: { sprintId } }),
    assign: (taskId: string, employeeId: string) =>
      api.post(`/project-management/tasks/${taskId}/assign`, { employeeId }),
  },
}

// System Integration
export const integrationApi = {
  connections: {
    list: () => api.get('/system-integration/connections'),
    create: (data: unknown) => api.post('/system-integration/connections', data),
    sync: (id: string) => api.post(`/system-integration/connections/${id}/sync`),
    delete: (id: string) => api.delete(`/system-integration/connections/${id}`),
  },
}

// Workforce Wellbeing
export const wellbeingApi = {
  burnoutRisk: {
    list: () => api.get('/workforce-wellbeing/burnout-risks'),
    predict: (employeeId: string) =>
      api.get(`/workforce-wellbeing/burnout-risks/${employeeId}`),
  },
  wellbeing: {
    indicators: () => api.get('/workforce-wellbeing/indicators'),
    submit: (data: unknown) => api.post('/workforce-wellbeing/surveys', data),
  },
}

// Workforce Planning
export const workforcePlanningApi = {
  metrics: () => api.get('/workforce-planning/metrics'),
  departmentAllocation: () => api.get('/workforce-planning/department-allocation'),
  capacityForecast: () => api.get('/workforce-planning/capacity-forecast'),
}

// Settings
export const settingsApi = {
  roles: {
    list: () => api.get('/settings/roles'),
    create: (data: unknown) => api.post('/settings/roles', data),
    update: (id: string, data: unknown) => api.put(`/settings/roles/${id}`, data),
    delete: (id: string) => api.delete(`/settings/roles/${id}`),
  },
  security: {
    list: () => api.get('/settings/security'),
    update: (settingName: string, enabled: boolean) =>
      api.patch(`/settings/security/${settingName}`, { enabled }),
  },
  auditLogs: {
    list: (params?: { action?: string; startDate?: string; endDate?: string }) =>
      api.get('/settings/audit-logs', { params }),
    recent: () => api.get('/settings/audit-logs/recent'),
    export: (params?: { action?: string; startDate?: string; endDate?: string }) =>
      api.post('/settings/audit-logs/export', params),
  },
  availableIntegrations: () => api.get('/settings/available-integrations'),
}

// Automation (Cluster 0002)
export const automationApi = {
  rules: {
    list: () => api.get('/engineering-analytics/automation/rules'),
    get: (id: string) => api.get(`/engineering-analytics/automation/rules/${id}`),
    create: (data: unknown) => api.post('/engineering-analytics/automation/rules', data),
    update: (id: string, data: unknown) => api.put(`/engineering-analytics/automation/rules/${id}`, data),
    test: (id: string) => api.post(`/engineering-analytics/automation/rules/${id}/test`),
    activate: (id: string) => api.post(`/engineering-analytics/automation/rules/${id}/activate`),
  },
  executions: {
    list: () => api.get('/engineering-analytics/automation/executions'),
  },
  thresholds: {
    create: (data: unknown) => api.post('/engineering-analytics/automation/thresholds', data),
  },
}

// Webhooks (Cluster 0002)
export const webhooksApi = {
  configs: {
    list: () => api.get('/engineering-analytics/webhooks/configs'),
    create: (data: unknown) => api.post('/engineering-analytics/webhooks/configs', data),
    stats: (id: string) => api.get(`/engineering-analytics/webhooks/configs/${id}/stats`),
  },
  events: {
    list: () => api.get('/engineering-analytics/webhooks/events'),
  },
}

// Custom Dashboards (Cluster 0002)
export const dashboardsApi = {
  list: () => api.get('/engineering-analytics/dashboards'),
  get: (id: string) => api.get(`/engineering-analytics/dashboards/${id}`),
  create: (data: unknown) => api.post('/engineering-analytics/dashboards', data),
  update: (id: string, data: unknown) => api.put(`/engineering-analytics/dashboards/${id}`, data),
  delete: (id: string) => api.delete(`/engineering-analytics/dashboards/${id}`),
  executiveOverview: () => api.get('/engineering-analytics/dashboards/executive-overview'),
}

// Capacity (Cluster 0002)
export const capacityApi = {
  teams: {
    list: () => api.get('/hr-management/capacity/teams'),
    get: (id: string) => api.get(`/hr-management/capacity/team/${id}`),
    export: (id: string) => api.post(`/hr-management/capacity/team/${id}/export`),
  },
  employees: {
    list: () => api.get('/hr-management/capacity/employees'),
    get: (id: string) => api.get(`/hr-management/capacity/employee/${id}`),
  },
  alerts: {
    overAllocated: () => api.get('/hr-management/capacity/alerts/over-allocated'),
    underUtilized: () => api.get('/hr-management/capacity/alerts/under-utilized'),
  },
}

// Navigation Configuration
export const navigationApi = {
  list: () => api.get('/navigation'),
}

// Unified Analytics (Cluster 0003)
export const unifiedAnalyticsApi = {
  // Dashboard Configuration (US06 - KPI Dashboard Customization)
  dashboards: {
    list: (audience?: string) =>
      api.get('/unified-analytics/dashboards', { params: { audience } }),
    get: (id: string) => api.get(`/unified-analytics/dashboards/${id}`),
    create: (data: unknown) => api.post('/unified-analytics/dashboards', data),
    update: (id: string, data: unknown) =>
      api.patch(`/unified-analytics/dashboards/${id}`, data),
    delete: (id: string) => api.delete(`/unified-analytics/dashboards/${id}`),
    addFormula: (id: string, data: unknown) =>
      api.post(`/unified-analytics/dashboards/${id}/formulas`, data),
    addAlert: (id: string, data: unknown) =>
      api.post(`/unified-analytics/dashboards/${id}/alerts`, data),
  },

  // Incident Attribution (US08 - Incident Attribution and Review)
  incidents: {
    list: (status?: string) =>
      api.get('/unified-analytics/incidents', { params: { status } }),
    get: (id: string) => api.get(`/unified-analytics/incidents/${id}`),
    create: (data: unknown) => api.post('/unified-analytics/incidents', data),
    autoAttribute: (id: string) =>
      api.post(`/unified-analytics/incidents/${id}/auto-attribute`),
    manualAttribute: (id: string, employeeId: string) =>
      api.post(`/unified-analytics/incidents/${id}/attribute`, { employeeId }),
    dispute: (attributionId: string, reason: string) =>
      api.post(`/unified-analytics/incidents/attributions/${attributionId}/dispute`, {
        reason,
      }),
    getAttributionHistory: (id: string) =>
      api.get(`/unified-analytics/incidents/${id}/attributions`),
  },

  // Performance Reviews (US07 - Performance Data Validation)
  reviews: {
    list: (status?: string) =>
      api.get('/unified-analytics/reviews', { params: { status } }),
    get: (id: string) => api.get(`/unified-analytics/reviews/${id}`),
    create: (data: unknown) => api.post('/unified-analytics/reviews', data),
    update: (id: string, data: unknown) =>
      api.patch(`/unified-analytics/reviews/${id}`, data),
    managerApprove: (id: string) =>
      api.post(`/unified-analytics/reviews/${id}/approve/manager`),
    hrApprove: (id: string) =>
      api.post(`/unified-analytics/reviews/${id}/approve/hr`),
    addQualitativeAssessment: (id: string, assessment: string) =>
      api.patch(`/unified-analytics/reviews/${id}`, { qualitativeAssessment: assessment }),
    getFlagged: () => api.get('/unified-analytics/reviews', { params: { flagged: true } }),
  },

  // Platform Synchronization
  syncs: {
    list: () => api.get('/unified-analytics/syncs'),
    get: (id: string) => api.get(`/unified-analytics/syncs/${id}`),
    create: (data: unknown) => api.post('/unified-analytics/syncs', data),
    execute: (id: string) => api.post(`/unified-analytics/syncs/${id}/execute`),
    getLogs: (id: string) => api.get(`/unified-analytics/syncs/${id}/logs`),
  },

  // Middleware Documentation
  middleware: {
    listComponents: () => api.get('/unified-analytics/middleware/components'),
    registerComponent: (data: unknown) =>
      api.post('/unified-analytics/middleware/components', data),
    logMaintenance: (data: unknown) =>
      api.post('/unified-analytics/middleware/maintenance', data),
    getSummary: () => api.get('/unified-analytics/middleware/summary'),
    getMaintenanceLogs: (componentId?: string) =>
      api.get('/unified-analytics/middleware/maintenance', { params: { componentId } }),
  },
}
