import { useParams, Link } from 'react-router'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Edit, Briefcase } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Seed data based on US01 - Employee Profile Management
const seedEmployee = {
  name: 'John Smith',
  email: 'john.smith@company.com',
  phone: '+1 234 567 890',
  department: 'Engineering',
  role: 'Senior Developer',
  location: 'San Francisco, CA',
  joinDate: '2022-03-15',
  status: 'Active',
  manager: 'Bob Johnson',
  skills: [
    { name: 'React', level: 'Expert', yearsExperience: 5 },
    { name: 'TypeScript', level: 'Expert', yearsExperience: 4 },
    { name: 'Node.js', level: 'Advanced', yearsExperience: 3 },
    { name: 'Python', level: 'Intermediate', yearsExperience: 2 },
  ],
  assignments: [
    { project: 'UGJB Platform', allocation: 60, role: 'Lead Developer', startDate: '2024-01-01' },
    { project: 'Mobile App', allocation: 40, role: 'Consultant', startDate: '2024-06-01' },
  ],
}

export default function EmployeeProfilePage() {
  const { id: employeeId } = useParams()
  const employee = { ...seedEmployee, id: employeeId ?? 'EMP001' }

  const handleEditProfile = () => {
    // Navigate to edit form or open modal - implementation pending
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/employees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
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
                <Button onClick={handleEditProfile}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
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
          </CardContent>
        </Card>

        {/* Assignments - US03 */}
        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
