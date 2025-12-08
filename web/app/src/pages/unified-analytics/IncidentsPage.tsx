import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  UserCheck,
  XCircle,
  GitCommit,
  Server,
} from 'lucide-react'
import { clsx } from 'clsx'

interface Incident {
  id: string
  title: string
  service: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  source: 'firebase' | 'prometheus'
  attributedTo: string | null
  attributionMethod: 'service_ownership' | 'commit_correlation' | 'manual_assignment' | null
  status: 'open' | 'attributed' | 'disputed' | 'resolved'
  createdAt: string
  updatedAt: string
}

const initialIncidents: Incident[] = [
  {
    id: 'INC-001',
    title: 'Payment Service Timeout',
    service: 'payment-service',
    severity: 'critical',
    source: 'prometheus',
    attributedTo: 'John Doe',
    attributionMethod: 'service_ownership',
    status: 'attributed',
    createdAt: '2025-12-08T10:30:00Z',
    updatedAt: '2025-12-08T10:35:00Z',
  },
  {
    id: 'INC-002',
    title: 'Mobile App Crash - Checkout Flow',
    service: 'mobile-app',
    severity: 'high',
    source: 'firebase',
    attributedTo: 'Jane Smith',
    attributionMethod: 'commit_correlation',
    status: 'attributed',
    createdAt: '2025-12-08T09:15:00Z',
    updatedAt: '2025-12-08T09:20:00Z',
  },
  {
    id: 'INC-003',
    title: 'API Gateway High Latency',
    service: 'api-gateway',
    severity: 'medium',
    source: 'prometheus',
    attributedTo: null,
    attributionMethod: null,
    status: 'open',
    createdAt: '2025-12-08T08:45:00Z',
    updatedAt: '2025-12-08T08:45:00Z',
  },
  {
    id: 'INC-004',
    title: 'Database Connection Pool Exhausted',
    service: 'database-service',
    severity: 'critical',
    source: 'prometheus',
    attributedTo: 'Bob Wilson',
    attributionMethod: 'manual_assignment',
    status: 'resolved',
    createdAt: '2025-12-07T22:10:00Z',
    updatedAt: '2025-12-08T06:30:00Z',
  },
]

const severityColors = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

const statusIcons = {
  open: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  attributed: <UserCheck className="w-4 h-4 text-blue-500" />,
  disputed: <XCircle className="w-4 h-4 text-orange-500" />,
  resolved: <CheckCircle className="w-4 h-4 text-green-500" />,
}

export default function IncidentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleAssign = (id: string) => {
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'attributed' as const } : i)))
  }

  const handleView = (id: string) => {
    setSelectedId(selectedId === id ? null : id)
  }

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.service.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const unattributedCount = incidents.filter((i) => i.status === 'open').length
  const attributedCount = incidents.filter((i) => i.status === 'attributed').length
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Incident Attribution
        </h1>
        <p className="mt-1 text-secondary-600 dark:text-secondary-400">
          Manage and review system incident attributions from Firebase Crashlytics and Prometheus
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Unattributed
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {unattributedCount}
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
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Attributed
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {attributedCount}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {resolvedCount}
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
                  Auto-Attribution Rate
                </p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  75%
                </p>
              </div>
              <Clock className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <Input
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-secondary-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Unattributed</option>
                <option value="attributed">Attributed</option>
                <option value="disputed">Disputed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className="py-4 flex items-center justify-between hover:bg-secondary-50 dark:hover:bg-secondary-800/50 -mx-4 px-4 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{statusIcons[incident.status]}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-secondary-900 dark:text-white">
                        {incident.title}
                      </span>
                      <span
                        className={clsx(
                          'px-2 py-0.5 text-xs rounded-full',
                          severityColors[incident.severity]
                        )}
                      >
                        {incident.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                      <span className="flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        {incident.service}
                      </span>
                      <span>
                        Source: {incident.source === 'firebase' ? 'Firebase' : 'Prometheus'}
                      </span>
                      {incident.attributedTo && (
                        <span className="flex items-center gap-1">
                          <GitCommit className="w-3 h-3" />
                          {incident.attributionMethod?.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {incident.attributedTo ? (
                    <span className="text-sm text-secondary-600 dark:text-secondary-300">
                      {incident.attributedTo}
                    </span>
                  ) : (
                    <Button size="sm" variant="primary" onClick={() => handleAssign(incident.id)}>
                      Assign
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleView(incident.id)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
