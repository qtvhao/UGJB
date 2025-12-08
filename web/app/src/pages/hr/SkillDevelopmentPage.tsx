import { BookOpen, TrendingUp, Users, Star, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Mock data based on US08 - Skill Development Recommendations
const skillGaps = [
  { skill: 'Kubernetes', currentLevel: 15, targetLevel: 40, priority: 'High' },
  { skill: 'Machine Learning', currentLevel: 8, targetLevel: 25, priority: 'High' },
  { skill: 'GraphQL', currentLevel: 22, targetLevel: 35, priority: 'Medium' },
  { skill: 'Rust', currentLevel: 5, targetLevel: 15, priority: 'Low' },
]

const recommendations = [
  {
    id: 1,
    employee: 'John Smith',
    currentSkills: ['React', 'TypeScript', 'Node.js'],
    recommendedSkill: 'Kubernetes',
    reason: 'Team needs more DevOps capabilities',
    courses: ['K8s Fundamentals', 'CKA Certification'],
  },
  {
    id: 2,
    employee: 'Jane Doe',
    currentSkills: ['Python', 'Data Analysis'],
    recommendedSkill: 'Machine Learning',
    reason: 'Natural progression from data analysis skills',
    courses: ['ML Foundations', 'TensorFlow Basics'],
  },
  {
    id: 3,
    employee: 'Bob Johnson',
    currentSkills: ['Java', 'Spring Boot'],
    recommendedSkill: 'GraphQL',
    reason: 'Project migration to GraphQL API',
    courses: ['GraphQL Mastery', 'Apollo Server'],
  },
]

const learningPaths = [
  {
    name: 'Cloud Native Developer',
    skills: ['Docker', 'Kubernetes', 'Terraform'],
    duration: '3 months',
    enrolled: 12,
  },
  {
    name: 'Data Science Track',
    skills: ['Python', 'Machine Learning', 'Deep Learning'],
    duration: '6 months',
    enrolled: 8,
  },
  {
    name: 'Full Stack Modern',
    skills: ['React', 'GraphQL', 'Node.js'],
    duration: '4 months',
    enrolled: 15,
  },
]

export default function SkillDevelopmentPage() {
  const handleViewAllLearningPaths = () => {
    // Navigate to full learning paths page - implementation pending
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
          Skill Development
        </h1>
        <p className="mt-1 text-secondary-600 dark:text-secondary-400">
          AI-powered skill gap analysis and learning recommendations
        </p>
      </div>

      {/* Skill Gaps */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Skill Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {skillGaps.map((gap) => (
              <div key={gap.skill} className="flex items-center gap-4">
                <div className="w-32">
                  <p className="font-medium text-secondary-900 dark:text-white">{gap.skill}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      gap.priority === 'High'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : gap.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {gap.priority} Priority
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">
                      {gap.currentLevel} employees
                    </span>
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">
                      Target: {gap.targetLevel}
                    </span>
                  </div>
                  <div className="relative h-3 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-primary-500 rounded-full"
                      style={{ width: `${(gap.currentLevel / gap.targetLevel) * 100}%` }}
                    />
                    <div
                      className="absolute h-full border-r-2 border-dashed border-secondary-400"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personalized Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {rec.employee}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {rec.currentSkills.join(', ')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-secondary-400" />
                  </div>
                  <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="font-medium text-primary-700 dark:text-primary-400">
                      Learn {rec.recommendedSkill}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-300 mt-1">
                      {rec.reason}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {rec.courses.map((course) => (
                        <span
                          key={course}
                          className="text-xs px-2 py-1 bg-white dark:bg-secondary-800 rounded"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Paths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              Learning Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learningPaths.map((path) => (
                <div
                  key={path.name}
                  className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:border-primary-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">{path.name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {path.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-2 py-0.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-secondary-500 dark:text-secondary-400">
                      <TrendingUp className="w-4 h-4" />
                      {path.duration}
                    </div>
                    <div className="flex items-center gap-1 text-secondary-500 dark:text-secondary-400">
                      <Users className="w-4 h-4" />
                      {path.enrolled} enrolled
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={handleViewAllLearningPaths}>
              View All Learning Paths
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
