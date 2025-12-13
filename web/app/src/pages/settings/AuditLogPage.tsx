import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Search, Filter, Download, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Mock audit log data
const allAuditLogs = [
  { id: 1, action: 'User login', user: 'john.smith@company.com', timestamp: '2024-01-15T14:30:00Z', ip: '192.168.1.100', details: 'Successful login via SSO' },
  { id: 2, action: 'Role updated', user: 'admin@company.com', timestamp: '2024-01-15T12:15:00Z', ip: '192.168.1.50', details: 'Modified Manager role permissions' },
  { id: 3, action: 'Integration connected', user: 'admin@company.com', timestamp: '2024-01-15T10:00:00Z', ip: '192.168.1.50', details: 'Connected GitLab integration' },
  { id: 4, action: 'Employee created', user: 'hr@company.com', timestamp: '2024-01-14T16:45:00Z', ip: '192.168.1.75', details: 'Created employee: Alice Johnson' },
  { id: 5, action: 'User logout', user: 'jane.doe@company.com', timestamp: '2024-01-14T15:30:00Z', ip: '192.168.1.120', details: 'Manual logout' },
  { id: 6, action: 'Password changed', user: 'bob.wilson@company.com', timestamp: '2024-01-14T14:00:00Z', ip: '192.168.1.90', details: 'User changed their password' },
  { id: 7, action: 'Permission denied', user: 'viewer@company.com', timestamp: '2024-01-14T11:20:00Z', ip: '192.168.1.200', details: 'Attempted to access admin panel' },
  { id: 8, action: 'Employee updated', user: 'hr@company.com', timestamp: '2024-01-14T10:30:00Z', ip: '192.168.1.75', details: 'Updated skills for John Smith' },
  { id: 9, action: 'API key generated', user: 'admin@company.com', timestamp: '2024-01-13T16:00:00Z', ip: '192.168.1.50', details: 'New API key for automation' },
  { id: 10, action: 'User login failed', user: 'unknown@external.com', timestamp: '2024-01-13T09:45:00Z', ip: '203.45.67.89', details: 'Invalid credentials - 3 attempts' },
  { id: 11, action: 'Settings changed', user: 'admin@company.com', timestamp: '2024-01-12T14:15:00Z', ip: '192.168.1.50', details: 'Enabled IP whitelist' },
  { id: 12, action: 'Role created', user: 'admin@company.com', timestamp: '2024-01-12T11:00:00Z', ip: '192.168.1.50', details: 'Created Team Lead role' },
]

const actionTypes = ['All', 'User login', 'User logout', 'Role updated', 'Role created', 'Employee created', 'Employee updated', 'Permission denied', 'Settings changed']

export default function AuditLogPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState('All')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const filteredLogs = allAuditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = selectedAction === 'All' || log.action === selectedAction
    return matchesSearch && matchesAction
  })

  const handleExport = () => {
    // In a real app, this would generate and download a CSV/JSON file
    console.log('Exporting audit logs:', filteredLogs)
    alert('Audit log export started. You will receive the file shortly.')
  }

  const getActionColor = (action: string) => {
    if (action.includes('failed') || action.includes('denied')) {
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
    }
    if (action.includes('created') || action.includes('connected')) {
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    }
    if (action.includes('updated') || action.includes('changed')) {
      return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
    }
    return 'text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Audit Log
            </h1>
            <p className="mt-1 text-secondary-600 dark:text-secondary-400">
              Complete history of system activities and security events
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <Input
                  type="text"
                  placeholder="Search by user, action, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-secondary-400" />
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {actionTypes.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-40"
              />
              <span className="text-secondary-500">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Activity Log ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200 dark:border-secondary-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                    IP Address
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-secondary-100 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
                  >
                    <td className="py-3 px-4 text-sm text-secondary-600 dark:text-secondary-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-900 dark:text-white">
                      {log.user}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-secondary-600 dark:text-secondary-400">
                      {log.ip}
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600 dark:text-secondary-400 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-secondary-500 dark:text-secondary-400">
              No audit log entries match your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
