import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { automationApi } from '@/lib/api'

interface AutomationRule {
  id: string
  name: string
  conditionType: string
  metric: string
  operator: string
  value: number
  action: string
  status: 'active' | 'inactive' | 'testing'
  lastTriggered?: string
  executionCount: number
}

export default function AutomationRulesPage() {
  const navigate = useNavigate()
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [triggeredToday, setTriggeredToday] = useState(0)

  useEffect(() => {
    async function fetchRules() {
      try {
        setLoading(true)
        const response = await automationApi.rules.list()
        if (response.data && Array.isArray(response.data)) {
          setRules(response.data)
          setTriggeredToday(response.data.filter((r: AutomationRule) => r.lastTriggered?.includes('hour') || r.lastTriggered?.includes('min')).length)
        }
      } catch {
        // Keep empty state on error
      } finally {
        setLoading(false)
      }
    }
    fetchRules()
  }, [])

  const handleCreateRule = () => {
    navigate('/automation/new')
  }

  const handleConfigureRule = (ruleId: string) => {
    navigate(`/automation/${ruleId}/settings`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'inactive':
        return <Pause className="w-5 h-5 text-secondary-400" />
      case 'testing':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getActionLabel = (action: string) => {
    const actions: Record<string, string> = {
      skill_gap_analysis: 'Trigger Skill Gap Analysis',
      root_cause_analysis: 'Trigger Root Cause Analysis',
      resource_reallocation: 'Resource Reallocation',
      notification: 'Send Notification',
    }
    return actions[action] || action
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Automation Rules
          </h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Configure no-code automation rules for performance-based workflows
          </p>
        </div>
        <Button onClick={handleCreateRule}>
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {rules.filter((r) => r.status === 'active').length}
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Active Rules
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {rules.reduce((sum, r) => sum + r.executionCount, 0)}
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Total Executions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-secondary-900 dark:text-white">
                  {triggeredToday}
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Triggered Today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : rules.length > 0 ? (
            <div className="divide-y divide-secondary-200 dark:divide-secondary-700">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(rule.status)}
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {rule.name}
                      </p>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        When {rule.metric} {rule.operator} {rule.value} →{' '}
                        {getActionLabel(rule.action)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {rule.executionCount} executions
                      </p>
                      {rule.lastTriggered && (
                        <p className="text-xs text-secondary-500">
                          Last: {rule.lastTriggered}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleConfigureRule(rule.id)}>
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
              <p className="text-secondary-500">No automation rules configured yet</p>
              <Button onClick={handleCreateRule} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Rule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
