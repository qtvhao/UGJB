import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Edit, Briefcase, Loader2, User } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { hrApi } from '@/lib/api'

interface Skill {
  name: string
  level: string
  yearsExperience: number
}

interface Assignment {
  project: string
  allocation: number
  role: string
  startDate: string
}

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  role: string
  location: string
  joinDate: string
  status: string
  manager: string
  skills: Skill[]
  assignments: Assignment[]
}

export default function EmployeeProfilePage() {
  const { id: employeeId } = useParams()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEmployee() {
      if (!employeeId) return
      try {
        setLoading(true)
        const response = await hrApi.employees.get(employeeId)
        if (response.data) {
          setEmployee(response.data)
        }
      } catch {
        // Keep null state on error
      } finally {
        setLoading(false)
      }
    }
    fetchEmployee()
  }, [employeeId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/employees">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-secondary-100 dark:hover:bg-secondary-800 h-9 px-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">Employee not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/employees">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-secondary-100 dark:hover:bg-secondary-800 h-9 px-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </Link>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-3xl text-primary-600 dark:text-primary-400 font-bold">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {employee.name}
                  </h1>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {employee.role} - {employee.department}
                  </p>
                </div>
                <Link to={`/employees/${employee.id}/edit`}>
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700 h-10 px-4 py-2">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                  <Mail className="w-4 h-4" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                  <Phone className="w-4 h-4" />
                  {employee.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                  <MapPin className="w-4 h-4" />
                  {employee.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(employee.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills - US02 */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.skills && employee.skills.length > 0 ? (
              <div className="space-y-4">
                {employee.skills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">{skill.name}</p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {skill.yearsExperience} years experience
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        skill.level === 'Expert'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : skill.level === 'Advanced'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-secondary-500 py-4">No skills recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Assignments - US03 */}
        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.assignments && employee.assignments.length > 0 ? (
              <div className="space-y-4">
                {employee.assignments.map((assignment) => (
                  <div key={assignment.project} className="flex items-start gap-4">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                      <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {assignment.project}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {assignment.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {assignment.allocation}%
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">FTE</p>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-secondary-900 dark:text-white">
                      Total Allocation
                    </span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {employee.assignments.reduce((sum, a) => sum + a.allocation, 0)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-secondary-500 py-4">No current assignments</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
