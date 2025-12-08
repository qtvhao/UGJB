import { useState } from 'react'
import { Plus, Search, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// Mock data based on US02 - Skills Inventory Management
const mockSkills = [
  { id: 1, name: 'React', category: 'Frontend', employeeCount: 45, status: 'Approved' },
  { id: 2, name: 'TypeScript', category: 'Language', employeeCount: 52, status: 'Approved' },
  { id: 3, name: 'Python', category: 'Language', employeeCount: 38, status: 'Approved' },
  { id: 4, name: 'Kubernetes', category: 'DevOps', employeeCount: 15, status: 'Approved' },
  { id: 5, name: 'GraphQL', category: 'API', employeeCount: 22, status: 'Approved' },
  { id: 6, name: 'Rust', category: 'Language', employeeCount: 5, status: 'Pending' },
  { id: 7, name: 'WebAssembly', category: 'Runtime', employeeCount: 3, status: 'Pending' },
]

const categories = ['All', 'Frontend', 'Backend', 'Language', 'DevOps', 'API', 'Runtime']

export default function SkillsInventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const handleAddSkill = () => {
    // Open add skill modal - implementation pending
  }

  const handleReviewPending = () => {
    // Navigate to pending skills review - implementation pending
  }

  const filteredSkills = mockSkills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const pendingSkills = mockSkills.filter((s) => s.status === 'Pending')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Skills Inventory</h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Manage organizational skills taxonomy
          </p>
        </div>
        <Button onClick={handleAddSkill}>
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Pending Approvals Alert */}
      {pendingSkills.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {pendingSkills.length} skills pending approval
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Review and approve new skills added by team members
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleReviewPending}>
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <Input
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => (
          <Card key={skill.id} className="hover:border-primary-500 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-secondary-900 dark:text-white">{skill.name}</h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {skill.category}
                  </p>
                </div>
                {skill.status === 'Approved' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : skill.status === 'Pending' ? (
                  <Clock className="w-5 h-5 text-yellow-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-500 dark:text-secondary-400">Employees</span>
                  <span className="font-medium text-secondary-900 dark:text-white">
                    {skill.employeeCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
