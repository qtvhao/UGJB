import { useState, useEffect } from 'react'
import { Code2, GitBranch, Clock, AlertTriangle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { analyticsApi } from '@/lib/api'

interface DoraMetrics {
  deploymentFrequency: { value: number; unit: string; trend: string; status: string }
  leadTime: { value: number; unit: string; trend: string; status: string }
  changeFailureRate: { value: number; unit: string; trend: string; status: string }
  mttr: { value: number; unit: string; trend: string; status: string }
}

interface Deployment {
  id: number
  service: string
  version: string
  environment: string
  status: string
  timestamp: string
}

interface CodeQualityMetric {
  name: string
  value: number
  target: number
  unit: string
}

interface TeamMetric {
  team: string
  commits: number
  prs: number
  deployments: number
}

function getStatusColor(status: string) {
  switch (status) {
    case 'elite':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
    case 'high':
      return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
    default:
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
  }
}

export default function EngineeringMetricsPage() {
  const [doraMetrics, setDoraMetrics] = useState<DoraMetrics | null>(null)
  const [recentDeployments, setRecentDeployments] = useState<Deployment[]>([])
  const [codeQualityMetrics, setCodeQualityMetrics] = useState<CodeQualityMetric[]>([])
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        const [doraRes, deploymentsRes, codeQualityRes] = await Promise.allSettled([
          analyticsApi.metrics.dora(),
          analyticsApi.metrics.deployments(),
          analyticsApi.metrics.codeQuality(),
        ])

        if (doraRes.status === 'fulfilled' && doraRes.value.data) {
          setDoraMetrics(doraRes.value.data)
        }
        if (deploymentsRes.status === 'fulfilled' && deploymentsRes.value.data) {
          const data = deploymentsRes.value.data
          setRecentDeployments(data.recentDeployments || [])
          setTeamMetrics(data.teamMetrics || [])
        }
        if (codeQualityRes.status === 'fulfilled' && codeQualityRes.value.data) {
          setCodeQualityMetrics(codeQualityRes.value.data)
        }
      } catch {
        // Keep empty state on error
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Engineering Metrics
        </h1>
        <p className="mt-1 text-secondary-600 dark:text-secondary-400">
          DORA metrics and engineering performance analytics
        </p>
      </div>

      {/* DORA Metrics */}
      {doraMetrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                  <GitBranch className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doraMetrics.deploymentFrequency.status)}`}>
                  {doraMetrics.deploymentFrequency.status}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Deployment Frequency
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {doraMetrics.deploymentFrequency.value}
                  <span className="text-sm font-normal text-secondary-500 dark:text-secondary-400 ml-1">
                    {doraMetrics.deploymentFrequency.unit}
                  </span>
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  {doraMetrics.deploymentFrequency.trend}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doraMetrics.leadTime.status)}`}>
                  {doraMetrics.leadTime.status}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Lead Time</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {doraMetrics.leadTime.value}
                  <span className="text-sm font-normal text-secondary-500 dark:text-secondary-400 ml-1">
                    {doraMetrics.leadTime.unit}
                  </span>
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4" />
                  {doraMetrics.leadTime.trend}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doraMetrics.changeFailureRate.status)}`}>
                  {doraMetrics.changeFailureRate.status}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Change Failure Rate
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {doraMetrics.changeFailureRate.value}
                  <span className="text-sm font-normal text-secondary-500 dark:text-secondary-400 ml-1">
                    {doraMetrics.changeFailureRate.unit}
                  </span>
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4" />
                  {doraMetrics.changeFailureRate.trend}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <Code2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doraMetrics.mttr.status)}`}>
                  {doraMetrics.mttr.status}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-secondary-500 dark:text-secondary-400">MTTR</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {doraMetrics.mttr.value}
                  <span className="text-sm font-normal text-secondary-500 dark:text-secondary-400 ml-1">
                    {doraMetrics.mttr.unit}
                  </span>
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4" />
                  {doraMetrics.mttr.trend}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-secondary-500">
            No DORA metrics available. Connect your engineering tools to see metrics.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deployments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeployments.length > 0 ? (
              <div className="space-y-3">
                {recentDeployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {deployment.service}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {deployment.version} to {deployment.environment}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          deployment.status === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {deployment.status}
                      </span>
                      <p className="text-xs text-secondary-400 mt-1">
                        {new Date(deployment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-secondary-500 py-4">No recent deployments</p>
            )}
          </CardContent>
        </Card>

        {/* Code Quality */}
        <Card>
          <CardHeader>
            <CardTitle>Code Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {codeQualityMetrics.length > 0 ? (
              <div className="space-y-4">
                {codeQualityMetrics.map((metric) => (
                  <div key={metric.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-secondary-900 dark:text-white">
                        {metric.name}
                      </span>
                      <span className="text-sm text-secondary-500 dark:text-secondary-400">
                        {metric.value}
                        {metric.unit} / {metric.target}
                        {metric.unit}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-secondary-500 py-4">No code quality metrics available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Team Engineering Output</CardTitle>
        </CardHeader>
        <CardContent>
          {teamMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200 dark:border-secondary-700">
                    <th className="text-left py-3 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                      Team
                    </th>
                    <th className="text-right py-3 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                      Commits
                    </th>
                    <th className="text-right py-3 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                      Pull Requests
                    </th>
                    <th className="text-right py-3 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                      Deployments
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamMetrics.map((team) => (
                    <tr
                      key={team.team}
                      className="border-b border-secondary-100 dark:border-secondary-800"
                    >
                      <td className="py-3 font-medium text-secondary-900 dark:text-white">
                        {team.team}
                      </td>
                      <td className="py-3 text-right text-secondary-600 dark:text-secondary-400">
                        {team.commits}
                      </td>
                      <td className="py-3 text-right text-secondary-600 dark:text-secondary-400">
                        {team.prs}
                      </td>
                      <td className="py-3 text-right text-secondary-600 dark:text-secondary-400">
                        {team.deployments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-secondary-500 py-4">No team metrics available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
