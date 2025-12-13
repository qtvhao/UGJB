import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Check, X, Clock, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { hrApi } from '@/lib/api'

interface PendingSkill {
  id: number
  name: string
  category: string
  description?: string
  submittedBy: string
  submittedAt: string
}

export default function PendingSkillsPage() {
  const navigate = useNavigate()
  const [pendingSkills, setPendingSkills] = useState<PendingSkill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hrApi.skills.pending()
      .then((res) => setPendingSkills(res.data))
      .catch((err) => console.error('Failed to fetch pending skills:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = (skillId: number) => {
    hrApi.skills.approve(String(skillId))
      .then(() => setPendingSkills(pendingSkills.filter((s) => s.id !== skillId)))
      .catch((err) => console.error('Failed to approve skill:', err))
  }

  const handleReject = (skillId: number) => {
    hrApi.skills.reject(String(skillId))
      .then(() => setPendingSkills(pendingSkills.filter((s) => s.id !== skillId)))
      .catch((err) => console.error('Failed to reject skill:', err))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (pendingSkills.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/skills')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Pending Skills Review
          </h1>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
              All Caught Up!
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400">
              There are no pending skills waiting for approval.
            </p>
            <Button className="mt-4" onClick={() => navigate('/skills')}>
              Return to Skills Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/skills')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Pending Skills Review
          </h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Review and approve new skills submitted by team members
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            {pendingSkills.length} Skills Pending Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-secondary-900 dark:text-white">
                        {skill.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 rounded">
                        {skill.category}
                      </span>
                    </div>
                    {skill.description && (
                      <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                        {skill.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-secondary-500 dark:text-secondary-500">
                      Submitted by {skill.submittedBy} on{' '}
                      {new Date(skill.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(skill.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(skill.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
