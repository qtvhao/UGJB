import { Users, TrendingUp, AlertTriangle, Target } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

// Mock data based on US07 - Workforce Planning Dashboard
const workforceMetrics = {
  totalHeadcount: 156,
  activeProjects: 24,
  avgUtilization: 82,
  burnoutRiskCount: 3,
}

const departmentAllocation = [
  { name: 'Engineering', headcount: 85, utilization: 88 },
  { name: 'Product', headcount: 22, utilization: 75 },
  { name: 'Design', headcount: 18, utilization: 82 },
  { name: 'QA', headcount: 15, utilization: 78 },
  { name: 'DevOps', headcount: 16, utilization: 90 },
]

const burnoutRiskEmployees = [
  { name: 'Sarah Connor', department: 'Engineering', riskScore: 85, factors: ['High overtime', 'Multiple projects'] },
  { name: 'Mike Ross', department: 'DevOps', riskScore: 78, factors: ['On-call fatigue', 'High workload'] },
  { name: 'Lisa Chen', department: 'Engineering', riskScore: 72, factors: ['Sprint overload', 'Technical debt'] },
]

const capacityForecast = [
  { month: 'Jan', demand: 145, capacity: 156 },
  { month: 'Feb', demand: 152, capacity: 156 },
  { month: 'Mar', demand: 168, capacity: 160 },
  { month: 'Apr', demand: 175, capacity: 165 },
]

export default function WorkforcePlanningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Workforce Planning</h1>
        <p className="mt-1 text-secondary-600 dark:text-secondary-400">
          Strategic workforce analytics and capacity planning
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Headcount</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {workforceMetrics.totalHeadcount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Active Projects</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {workforceMetrics.activeProjects}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Avg Utilization</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {workforceMetrics.avgUtilization}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Burnout Risk</p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {workforceMetrics.burnoutRiskCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Department Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentAllocation.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-secondary-900 dark:text-white">
                      {dept.name}
                    </span>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">
                      {dept.headcount} people ({dept.utilization}% utilized)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dept.utilization > 85
                          ? 'bg-red-500'
                          : dept.utilization > 70
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                      style={{ width: `${dept.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Capacity Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Capacity Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {capacityForecast.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <span className="w-12 text-sm font-medium text-secondary-900 dark:text-white">
                    {item.month}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-secondary-500 dark:text-secondary-400">
                        Demand: {item.demand}
                      </span>
                      <span className="text-xs text-secondary-500 dark:text-secondary-400">
                        Capacity: {item.capacity}
                      </span>
                    </div>
                    <div className="relative h-4 bg-secondary-200 dark:bg-secondary-700 rounded">
                      <div
                        className="absolute h-full bg-blue-500 rounded"
                        style={{ width: `${(item.capacity / 200) * 100}%` }}
                      />
                      <div
                        className={`absolute h-full rounded ${
                          item.demand > item.capacity ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(item.demand / 200) * 100}%`, opacity: 0.7 }}
                      />
                    </div>
                  </div>
                  {item.demand > item.capacity && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Burnout Risk Alert */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Burnout Risk Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {burnoutRiskEmployees.map((emp) => (
              <div
                key={emp.name}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <div>
                  <p className="font-medium text-secondary-900 dark:text-white">{emp.name}</p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {emp.department}
                  </p>
                  <div className="mt-1 flex gap-2">
                    {emp.factors.map((factor) => (
                      <span
                        key={factor}
                        className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {emp.riskScore}%
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">Risk Score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
