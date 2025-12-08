import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Search,
  Filter,
  FileCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
} from 'lucide-react'
import { clsx } from 'clsx'

interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  reviewPeriod: string
  status: 'draft' | 'pending_manager' | 'pending_hr' | 'finalized'
  doraMetrics: {
    deploymentFrequency: number
    leadTime: number
    changeFailureRate: number
    mttr: number
  }
  codeActivity: {
    commits: number
    pullRequests: number
    codeReviews: number
  }
  flagged: boolean
  flagReason: string | null
  managerApproved: boolean
  hrApproved: boolean
  qualitativeAssessment: string | null
  createdAt: string
  updatedAt: string
}

const mockReviews: PerformanceReview[] = [
  {
    id: 'REV-001',
    employeeId: 'emp_12345',
    employeeName: 'John Doe',
    reviewPeriod: 'Q4 2024',
    status: 'pending_manager',
    doraMetrics: {
      deploymentFrequency: 12,
      leadTime: 48,
      changeFailureRate: 5,
      mttr: 2,
    },
    codeActivity: {
      commits: 145,
      pullRequests: 23,
      codeReviews: 67,
    },
    flagged: false,
    flagReason: null,
    managerApproved: false,
    hrApproved: false,
    qualitativeAssessment: null,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-08T10:00:00Z',
  },
  {
    id: 'REV-002',
    employeeId: 'emp_67890',
    employeeName: 'Jane Smith',
    reviewPeriod: 'Q4 2024',
    status: 'draft',
    doraMetrics: {
      deploymentFrequency: 5,
      leadTime: 96,
      changeFailureRate: 15,
      mttr: 8,
    },
    codeActivity: {
      commits: 67,
      pullRequests: 12,
      codeReviews: 34,
    },
    flagged: true,
    flagReason: 'Deployment frequency decline (50% drop)',
    managerApproved: false,
    hrApproved: false,
    qualitativeAssessment: null,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-08T09:00:00Z',
  },
  {
    id: 'REV-003',
    employeeId: 'emp_11111',
    employeeName: 'Bob Wilson',
    reviewPeriod: 'Q4 2024',
    status: 'finalized',
    doraMetrics: {
      deploymentFrequency: 18,
      leadTime: 24,
      changeFailureRate: 2,
      mttr: 1,
    },
    codeActivity: {
      commits: 198,
      pullRequests: 31,
      codeReviews: 89,
    },
    flagged: false,
    flagReason: null,
    managerApproved: true,
    hrApproved: true,
    qualitativeAssessment: 'Excellent performance with strong mentorship contributions.',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-07T16:00:00Z',
  },
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  pending_manager: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  pending_hr: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  finalized: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const statusLabels = {
  draft: 'Draft',
  pending_manager: 'Pending Manager Review',
  pending_hr: 'Pending HR Approval',
  finalized: 'Finalized',
}

export default function PerformanceReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reviews] = useState<PerformanceReview[]>(mockReviews)

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)

  const handleReview = (reviewId: string) => {
    setSelectedReviewId(selectedReviewId === reviewId ? null : reviewId)
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.employeeName
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const draftCount = reviews.filter((r) => r.status === 'draft').length
  const pendingCount = reviews.filter(
    (r) => r.status === 'pending_manager' || r.status === 'pending_hr'
  ).length
  const finalizedCount = reviews.filter((r) => r.status === 'finalized').length
  const flaggedCount = reviews.filter((r) => r.flagged).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Performance Reviews
        </h1>
        <p className="mt-1 text-secondary-600 dark:text-secondary-400">
          Review engineering metrics with qualitative human judgment. Metrics inform but do not
          override assessments.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              Informative - Not Definitive
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Engineering metrics are provided as supporting evidence. Final evaluations require
              manager approval and should consider qualitative context.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Draft</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {draftCount}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {pendingCount}
                </p>
              </div>
              <FileCheck className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Finalized</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {finalizedCount}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Flagged</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {flaggedCount}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <Input
                  placeholder="Search by employee name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-secondary-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending_manager">Pending Manager</option>
                <option value="pending_hr">Pending HR</option>
                <option value="finalized">Finalized</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className={clsx(
                  'p-4 rounded-lg border transition-colors',
                  review.flagged
                    ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                    : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/50'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-secondary-900 dark:text-white">
                          {review.employeeName}
                        </span>
                        <span
                          className={clsx(
                            'px-2 py-0.5 text-xs rounded-full',
                            statusColors[review.status]
                          )}
                        >
                          {statusLabels[review.status]}
                        </span>
                        {review.flagged && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Flagged
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {review.reviewPeriod}
                        </span>
                      </div>
                      {review.flagged && review.flagReason && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {review.flagReason}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => handleReview(review.id)}>
                    Review
                  </Button>
                </div>

                {/* Metrics Summary */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-500 dark:text-secondary-400">
                        Deploys/Week
                      </span>
                      {review.doraMetrics.deploymentFrequency > 10 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                      {review.doraMetrics.deploymentFrequency}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary-500 dark:text-secondary-400">
                        Lead Time (h)
                      </span>
                      {review.doraMetrics.leadTime < 48 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                      {review.doraMetrics.leadTime}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                    <span className="text-xs text-secondary-500 dark:text-secondary-400">
                      Commits
                    </span>
                    <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                      {review.codeActivity.commits}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary-100 dark:bg-secondary-800">
                    <span className="text-xs text-secondary-500 dark:text-secondary-400">
                      Code Reviews
                    </span>
                    <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                      {review.codeActivity.codeReviews}
                    </p>
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
