import { NavLink } from 'react-router'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Code2,
  Target,
  BookOpen,
  Settings,
  Plug,
  X,
  Layers,
  Zap,
  LayoutGrid,
  Webhook,
  UsersRound,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  FileCode,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Skills Inventory', href: '/skills', icon: BookOpen },
  { name: 'Assignments', href: '/assignments', icon: Briefcase },
  { name: 'Team Capacity', href: '/team-capacity', icon: UsersRound },
  { name: 'Workforce Planning', href: '/workforce-planning', icon: Target },
  { name: 'Skill Development', href: '/skill-development', icon: Layers },
  { name: 'Engineering Metrics', href: '/engineering-metrics', icon: Code2 },
  { name: 'Custom Dashboards', href: '/dashboards', icon: LayoutGrid },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Performance Reviews', href: '/reviews', icon: FileCheck },
  { name: 'Platform Sync', href: '/platform-sync', icon: RefreshCw },
  { name: 'Middleware', href: '/middleware', icon: FileCode },
  { name: 'Automation Rules', href: '/automation', icon: Zap },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-800 transform transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-200 dark:border-secondary-700">
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            UGJB
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="mt-4 px-2">
          <NavItems />
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center h-16 px-4 border-b border-secondary-200 dark:border-secondary-700">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              UGJB Platform
            </span>
          </div>
          <nav className="flex-1 mt-4 px-2 overflow-y-auto">
            <NavItems />
          </nav>
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              Unified Workforce & Engineering Analytics
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

function NavItems() {
  return (
    <ul className="space-y-1">
      {navigation.map((item) => (
        <li key={item.name}>
          <NavLink
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
