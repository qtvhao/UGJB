import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Plus, CheckCircle, XCircle, RefreshCw, Settings, ExternalLink, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { integrationApi, settingsApi } from '@/lib/api'

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

export default function IntegrationsPage() {
  const navigate = useNavigate()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [availableIntegrations, setAvailableIntegrations] = useState<AvailableIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [connectionsRes, availableRes] = await Promise.all([
          integrationApi.connections.list(),
          settingsApi.availableIntegrations(),
        ])

        if (connectionsRes.data && Array.isArray(connectionsRes.data)) {
          const mapped = connectionsRes.data.map((item: { id: number; name: string; type: string; status: string; lastSync: string; syncFrequency: string; metrics?: { items: number; synced: number }; error?: string }, index: number) => ({
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

        if (availableRes.data && Array.isArray(availableRes.data)) {
          setAvailableIntegrations(availableRes.data)
        }
      } catch (err) {
        console.error('Failed to fetch integrations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

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
