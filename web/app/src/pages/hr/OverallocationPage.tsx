import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, AlertTriangle, Check, Minus, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { hrApi } from '@/lib/api'

interface Assignment {
  id: number
  project: string
  allocation: number
  role: string
}

interface OverAllocatedEmployee {
  id: number
  name: string
  totalAllocation: number
  assignments: Assignment[]
}

export default function OverallocationPage() {
  const navigate = useNavigate()
  const [overAllocations, setOverAllocations] = useState<OverAllocatedEmployee[]>([])
  const [adjustments, setAdjustments] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hrApi.assignments.overAllocated()
      .then((res) => setOverAllocations(res.data))
      .catch((err) => console.error('Failed to fetch over-allocated employees:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleAdjustment = (assignmentId: number, newValue: number) => {
    setAdjustments({ ...adjustments, [assignmentId]: newValue })
  }

  const calculateNewTotal = (employee: OverAllocatedEmployee) => {
    return employee.assignments.reduce((total, assignment) => {
      const adjusted = adjustments[assignment.id]
      return total + (adjusted !== undefined ? adjusted : assignment.allocation)
    }, 0)
  }

  const handleResolve = (employeeId: number) => {
    hrApi.assignments.resolve(String(employeeId), adjustments)
      .then(() => setOverAllocations(overAllocations.filter((e) => e.id !== employeeId)))
      .catch((err) => console.error('Failed to resolve allocations:', err))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (overAllocations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/assignments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Over-allocation Resolution
          </h1>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
              All Clear!
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400">
              There are no over-allocated employees to resolve.
            </p>
            <Button className="mt-4" onClick={() => navigate('/assignments')}>
              Return to Assignments
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/assignments')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Over-allocation Resolution
          </h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Resolve employee allocations exceeding 100%
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {overAllocations.map((employee) => {
          const newTotal = calculateNewTotal(employee)
          const isResolved = newTotal <= 100

          return (
            <Card key={employee.id} className={isResolved ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700'}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-5 h-5 ${isResolved ? 'text-green-500' : 'text-red-500'}`} />
                    {employee.name}
                  </div>
                  <span className={`text-lg ${isResolved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {newTotal}% allocated
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employee.assignments.map((assignment) => {
                    const currentValue = adjustments[assignment.id] ?? assignment.allocation

                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">
                            {assignment.project}
                          </p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">
                            {assignment.role}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAdjustment(assignment.id, Math.max(0, currentValue - 10))}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="w-20 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={currentValue}
                              onChange={(e) => handleAdjustment(assignment.id, parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 text-center border border-secondary-300 dark:border-secondary-600 rounded bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                            />
                          </div>
                          <span className="text-secondary-500 dark:text-secondary-400">%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 flex justify-end">
                  <Button
                    onClick={() => handleResolve(employee.id)}
                    disabled={!isResolved}
                    variant={isResolved ? 'primary' : 'outline'}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isResolved ? 'Save Changes' : 'Reduce to 100% or less'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
