import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Wrench,
  FileCode,
  ExternalLink,
  TrendingUp,
} from 'lucide-react'
import { clsx } from 'clsx'

interface MiddlewareComponent {
  id: string
  name: string
  description: string
  integrations: string[]
  lastMaintenance: string
  maintenanceHours: number
  annualBudgetHours: number
  status: 'healthy' | 'warning' | 'critical'
  documentationUrl: string | null
  version: string
}

interface MaintenanceLog {
  id: string
  componentId: string
  description: string
  hoursSpent: number
  performedBy: string
  performedAt: string
  type: 'update' | 'bugfix' | 'optimization' | 'documentation'
}

const initialComponents: MiddlewareComponent[] = [
  {
    id: 'mw-001',
    name: 'Firebase Crashlytics Adapter',
    description: 'Custom API connector for ingesting crash reports into DevLake',
    integrations: ['Firebase Crashlytics', 'DevLake'],
    lastMaintenance: '2025-12-01T10:00:00Z',
    maintenanceHours: 24,
    annualBudgetHours: 40,
    status: 'healthy',
    documentationUrl: '/docs/middleware/firebase-adapter.md',
    version: '2.1.0',
  },
  {
    id: 'mw-002',
    name: 'Prometheus Metrics Bridge',
    description: 'Custom adapter for system observability metrics (latency, uptime)',
    integrations: ['Prometheus', 'DevLake'],
    lastMaintenance: '2025-11-15T14:00:00Z',
    maintenanceHours: 35,
    annualBudgetHours: 40,
    status: 'warning',
    documentationUrl: '/docs/middleware/prometheus-bridge.md',
    version: '1.8.3',
  },
  {
    id: 'mw-003',
    name: 'Jira Bidirectional Sync',
    description: 'Webhook-based synchronization for issue tracking data',
    integrations: ['Jira', 'HR Platform', 'DevLake'],
    lastMaintenance: '2025-12-05T09:00:00Z',
    maintenanceHours: 18,
    annualBudgetHours: 60,
    status: 'healthy',
    documentationUrl: '/docs/middleware/jira-sync.md',
    version: '3.0.1',
  },
  {
    id: 'mw-004',
    name: 'GitLab Webhook Processor',
    description: 'Real-time processing of GitLab events for engineering metrics',
    integrations: ['GitLab', 'DevLake'],
    lastMaintenance: '2025-10-20T11:00:00Z',
    maintenanceHours: 85,
    annualBudgetHours: 80,
    status: 'critical',
    documentationUrl: '/docs/middleware/gitlab-processor.md',
    version: '2.5.2',
  },
]

const initialLogs: MaintenanceLog[] = [
  {
    id: 'log-001',
    componentId: 'mw-001',
    description: 'Updated crash parsing logic for new Firebase SDK version',
    hoursSpent: 8,
    performedBy: 'Alice Johnson',
    performedAt: '2025-12-01T10:00:00Z',
    type: 'update',
  },
  {
    id: 'log-002',
    componentId: 'mw-004',
    description: 'Fixed memory leak in webhook queue processing',
    hoursSpent: 12,
    performedBy: 'Bob Smith',
    performedAt: '2025-11-28T14:00:00Z',
    type: 'bugfix',
  },
  {
    id: 'log-003',
    componentId: 'mw-002',
    description: 'Added documentation for new metric aggregation features',
    hoursSpent: 4,
    performedBy: 'Carol Davis',
    performedAt: '2025-11-15T14:00:00Z',
    type: 'documentation',
  },
]

