import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Mock data based on US01 - Employee Profile Management
const mockEmployees = [
  { id: 'EMP001', name: 'John Smith', email: 'john.smith@company.com', department: 'Engineering', role: 'Senior Developer', status: 'Active' },
  { id: 'EMP002', name: 'Jane Doe', email: 'jane.doe@company.com', department: 'Product', role: 'Product Manager', status: 'Active' },
  { id: 'EMP003', name: 'Bob Johnson', email: 'bob.johnson@company.com', department: 'Engineering', role: 'Tech Lead', status: 'Active' },
  { id: 'EMP004', name: 'Alice Williams', email: 'alice.williams@company.com', department: 'Design', role: 'UX Designer', status: 'On Leave' },
  { id: 'EMP005', name: 'Charlie Brown', email: 'charlie.brown@company.com', department: 'Engineering', role: 'Junior Developer', status: 'Active' },
]

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [employees] = useState(mockEmployees)

  const handleAddEmployee = () => {
    // Open add employee modal - implementation pending
  }

  const handleOpenFilters = () => {
    // Open filters panel - implementation pending
  }

  const handleEmployeeActions = (employeeId: string) => {
    // Open actions dropdown for employee - implementation pending
    void employeeId
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Employees</h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Manage employee profiles and information
          </p>
        </div>
        <Button onClick={handleAddEmployee}>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={handleOpenFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 dark:bg-secondary-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/employees/${employee.id}`} className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-medium">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-secondary-900 dark:text-white">
                          {employee.name}
                        </div>
                        <div className="text-sm text-secondary-500 dark:text-secondary-400">
                          {employee.email}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-400">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600 dark:text-secondary-400">
                    {employee.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        employee.status === 'Active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEmployeeActions(employee.id)}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
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
