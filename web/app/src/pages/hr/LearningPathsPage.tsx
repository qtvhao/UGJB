import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, BookOpen, Users, TrendingUp, Clock, Search, Filter, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { hrApi } from '@/lib/api'

interface Course {
  name: string
  duration: string
}

interface LearningPath {
  id: number
  name: string
  description: string
  skills: string[]
  duration: string
  enrolled: number
  difficulty: string
  courses: Course[]
}

export default function LearningPathsPage() {
  const navigate = useNavigate()
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [expandedPath, setExpandedPath] = useState<number | null>(null)

  useEffect(() => {
    async function fetchLearningPaths() {
      try {
        setLoading(true)
        const response = await hrApi.learningPaths.list()
        if (response.data && Array.isArray(response.data)) {
          setLearningPaths(response.data)
        }
      } catch {
        // Keep empty state on error
      } finally {
        setLoading(false)
      }
    }
    fetchLearningPaths()
  }, [])

  const filteredPaths = learningPaths.filter((path) => {
    const matchesSearch =
      path.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDifficulty =
      selectedDifficulty === 'All' || path.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/skill-development')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Learning Paths
          </h1>
          <p className="mt-1 text-secondary-600 dark:text-secondary-400">
            Structured learning journeys to develop new skills
          </p>
        </div>
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
                  placeholder="Search paths or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-secondary-400" />
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <Button
                  key={level}
                  variant={selectedDifficulty === level ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths Grid */}
      {filteredPaths.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPaths.map((path) => (
            <Card key={path.id} className="hover:border-primary-500 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-500" />
                  {path.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                  {path.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {path.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-secondary-500 dark:text-secondary-400">
                      <Clock className="w-4 h-4" />
                      {path.duration}
                    </div>
                    <div className="flex items-center gap-1 text-secondary-500 dark:text-secondary-400">
                      <Users className="w-4 h-4" />
                      {path.enrolled} enrolled
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      path.difficulty === 'Beginner'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : path.difficulty === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {path.difficulty}
                  </span>
                </div>

                {/* Expandable Courses */}
                {expandedPath === path.id && path.courses && (
                  <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4 mb-4">
                    <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Course Breakdown:
                    </p>
                    <div className="space-y-2">
                      {path.courses.map((course, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm p-2 bg-secondary-50 dark:bg-secondary-800/50 rounded"
                        >
                          <span className="text-secondary-700 dark:text-secondary-300">
                            {idx + 1}. {course.name}
                          </span>
                          <span className="text-secondary-500 dark:text-secondary-400">
                            {course.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
                  >
                    {expandedPath === path.id ? 'Hide Details' : 'View Details'}
                  </Button>
                  <Button size="sm" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Enroll
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600 dark:text-secondary-400">
              {learningPaths.length === 0
                ? 'No learning paths available yet.'
                : 'No learning paths match your search criteria.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