const statusColors = {
  healthy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const typeIcons = {
  update: <TrendingUp className="w-4 h-4 text-blue-500" />,
  bugfix: <Wrench className="w-4 h-4 text-orange-500" />,
  optimization: <TrendingUp className="w-4 h-4 text-green-500" />,
  documentation: <FileText className="w-4 h-4 text-purple-500" />,
}

export default function MiddlewareDocPage() {
  const [components] = useState<MiddlewareComponent[]>(initialComponents)
  const [logs] = useState<MaintenanceLog[]>(initialLogs)

  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)

  const handleRegisterComponent = () => {
    setShowRegisterModal(!showRegisterModal)
  }

  const handleViewDocs = (componentId: string) => {
    const comp = components.find((c) => c.id === componentId)
    if (comp?.documentationUrl) {
      window.open(comp.documentationUrl, '_blank')
    }
  }

  const handleLogMaintenance = () => {
    setShowLogModal(!showLogModal)
  }

  const totalHoursUsed = components.reduce((acc, c) => acc + c.maintenanceHours, 0)
  const totalBudget = components.reduce((acc, c) => acc + c.annualBudgetHours, 0)
  const healthyCount = components.filter((c) => c.status === 'healthy').length
  const warningCount = components.filter((c) => c.status === 'warning').length
  const criticalCount = components.filter((c) => c.status === 'critical').length

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Middleware Documentation
        </h1>
        <p className="mt-1 text-secondary-600 dark:text-secondary-400">
          Track and maintain custom middleware components. Annual maintenance target: 40-80 hours
          per component.
        </p>
      </div>

      {/* Warning Banner if Over Budget */}
      {criticalCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 dark:text-red-100">
                Platform Re-evaluation Required
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {criticalCount} component(s) have exceeded the 80-hour annual maintenance budget.
                Per policy, a platform re-evaluation process should be triggered.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Total Hours Used
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {totalHoursUsed}
                  <span className="text-sm font-normal text-secondary-500">
                    / {totalBudget}
                  </span>
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary-500" />
            </div>
            <div className="mt-2 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full">
              <div
                className={clsx(
                  'h-2 rounded-full',
                  totalHoursUsed / totalBudget > 0.9
                    ? 'bg-red-500'
                    : totalHoursUsed / totalBudget > 0.7
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                )}
                style={{ width: `${Math.min((totalHoursUsed / totalBudget) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Healthy</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {healthyCount}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Warning</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {warningCount}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Critical</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {criticalCount}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Components List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Middleware Components</CardTitle>
          <Button size="sm" variant="primary" onClick={handleRegisterComponent}>
            <FileCode className="w-4 h-4 mr-2" />
            Register Component
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {components.map((component) => (
              <div
                key={component.id}
                className={clsx(
                  'p-4 rounded-lg border',
                  component.status === 'critical'
                    ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                    : component.status === 'warning'
                    ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10'
                    : 'border-secondary-200 dark:border-secondary-700'
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-primary-500" />
                      <span className="font-medium text-secondary-900 dark:text-white">
                        {component.name}
                      </span>
                      <span className="text-xs text-secondary-500">v{component.version}</span>
                      <span
                        className={clsx(
                          'px-2 py-0.5 text-xs rounded-full capitalize',
                          statusColors[component.status]
                        )}
                      >
                        {component.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                      {component.description}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last maintenance: {formatDate(component.lastMaintenance)}
                      </span>
                      <span>
                        Integrations: {component.integrations.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-secondary-900 dark:text-white">
                      {component.maintenanceHours}h
                      <span className="text-sm font-normal text-secondary-500">
                        / {component.annualBudgetHours}h
                      </span>
                    </div>
                    <div className="mt-1 w-32 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full">
                      <div
                        className={clsx(
                          'h-2 rounded-full',
                          component.maintenanceHours / component.annualBudgetHours > 1
                            ? 'bg-red-500'
                            : component.maintenanceHours / component.annualBudgetHours > 0.8
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        )}
                        style={{
                          width: `${Math.min(
                            (component.maintenanceHours / component.annualBudgetHours) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    {component.documentationUrl && (
                      <Button size="sm" variant="ghost" className="mt-2" onClick={() => handleViewDocs(component.id)}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Docs
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Maintenance Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Maintenance Logs</CardTitle>
          <Button size="sm" variant="secondary" onClick={handleLogMaintenance}>
            <Wrench className="w-4 h-4 mr-2" />
            Log Maintenance
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log) => {
              const component = components.find((c) => c.id === log.componentId)
              return (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-secondary-200 dark:border-secondary-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {typeIcons[log.type]}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-secondary-900 dark:text-white">
                            {component?.name}
                          </span>
                          <span className="text-xs text-secondary-500 capitalize">
                            {log.type}
                          </span>
                        </div>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          {log.description}
                        </p>
                        <div className="mt-1 text-xs text-secondary-500">
                          {log.performedBy} • {formatDate(log.performedAt)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      {log.hoursSpent}h
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
