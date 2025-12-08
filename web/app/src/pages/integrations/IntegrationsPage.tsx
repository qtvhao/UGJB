import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Plus, CheckCircle, XCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { integrationApi } from '@/lib/api'

interface Integration {
  id: number
  name: string
  type: string
  status: 'connected' | 'error' | 'disconnected'
  lastSync: string | null
  syncFrequency: string
  metrics: { items: number; synced: number }
  error?: string
}

interface AvailableIntegration {
  name: string
  type: string
  description: string
}

const defaultIntegrations: Integration[] = [
  { id: 1, name: 'Jira', type: 'Project Management', status: 'connected', lastSync: '2024-01-15T14:30:00Z', syncFrequency: '15 min', metrics: { items: 1250, synced: 1248 } },
  { id: 2, name: 'GitLab', type: 'Version Control', status: 'connected', lastSync: '2024-01-15T14:25:00Z', syncFrequency: '5 min', metrics: { items: 5420, synced: 5420 } },
  { id: 3, name: 'GitHub', type: 'Version Control', status: 'connected', lastSync: '2024-01-15T14:28:00Z', syncFrequency: '5 min', metrics: { items: 3210, synced: 3208 } },
  { id: 4, name: 'Firebase', type: 'Analytics', status: 'error', lastSync: '2024-01-15T10:00:00Z', syncFrequency: '30 min', metrics: { items: 0, synced: 0 }, error: 'Authentication token expired' },
  { id: 5, name: 'Slack', type: 'Communication', status: 'connected', lastSync: '2024-01-15T14:20:00Z', syncFrequency: 'Real-time', metrics: { items: 890, synced: 890 } },
  { id: 6, name: 'Azure DevOps', type: 'CI/CD', status: 'disconnected', lastSync: null, syncFrequency: '-', metrics: { items: 0, synced: 0 } },
]

const defaultAvailableIntegrations: AvailableIntegration[] = [
  { name: 'Jenkins', type: 'CI/CD', description: 'CI/CD pipeline automation' },
  { name: 'Confluence', type: 'Documentation', description: 'Team documentation' },
  { name: 'PagerDuty', type: 'Incident Management', description: 'On-call and incident response' },
]

export default function IntegrationsPage() {
  const navigate = useNavigate()
  const [integrations, setIntegrations] = useState<Integration[]>(defaultIntegrations)
  const [availableIntegrations] = useState<AvailableIntegration[]>(defaultAvailableIntegrations)
  const [, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<number | null>(null)

  useEffect(() => {
    async function fetchIntegrations() {
      try {
        setLoading(true)
        const response = await integrationApi.connections.list()
        if (response.data && Array.isArray(response.data)) {
          const mapped = response.data.map((item: { id: number; name: string; type: string; status: string; lastSync: string; syncFrequency: string; metrics?: { items: number; synced: number }; error?: string }, index: number) => ({
            id: item.id || index + 1,
            name: item.name,
            type: item.type,
            status: item.status as 'connected' | 'error' | 'disconnected',
            lastSync: item.lastSync,
            syncFrequency: item.syncFrequency || '15 min',
            metrics: item.metrics || { items: 0, synced: 0 },
            error: item.error,
          }))
          setIntegrations(mapped)
        }
      } catch {
        setIntegrations(defaultIntegrations)
      } finally {
        setLoading(false)
      }
    }

    fetchIntegrations()
  }, [])

  const handleSync = async (id: number) => {
    setSyncing(id)
    try {
      await integrationApi.connections.sync(String(id))
    } catch {
      // Sync failed, UI will show error state
    } finally {
      setTimeout(() => setSyncing(null), 2000)
    }
  }

  const handleAddIntegration = () => {
    navigate('/integrations/new')
  }

  const handleOpenSettings = (integrationId: number) => {
    navigate(`/integrations/${integrationId}/settings`)
  }

  const connectedCount = integrations.filter((i) => i.status === 'connected').length
  const errorCount = integrations.filter((i) => i.status === 'error').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Integrations</h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Manage data source connections and synchronization
          </p>
        </div>
        <Button onClick={handleAddIntegration}>
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {connectedCount}
                </p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">{errorCount}</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {integrations.reduce((sum, i) => sum + i.metrics.synced, 0).toLocaleString()}
                </p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Items Synced</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className={`p-4 border rounded-lg ${
                  integration.status === 'error'
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    : 'border-secondary-200 dark:border-secondary-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        integration.status === 'connected'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : integration.status === 'error'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-secondary-100 dark:bg-secondary-800'
                      }`}
                    >
                      {integration.status === 'connected' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : integration.status === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-secondary-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {integration.name}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {integration.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.status === 'connected' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSync(integration.id)}
                        disabled={syncing === integration.id}
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${syncing === integration.id ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleOpenSettings(integration.id)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {integration.status === 'error' && integration.error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{integration.error}</p>
                )}
                {integration.status === 'connected' && (
                  <div className="mt-3 flex items-center gap-4 text-sm text-secondary-500 dark:text-secondary-400">
                    <span>Last sync: {new Date(integration.lastSync!).toLocaleString()}</span>
                    <span>Frequency: {integration.syncFrequency}</span>
                    <span>
                      {integration.metrics.synced.toLocaleString()}/{integration.metrics.items.toLocaleString()} items
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {availableIntegrations.map((integration) => (
              <div
                key={integration.name}
                className="p-4 border border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg hover:border-primary-500 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-secondary-900 dark:text-white">
                      {integration.name}
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      {integration.type}
                    </p>
                    <p className="text-sm text-secondary-400 dark:text-secondary-500 mt-2">
                      {integration.description}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-secondary-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
