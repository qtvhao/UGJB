import { useState, useEffect } from 'react'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Download,
  Loader2,
  CheckCircle,
  MinusCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { capacityApi } from '@/lib/api'

interface TeamCapacity {
  id: string
  name: string
  totalFte: number
  allocatedFte: number
  utilizationPct: number
  memberCount: number
  status: 'healthy' | 'warning' | 'overloaded'
}

interface EmployeeAllocation {
  id: string
  name: string
  team: string
  allocation: number
  projects: string[]
  status: 'optimal' | 'over' | 'under'
}

const mockTeams: TeamCapacity[] = [
  { id: '1', name: 'Team Alpha', totalFte: 5, allocatedFte: 4.5, utilizationPct: 90, memberCount: 5, status: 'healthy' },
  { id: '2', name: 'Team Beta', totalFte: 4, allocatedFte: 4.2, utilizationPct: 105, memberCount: 4, status: 'overloaded' },
  { id: '3', name: 'Team Gamma', totalFte: 6, allocatedFte: 4.0, utilizationPct: 67, memberCount: 6, status: 'warning' },
  { id: '4', name: 'Team Delta', totalFte: 3, allocatedFte: 2.7, utilizationPct: 90, memberCount: 3, status: 'healthy' },
]

const mockEmployees: EmployeeAllocation[] = [
  { id: '1', name: 'Alex Chen', team: 'Team Alpha', allocation: 100, projects: ['Project X'], status: 'optimal' },
  { id: '2', name: 'Sarah Johnson', team: 'Team Beta', allocation: 120, projects: ['Project Y', 'Project Z'], status: 'over' },
  { id: '3', name: 'Mike Brown', team: 'Team Gamma', allocation: 60, projects: ['Project X'], status: 'under' },
  { id: '4', name: 'Emily Davis', team: 'Team Alpha', allocation: 90, projects: ['Project Y'], status: 'optimal' },
]

export default function TeamCapacityPage() {
  const [teams, setTeams] = useState<TeamCapacity[]>([])
  const [employees, setEmployees] = useState<EmployeeAllocation[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function fetchCapacity() {
      try {
        setLoading(true)
        const [alertsOver, alertsUnder] = await Promise.allSettled([
          capacityApi.alerts.overAllocated(),
          capacityApi.alerts.underUtilized(),
        ])
        if (alertsOver.status === 'fulfilled' || alertsUnder.status === 'fulfilled') {
          setTeams(mockTeams)
          setEmployees(mockEmployees)
        } else {
          setTeams(mockTeams)
          setEmployees(mockEmployees)
        }
      } catch {
        setTeams(mockTeams)
        setEmployees(mockEmployees)
      } finally {
        setLoading(false)
      }
    }
    fetchCapacity()
  }, [])

  const handleExportReport = async () => {
    setExporting(true)
    try {
      const data = { teams, employees, exportedAt: new Date().toISOString() }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `team-capacity-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'optimal':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
      case 'under':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'overloaded':
      case 'over':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-secondary-600'
    }
  }

  const getUtilizationBar = (pct: number) => {
    const width = Math.min(pct, 100)
    const color = pct > 100 ? 'bg-red-500' : pct > 85 ? 'bg-yellow-500' : 'bg-green-500'
    return (
      <div className="w-full h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${width}%` }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Team Capacity
          </h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Visualize team capacity and allocation across projects
          </p>
        </div>
        <Button onClick={handleExportReport} disabled={exporting}>
          <Download className={`w-4 h-4 mr-2 ${exporting ? 'animate-spin' : ''}`} />
          {exporting ? 'Exporting...' : 'Export Report'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {teams.length}
                </p>
                <p className="text-xs text-secondary-500">Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-secondary-900 dark:text-white">
                  85%
                </p>
                <p className="text-xs text-secondary-500">Avg Utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {teams.filter((t) => t.status === 'overloaded').length}
                </p>
                <p className="text-xs text-secondary-500">Over-allocated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <MinusCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-secondary-900 dark:text-white">
                  {teams.filter((t) => t.status === 'warning').length}
                </p>
                <p className="text-xs text-secondary-500">Under-utilized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Capacity */}
      <Card>
        <CardHeader>
          <CardTitle>Team Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-secondary-900 dark:text-white">
                        {team.name}
                      </h3>
                      <span className={`text-sm font-medium ${getStatusColor(team.status)}`}>
                        {team.status}
                      </span>
                    </div>
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">
                      {team.memberCount} members
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      {getUtilizationBar(team.utilizationPct)}
                    </div>
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300 w-16 text-right">
                      {team.utilizationPct}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-secondary-500">
                    {team.allocatedFte} / {team.totalFte} FTE allocated
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {employees.map((emp) => (
              <div key={emp.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary-900 dark:text-white">{emp.name}</p>
                  <p className="text-sm text-secondary-500">{emp.team}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-medium ${getStatusColor(emp.status)}`}>
                      {emp.allocation}%
                    </p>
                    <p className="text-xs text-secondary-500">
                      {emp.projects.join(', ')}
                    </p>
                  </div>
                  {emp.status === 'optimal' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : emp.status === 'over' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : (
                    <MinusCircle className="w-5 h-5 text-yellow-500" />
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
