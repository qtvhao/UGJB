import { useState } from 'react'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Mock data based on US03 - Workforce Assignment Tracking
const mockAssignments = [
  { id: 1, employee: 'John Smith', project: 'UGJB Platform', allocation: 60, role: 'Lead Developer', startDate: '2024-01-01', endDate: null },
  { id: 2, employee: 'John Smith', project: 'Mobile App', allocation: 40, role: 'Consultant', startDate: '2024-06-01', endDate: null },
  { id: 3, employee: 'Jane Doe', project: 'UGJB Platform', allocation: 100, role: 'Product Manager', startDate: '2024-01-01', endDate: null },
  { id: 4, employee: 'Bob Johnson', project: 'Infrastructure', allocation: 50, role: 'Tech Lead', startDate: '2024-03-01', endDate: null },
  { id: 5, employee: 'Bob Johnson', project: 'UGJB Platform', allocation: 50, role: 'Architect', startDate: '2024-01-01', endDate: null },
  { id: 6, employee: 'Alice Williams', project: 'Mobile App', allocation: 80, role: 'UX Designer', startDate: '2024-04-01', endDate: null },
]

// Employees with over-allocation (>100%)
const overAllocatedEmployees = [
  { name: 'Charlie Brown', totalAllocation: 120, projects: ['UGJB Platform (70%)', 'Mobile App (50%)'] },
]

export default function WorkforceAssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleNewAssignment = () => {
    // Open new assignment modal - implementation pending
  }

  const handleResolveOverallocation = () => {
    // Navigate to allocation resolution - implementation pending
  }

  const filteredAssignments = mockAssignments.filter(
    (a) =>
      a.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.project.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <Button onClick={handleNewAssignment}>
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
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
              <Button size="sm" variant="danger" onClick={handleResolveOverallocation}>
                Resolve
              </Button>
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
