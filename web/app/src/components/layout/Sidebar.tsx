import { useState, useEffect } from 'react'
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
  LucideIcon,
} from 'lucide-react'
import { api } from '@/lib/api'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavigationItem {
  name: string
  href: string
  icon: string
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Briefcase,
  Code2,
  Target,
  BookOpen,
  Settings,
  Plug,
  Layers,
  Zap,
  LayoutGrid,
  Webhook,
  UsersRound,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  FileCode,
}

const defaultNavigation: NavigationItem[] = []

export function Sidebar({ open, onClose }: SidebarProps) {
  const [navigation, setNavigation] = useState<NavigationItem[]>(defaultNavigation)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNavigation() {
      try {
        const response = await api.get('/navigation')
        if (response.data && Array.isArray(response.data)) {
          setNavigation(response.data)
        }
      } catch {
        // Navigation will remain empty if API fails
      } finally {
        setLoading(false)
      }
    }
    fetchNavigation()
  }, [])

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
          <NavItems navigation={navigation} loading={loading} />
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
            <NavItems navigation={navigation} loading={loading} />
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

function NavItems({ navigation, loading }: { navigation: NavigationItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (navigation.length === 0) {
    return (
      <p className="text-sm text-secondary-500 dark:text-secondary-400 px-3 py-2">
        No navigation items available
      </p>
    )
  }

  return (
    <ul className="space-y-1">
      {navigation.map((item) => {
        const Icon = iconMap[item.icon] || LayoutDashboard
        return (
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
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}
