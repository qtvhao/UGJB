import { Link } from 'react-router'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const HTTP_STATUS_NOT_FOUND = 404

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-secondary-200 dark:text-secondary-800">{HTTP_STATUS_NOT_FOUND}</h1>
        <h2 className="mt-4 text-2xl font-semibold text-secondary-900 dark:text-white">
          Page not found
        </h2>
        <p className="mt-2 text-secondary-600 dark:text-secondary-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
