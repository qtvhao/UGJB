// Associated Frontend Files:
//   - web/app/src/components/layout/Sidebar.tsx (fetches /navigation endpoint)
//   - web/app/src/lib/api.ts (navigationApi - line 242-244)

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// NavigationItem represents a navigation menu item
type NavigationItem struct {
	Name string `json:"name"`
	Href string `json:"href"`
	Icon string `json:"icon"`
}

// NavigationHandler handles navigation configuration requests
type NavigationHandler struct {
	logger *zap.Logger
}

// NewNavigationHandler creates a new navigation handler
func NewNavigationHandler(logger *zap.Logger) *NavigationHandler {
	return &NavigationHandler{
		logger: logger,
	}
}

// GetNavigation returns the navigation configuration
func (h *NavigationHandler) GetNavigation(c *gin.Context) {
	navigation := []NavigationItem{
		{Name: "Dashboard", Href: "/", Icon: "LayoutDashboard"},
		{Name: "Employees", Href: "/employees", Icon: "Users"},
		{Name: "Skills", Href: "/skills", Icon: "BookOpen"},
		{Name: "Assignments", Href: "/assignments", Icon: "Briefcase"},
		{Name: "Workforce Planning", Href: "/workforce-planning", Icon: "UsersRound"},
		{Name: "Team Capacity", Href: "/team-capacity", Icon: "Layers"},
		{Name: "Skill Development", Href: "/skill-development", Icon: "Target"},
		{Name: "Engineering Metrics", Href: "/engineering-metrics", Icon: "Code2"},
		{Name: "Dashboards", Href: "/dashboards", Icon: "LayoutGrid"},
		{Name: "Automation", Href: "/automation", Icon: "Zap"},
		{Name: "Webhooks", Href: "/webhooks", Icon: "Webhook"},
		{Name: "Integrations", Href: "/integrations", Icon: "Plug"},
		{Name: "Incidents", Href: "/incidents", Icon: "AlertTriangle"},
		{Name: "Reviews", Href: "/reviews", Icon: "FileCheck"},
		{Name: "Platform Sync", Href: "/platform-sync", Icon: "RefreshCw"},
		{Name: "Middleware", Href: "/middleware", Icon: "FileCode"},
		{Name: "Settings", Href: "/settings", Icon: "Settings"},
	}

	c.JSON(http.StatusOK, navigation)
}
