import { useState } from 'react'
import { Link } from 'react-router'
import { Shield, Users, Key, Database, Lock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Mock data based on US06 - Role-Based Access Control
const roles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full system access',
    permissions: ['read', 'write', 'delete', 'admin'],
    userCount: 3,
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Team management and reporting',
    permissions: ['read', 'write'],
    userCount: 12,
  },
  {
    id: 3,
    name: 'Developer',
    description: 'Engineering metrics access',
    permissions: ['read'],
    userCount: 85,
  },
  {
    id: 4,
    name: 'HR',
    description: 'Employee and skills management',
    permissions: ['read', 'write'],
    userCount: 8,
  },
  {
    id: 5,
    name: 'Viewer',
    description: 'Read-only dashboard access',
    permissions: ['read'],
    userCount: 48,
  },
]

const securitySettings = [
  { name: 'Two-Factor Authentication', enabled: true, description: 'Require 2FA for all users' },
  { name: 'Session Timeout', enabled: true, description: '30 minutes of inactivity' },
  { name: 'IP Whitelist', enabled: false, description: 'Restrict access to specific IPs' },
  { name: 'SSO Integration', enabled: true, description: 'SAML 2.0 with Okta' },
]

const auditLogs = [
  { id: 1, action: 'User login', user: 'john.smith@company.com', timestamp: '2024-01-15T14:30:00Z', ip: '192.168.1.100' },
  { id: 2, action: 'Role updated', user: 'admin@company.com', timestamp: '2024-01-15T12:15:00Z', ip: '192.168.1.50' },
  { id: 3, action: 'Integration connected', user: 'admin@company.com', timestamp: '2024-01-15T10:00:00Z', ip: '192.168.1.50' },
  { id: 4, action: 'Employee created', user: 'hr@company.com', timestamp: '2024-01-14T16:45:00Z', ip: '192.168.1.75' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'security' | 'audit'>('roles')
  const [securityStates, setSecurityStates] = useState<Record<string, boolean>>(
    Object.fromEntries(securitySettings.map(s => [s.name, s.enabled]))
  )

  const handleSecurityToggle = (settingName: string) => {
    setSecurityStates(prev => ({ ...prev, [settingName]: !prev[settingName] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-secondary-600 dark:text-secondary-400">
          Manage access control, security, and system configuration
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-secondary-200 dark:border-secondary-700">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Roles & Permissions
          </div>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </div>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Audit Log
          </div>
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link to="/settings/roles/new">
              <Button>
                <Key className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="hover:border-primary-500 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-white">
                        {role.name}
                      </h3>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {role.description}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-secondary-100 dark:bg-secondary-700 rounded">
                      {role.userCount} users
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    {role.permissions.map((perm) => (
                      <span
                        key={perm}
                        className={`text-xs px-2 py-0.5 rounded ${
                          perm === 'admin'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : perm === 'delete'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : perm === 'write'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securitySettings.map((setting) => (
                <div
                  key={setting.name}
                  className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-secondary-900 dark:text-white">{setting.name}</p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      {setting.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={securityStates[setting.name]}
                      onChange={() => handleSecurityToggle(setting.name)}
                    />
                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200 dark:border-secondary-700">
                    <th className="text-left py-3 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                      Action
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                      User
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                      IP Address
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-secondary-500 dark:text-secondary-400">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-secondary-100 dark:border-secondary-800"
                    >
                      <td className="py-3 text-secondary-900 dark:text-white">{log.action}</td>
                      <td className="py-3 text-secondary-600 dark:text-secondary-400">{log.user}</td>
                      <td className="py-3 text-secondary-600 dark:text-secondary-400">{log.ip}</td>
                      <td className="py-3 text-secondary-600 dark:text-secondary-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-center">
              <Link to="/settings/audit-log">
                <Button variant="outline">Load More</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
