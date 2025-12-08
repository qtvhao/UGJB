import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Database,
  ArrowRightLeft,
  Play,
  History,
} from 'lucide-react'
import { clsx } from 'clsx'

interface PlatformSync {
  id: string
  platform: 'lattice' | 'monday' | 'devlake' | 'jira' | 'gitlab'
  direction: 'inbound' | 'outbound' | 'bidirectional'
  lastSyncAt: string | null
  nextSyncAt: string
  status: 'idle' | 'syncing' | 'success' | 'error'
  syncFrequency: 'realtime' | 'hourly' | 'daily'
  recordsProcessed: number
  errorMessage: string | null
}

interface SyncLog {
  id: string
  platformId: string
  startedAt: string
  completedAt: string | null
  status: 'success' | 'error' | 'in_progress'
  recordsProcessed: number
  errorDetails: string | null
}

// Mock data for demonstration
const mockPlatforms: PlatformSync[] = [
  {
    id: 'sync-001',
    platform: 'lattice',
    direction: 'bidirectional',
    lastSyncAt: '2025-12-08T10:00:00Z',
    nextSyncAt: '2025-12-08T11:00:00Z',
    status: 'success',
    syncFrequency: 'hourly',
    recordsProcessed: 156,
    errorMessage: null,
  },
  {
    id: 'sync-002',
    platform: 'monday',
    direction: 'bidirectional',
    lastSyncAt: '2025-12-08T09:45:00Z',
    nextSyncAt: '2025-12-08T10:45:00Z',
    status: 'success',
    syncFrequency: 'hourly',
    recordsProcessed: 234,
    errorMessage: null,
  },
  {
    id: 'sync-003',
    platform: 'devlake',
    direction: 'inbound',
    lastSyncAt: '2025-12-08T10:30:00Z',
    nextSyncAt: '2025-12-08T10:35:00Z',
    status: 'syncing',
    syncFrequency: 'realtime',
    recordsProcessed: 0,
    errorMessage: null,
  },
  {
    id: 'sync-004',
    platform: 'jira',
    direction: 'inbound',
    lastSyncAt: '2025-12-08T06:00:00Z',
    nextSyncAt: '2025-12-09T06:00:00Z',
    status: 'error',
    syncFrequency: 'daily',
    recordsProcessed: 0,
    errorMessage: 'API rate limit exceeded. Retry in 1 hour.',
  },
  {
    id: 'sync-005',
    platform: 'gitlab',
    direction: 'inbound',
    lastSyncAt: '2025-12-08T10:00:00Z',
    nextSyncAt: '2025-12-08T11:00:00Z',
    status: 'success',
    syncFrequency: 'hourly',
    recordsProcessed: 89,
    errorMessage: null,
  },
]

const mockLogs: SyncLog[] = [
  {
    id: 'log-001',
    platformId: 'sync-001',
    startedAt: '2025-12-08T10:00:00Z',
    completedAt: '2025-12-08T10:02:15Z',
    status: 'success',
    recordsProcessed: 156,
    errorDetails: null,
  },
  {
    id: 'log-002',
    platformId: 'sync-002',
    startedAt: '2025-12-08T09:45:00Z',
    completedAt: '2025-12-08T09:48:32Z',
    status: 'success',
    recordsProcessed: 234,
    errorDetails: null,
  },
  {
    id: 'log-003',
    platformId: 'sync-004',
    startedAt: '2025-12-08T06:00:00Z',
    completedAt: '2025-12-08T06:00:45Z',
    status: 'error',
    recordsProcessed: 0,
    errorDetails: 'API rate limit exceeded (429). Jira API returned: Too Many Requests',
  },
]

const platformColors = {
  lattice: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  monday: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  devlake: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  jira: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  gitlab: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

const statusIcons = {
  idle: <Clock className="w-5 h-5 text-gray-500" />,
  syncing: <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />,
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
}

const directionLabels = {
  inbound: 'Inbound',
  outbound: 'Outbound',
  bidirectional: 'Bidirectional',
}

export default function PlatformSyncPage() {
  const [platforms] = useState<PlatformSync[]>(mockPlatforms)
  const [logs] = useState<SyncLog[]>(mockLogs)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)

  const [syncing, setSyncing] = useState<string[]>([])
  const [historyId, setHistoryId] = useState<string | null>(null)

  const handleSyncAll = () => {
    setSyncing(platforms.map((p) => p.id))
    setTimeout(() => setSyncing([]), 2000)
  }

  const handleSyncPlatform = (platformId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSyncing((prev) => [...prev, platformId])
    setTimeout(() => setSyncing((prev) => prev.filter((id) => id !== platformId)), 2000)
  }

  const handleViewHistory = (platformId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setHistoryId(historyId === platformId ? null : platformId)
  }

  const successCount = platforms.filter((p) => p.status === 'success').length
  const errorCount = platforms.filter((p) => p.status === 'error').length
  const syncingCount = platforms.filter((p) => p.status === 'syncing').length

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Platform Synchronization
        </h1>
        <p className="mt-1 text-secondary-600 dark:text-secondary-400">
          Manage data synchronization with Lattice, Monday.com, DevLake, Jira, and GitLab
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Connected Platforms
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {platforms.length}
                </p>
              </div>
              <Database className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Successful Syncs
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {successCount}
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
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {syncingCount}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Errors
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {errorCount}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Sync Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Platform Status</CardTitle>
          <Button size="sm" variant="primary" onClick={handleSyncAll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={clsx(
                  'py-4 flex items-center justify-between -mx-4 px-4 transition-colors cursor-pointer',
                  selectedPlatform === platform.id
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'hover:bg-secondary-50 dark:hover:bg-secondary-800/50'
                )}
                onClick={() =>
                  setSelectedPlatform(
                    selectedPlatform === platform.id ? null : platform.id
                  )
                }
              >
                <div className="flex items-center gap-4">
                  {statusIcons[platform.status]}
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'px-2 py-1 text-sm font-medium rounded capitalize',
                          platformColors[platform.platform]
                        )}
                      >
                        {platform.platform}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400">
                        <ArrowRightLeft className="w-3 h-3" />
                        {directionLabels[platform.direction]}
                      </span>
                    </div>
                    {platform.lastSyncAt && (
                      <div className="flex items-center gap-4 mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Last sync: {formatDate(platform.lastSyncAt)}
                        </span>
                        <span>
                          Records: {platform.recordsProcessed}
                        </span>
                      </div>
                    )}
                    {platform.errorMessage && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {platform.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'px-2 py-1 text-xs rounded',
                      platform.syncFrequency === 'realtime'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300'
                    )}
                  >
                    {platform.syncFrequency}
                  </span>
                  <Button size="sm" variant="ghost" onClick={(e) => handleSyncPlatform(platform.id, e)}>
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => handleViewHistory(platform.id, e)}>
                    <History className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sync Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log) => {
              const platform = platforms.find((p) => p.id === log.platformId)
              return (
                <div
                  key={log.id}
                  className={clsx(
                    'p-3 rounded-lg border',
                    log.status === 'error'
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                      : log.status === 'in_progress'
                      ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                      : 'border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : log.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                      )}
                      <span className="font-medium text-secondary-900 dark:text-white capitalize">
                        {platform?.platform}
                      </span>
                      <span className="text-sm text-secondary-500 dark:text-secondary-400">
                        {formatDate(log.startedAt)}
                      </span>
                    </div>
                    <span className="text-sm text-secondary-600 dark:text-secondary-300">
                      {log.recordsProcessed} records
                    </span>
                  </div>
                  {log.errorDetails && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 pl-7">
                      {log.errorDetails}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
