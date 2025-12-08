import { Routes, Route } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Pages
import Dashboard from '@/pages/Dashboard'
import EmployeesPage from '@/pages/hr/EmployeesPage'
import EmployeeProfilePage from '@/pages/hr/EmployeeProfilePage'
import SkillsInventoryPage from '@/pages/hr/SkillsInventoryPage'
import WorkforceAssignmentsPage from '@/pages/hr/WorkforceAssignmentsPage'
import WorkforcePlanningPage from '@/pages/hr/WorkforcePlanningPage'
import SkillDevelopmentPage from '@/pages/hr/SkillDevelopmentPage'
import EngineeringMetricsPage from '@/pages/analytics/EngineeringMetricsPage'
import IntegrationsPage from '@/pages/integrations/IntegrationsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

// Cluster 0002 Pages
import AutomationRulesPage from '@/pages/automation/AutomationRulesPage'
import CustomDashboardsPage from '@/pages/dashboards/CustomDashboardsPage'
import WebhooksPage from '@/pages/webhooks/WebhooksPage'
import TeamCapacityPage from '@/pages/capacity/TeamCapacityPage'

// Cluster 0003 Pages - Unified Analytics
import IncidentsPage from '@/pages/unified-analytics/IncidentsPage'
import PerformanceReviewsPage from '@/pages/unified-analytics/PerformanceReviewsPage'
import PlatformSyncPage from '@/pages/unified-analytics/PlatformSyncPage'
import MiddlewareDocPage from '@/pages/unified-analytics/MiddlewareDocPage'

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* HR Management - US01, US02, US03 */}
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/:id" element={<EmployeeProfilePage />} />
          <Route path="skills" element={<SkillsInventoryPage />} />
          <Route path="assignments" element={<WorkforceAssignmentsPage />} />

          {/* Workforce Planning - US07, US08 */}
          <Route path="workforce-planning" element={<WorkforcePlanningPage />} />
          <Route path="skill-development" element={<SkillDevelopmentPage />} />
          <Route path="team-capacity" element={<TeamCapacityPage />} />

          {/* Engineering Analytics - US04 */}
          <Route path="engineering-metrics" element={<EngineeringMetricsPage />} />

          {/* KPI Dashboards - Story 6.1, 6.2 */}
          <Route path="dashboards" element={<CustomDashboardsPage />} />

          {/* Automation & Workflows - Story 8.1, 8.2 */}
          <Route path="automation" element={<AutomationRulesPage />} />

          {/* Webhooks - Real-time Event Processing */}
          <Route path="webhooks" element={<WebhooksPage />} />

          {/* System Integration - US05 */}
          <Route path="integrations" element={<IntegrationsPage />} />

          {/* Cluster 0003 - Unified Analytics */}
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="reviews" element={<PerformanceReviewsPage />} />
          <Route path="platform-sync" element={<PlatformSyncPage />} />
          <Route path="middleware" element={<MiddlewareDocPage />} />

          {/* Settings - US06 (RBAC) */}
          <Route path="settings" element={<SettingsPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

export default App
