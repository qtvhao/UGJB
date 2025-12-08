import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Webhook,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { webhooksApi } from '@/lib/api'

interface WebhookConfig {
  id: string
  name: string
  provider: 'gitlab' | 'github' | 'jira' | 'cicd' | 'prometheus'
  status: 'active' | 'inactive' | 'error'
  lastEvent?: string
  eventCount: number
  url: string
}

interface WebhookEvent {
  id: string
  webhookId: string
  provider: string
  eventType: string
  timestamp: string
  status: 'processed' | 'failed' | 'pending'
}

const mockWebhooks: WebhookConfig[] = [
  {
    id: '1',
    name: 'GitLab Production',
    provider: 'gitlab',
    status: 'active',
    lastEvent: '5 mins ago',
    eventCount: 234,
    url: '/webhooks/receive/1/gitlab',
  },
  {
    id: '2',
    name: 'GitHub Main Repo',
    provider: 'github',
    status: 'active',
    lastEvent: '1 hour ago',
    eventCount: 89,
    url: '/webhooks/receive/2/github',
  },
  {
    id: '3',
    name: 'Jira Project Board',
    provider: 'jira',
    status: 'active',
    lastEvent: '30 mins ago',
    eventCount: 156,
    url: '/webhooks/receive/3/jira',
  },
  {
    id: '4',
    name: 'CI/CD Pipeline',
    provider: 'cicd',
    status: 'error',
    lastEvent: '2 hours ago',
    eventCount: 45,
    url: '/webhooks/receive/4/cicd',
  },
]

const mockEvents: WebhookEvent[] = [
  { id: '1', webhookId: '1', provider: 'gitlab', eventType: 'push', timestamp: '5 mins ago', status: 'processed' },
  { id: '2', webhookId: '3', provider: 'jira', eventType: 'issue_updated', timestamp: '30 mins ago', status: 'processed' },
  { id: '3', webhookId: '1', provider: 'gitlab', eventType: 'merge_request', timestamp: '1 hour ago', status: 'processed' },
  { id: '4', webhookId: '4', provider: 'cicd', eventType: 'deployment', timestamp: '2 hours ago', status: 'failed' },
]

export default function WebhooksPage() {
  const navigate = useNavigate()
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWebhooks() {
      try {
        setLoading(true)
        const [configsRes, eventsRes] = await Promise.allSettled([
          webhooksApi.configs.list(),
          webhooksApi.events.list(),
        ])

        if (configsRes.status === 'fulfilled' && Array.isArray(configsRes.value.data)) {
          setWebhooks(configsRes.value.data)
        } else {
          setWebhooks(mockWebhooks)
        }

        if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data)) {
          setEvents(eventsRes.value.data)
        } else {
          setEvents(mockEvents)
        }
      } catch {
        setWebhooks(mockWebhooks)
        setEvents(mockEvents)
      } finally {
        setLoading(false)
      }
    }
    fetchWebhooks()
  }, [])

  const handleAddWebhook = () => {
    navigate('/webhooks/new')
  }

  const handleViewWebhook = (webhookId: string) => {
    navigate(`/webhooks/${webhookId}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'inactive':
        return <Clock className="w-5 h-5 text-secondary-400" />
      default:
        return null
    }
  }

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      gitlab: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      github: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      jira: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      cicd: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      prometheus: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[provider] || colors.github
  }

  const totalEventsProcessed = webhooks.reduce((sum, w) => sum + w.eventCount, 0)
  const failedEvents = events.filter(e => e.status === 'failed').length
  const successRate = totalEventsProcessed > 0
    ? (((totalEventsProcessed - failedEvents) / totalEventsProcessed) * 100).toFixed(1)
    : '100.0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Webhooks
          </h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Configure real-time event ingestion from external systems
          </p>
        </div>
        <Button onClick={handleAddWebhook}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Webhook className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <div>
                <p className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {webhooks.filter((w) => w.status === 'active').length}
                </p>
                <p className="text-xs text-secondary-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {totalEventsProcessed}
                </p>
                <p className="text-xs text-secondary-500">Events Processed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {successRate}%
                </p>
                <p className="text-xs text-secondary-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {webhooks.filter((w) => w.status === 'error').length}
                </p>
                <p className="text-xs text-secondary-500">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(webhook.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-secondary-900 dark:text-white">
                          {webhook.name}
                        </p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getProviderColor(webhook.provider)}`}>
                          {webhook.provider}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {webhook.eventCount} events • Last: {webhook.lastEvent || 'Never'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewWebhook(webhook.id)}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {events.map((event) => (
              <div key={event.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getProviderColor(event.provider)}`}>
                    {event.provider}
                  </span>
                  <span className="text-secondary-700 dark:text-secondary-300">
                    {event.eventType}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-secondary-500">{event.timestamp}</span>
                  {event.status === 'processed' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : event.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
