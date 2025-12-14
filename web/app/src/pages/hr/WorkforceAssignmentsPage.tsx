import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Plus, Search, AlertTriangle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { hrApi } from '@/lib/api'

interface Assignment {
  id: number
  employee: string
  project: string
  allocation: number
  role: string
  startDate: string
  endDate: string | null
}

interface OverAllocatedEmployee {
  name: string
  totalAllocation: number
  projects: string[]
}

export default function WorkforceAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [overAllocatedEmployees, setOverAllocatedEmployees] = useState<OverAllocatedEmployee[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      hrApi.assignments.list(),
      hrApi.assignments.overAllocated(),
    ])
      .then(([assignmentsRes, overAllocatedRes]) => {
        setAssignments(assignmentsRes.data)
        setOverAllocatedEmployees(overAllocatedRes.data)
      })
      .catch((err) => console.error('Failed to fetch assignments:', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredAssignments = assignments.filter(
    (a) =>
      a.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.project.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Workforce Assignments
          </h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Track employee allocations across projects
          </p>
        </div>
        <Link to="/assignments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        </Link>
      </div>

      {/* Over-allocation Warning */}
      {overAllocatedEmployees.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-200">
                  Over-allocation detected
                </p>
                {overAllocatedEmployees.map((emp) => (
                  <p key={emp.name} className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {emp.name}: {emp.totalAllocation}% allocated ({emp.projects.join(', ')})
                  </p>
                ))}
              </div>
              <Link to="/assignments/overallocation">
                <Button size="sm" variant="danger">
                  Resolve
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <Input
              type="text"
              placeholder="Search by employee or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 dark:bg-secondary-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Allocation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Start Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {filteredAssignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900 dark:text-white">
                    {assignment.employee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-400">
                    {assignment.project}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-400">
                    {assignment.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${assignment.allocation}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-secondary-900 dark:text-white">
                        {assignment.allocation}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-400">
                    {new Date(assignment.startDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
