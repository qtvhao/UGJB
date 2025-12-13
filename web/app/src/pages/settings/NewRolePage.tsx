import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Save, Shield } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const availablePermissions = [
  { id: 'read', name: 'Read', description: 'View data and dashboards', category: 'Basic' },
  { id: 'write', name: 'Write', description: 'Create and edit data', category: 'Basic' },
  { id: 'delete', name: 'Delete', description: 'Remove data permanently', category: 'Destructive' },
  { id: 'admin', name: 'Admin', description: 'Full system administration', category: 'Administrative' },
  { id: 'manage_users', name: 'Manage Users', description: 'Create and modify user accounts', category: 'Administrative' },
  { id: 'manage_roles', name: 'Manage Roles', description: 'Create and modify roles', category: 'Administrative' },
  { id: 'view_audit', name: 'View Audit Log', description: 'Access security audit logs', category: 'Security' },
  { id: 'manage_integrations', name: 'Manage Integrations', description: 'Configure external integrations', category: 'Administrative' },
]

export default function NewRolePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would call an API
    console.log('Creating role:', formData)
    navigate('/settings')
  }

  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, typeof availablePermissions>)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Create New Role
          </h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Define a new role with specific permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Role Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Project Manager, Team Lead"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the role's purpose..."
                rows={2}
                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {permissions.map((perm) => (
                      <label
                        key={perm.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.permissions.includes(perm.id)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id)}
                            onChange={() => handlePermissionToggle(perm.id)}
                            className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                          />
                          <div>
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {perm.name}
                            </p>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                        {perm.id === 'admin' && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                            Elevated
                          </span>
                        )}
                        {perm.id === 'delete' && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                            Caution
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {formData.permissions.includes('admin') && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> Admin permission grants full system access.
                  Only assign this to trusted administrators.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/settings')}>
            Cancel
          </Button>
          <Button type="submit" disabled={formData.permissions.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </div>
      </form>
    </div>
  )
}
