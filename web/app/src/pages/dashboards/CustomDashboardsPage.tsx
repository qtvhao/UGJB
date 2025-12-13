import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  LayoutGrid,
  Plus,
  BarChart3,
  LineChart,
  Gauge,
  Grid3X3,
  Loader2,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { dashboardsApi } from '@/lib/api'

interface Dashboard {
  id: string
  name: string
  targetAudience: 'executive' | 'team' | 'individual'
  dataSources: string[]
  widgetCount: number
  refreshInterval: string
  lastUpdated: string
}

export default function CustomDashboardsPage() {
  const navigate = useNavigate()
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboards() {
      try {
        setLoading(true)
        const response = await dashboardsApi.list()
        if (response.data && Array.isArray(response.data)) {
          setDashboards(response.data)
        }
      } catch {
        // Keep empty state on error
      } finally {
        setLoading(false)
      }
    }
    fetchDashboards()
  }, [])

  const handleCreateDashboard = () => {
    navigate('/dashboards/new')
  }

  const handleViewDashboard = (dashboardId: string) => {
    navigate(`/dashboards/${dashboardId}`)
  }

  const handleEditDashboard = (dashboardId: string) => {
    navigate(`/dashboards/${dashboardId}/edit`)
  }

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      try {
        await dashboardsApi.delete(dashboardId)
        setDashboards(dashboards.filter(d => d.id !== dashboardId))
      } catch {
        // Keep current state on error
      }
    }
  }

  const getAudienceBadge = (audience: string) => {
    const styles: Record<string, string> = {
      executive: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      team: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      individual: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[audience]}`}>
        {audience.charAt(0).toUpperCase() + audience.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Custom Dashboards
          </h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Create and manage KPI dashboards for different audiences
          </p>
        </div>
        <Button onClick={handleCreateDashboard}>
          <Plus className="w-4 h-4 mr-2" />
          Create Dashboard
        </Button>
      </div>

      {/* Visualization Types */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary-500 transition-colors">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 mx-auto text-primary-600 dark:text-primary-400" />
            <p className="mt-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Bar Chart
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary-500 transition-colors">
          <CardContent className="p-4 text-center">
            <LineChart className="w-8 h-8 mx-auto text-primary-600 dark:text-primary-400" />
            <p className="mt-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Line Chart
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary-500 transition-colors">
          <CardContent className="p-4 text-center">
            <Gauge className="w-8 h-8 mx-auto text-primary-600 dark:text-primary-400" />
            <p className="mt-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Gauge
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary-500 transition-colors">
          <CardContent className="p-4 text-center">
            <Grid3X3 className="w-8 h-8 mx-auto text-primary-600 dark:text-primary-400" />
            <p className="mt-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Heatmap
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboards List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Your Dashboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : dashboards.length > 0 ? (
            <div className="space-y-4">
              {dashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-secondary-900 dark:text-white">
                          {dashboard.name}
                        </h3>
                        {getAudienceBadge(dashboard.targetAudience)}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {dashboard.dataSources.map((source) => (
                          <span
                            key={source}
                            className="px-2 py-0.5 text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 rounded"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                        {dashboard.widgetCount} widgets • {dashboard.refreshInterval} refresh • Updated {dashboard.lastUpdated}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDashboard(dashboard.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditDashboard(dashboard.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteDashboard(dashboard.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <LayoutGrid className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-500">No dashboards created yet</p>
              <Button onClick={handleCreateDashboard} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
