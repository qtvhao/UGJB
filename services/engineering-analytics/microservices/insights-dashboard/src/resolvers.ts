/**
 * Associated Frontend Files:
 *   - web/app/src/lib/api.ts (dashboardsApi - lines 215-222)
 *   - web/app/src/pages/dashboards/CustomDashboardsPage.tsx
 */
import { PubSub } from 'graphql-subscriptions';
import { v4 as uuidv4 } from 'uuid';

const pubsub = new PubSub();

// In-memory storage for dashboards (would be a database in production)
const dashboards: Map<string, any> = new Map();
const alertThresholds: Map<string, any[]> = new Map();

export const resolvers = {
  Query: {
    employeeKPIs: async (_: any, { employeeId, period }: { employeeId: string; period: string }) => {
      // In production, this would call KPIEngine gRPC service
      const now = new Date();
      const periodStart = new Date(now.getTime() - getDaysForPeriod(period) * 24 * 60 * 60 * 1000);

      return {
        employeeId,
        period,
        periodStart: periodStart.toISOString(),
        periodEnd: now.toISOString(),
        commits: 42,
        pullRequestsOpened: 18,
        pullRequestsClosed: 15,
        codeReviews: 27,
        issuesCompleted: 12,
        averageLeadTime: 2.5,
        averageCycleTime: 4.2,
        qualityScore: 85.5,
        productivityScore: 78.3,
      };
    },

    employeeActivitySummary: async (_: any, { employeeId, period }: { employeeId: string; period: string }) => {
      const now = new Date();
      const periodStart = new Date(now.getTime() - getDaysForPeriod(period) * 24 * 60 * 60 * 1000);

      return {
        employeeId,
        period,
        periodStart: periodStart.toISOString(),
        periodEnd: now.toISOString(),
        commits: 42,
        pullRequestsOpened: 18,
        pullRequestsClosed: 15,
        codeReviewParticipations: 27,
        jiraIssuesCompleted: 12,
        leadTimeAverage: 2.5,
        cycleTimeAverage: 4.2,
        incidentFrequency: 0.3,
        systemUptime: 99.97,
      };
    },

    teamKPIs: async (_: any, { teamId, period }: { teamId: string; period: string }) => {
      const now = new Date();
      const periodStart = new Date(now.getTime() - getDaysForPeriod(period) * 24 * 60 * 60 * 1000);

      return {
        teamId,
        period,
        periodStart: periodStart.toISOString(),
        periodEnd: now.toISOString(),
        totalCommits: 210,
        totalPullRequests: 85,
        totalIssuesCompleted: 48,
        averageVelocity: 32.5,
        teamQualityScore: 82.3,
        teamProductivityScore: 75.8,
        memberKPIs: [],
      };
    },

    doraMetrics: async (_: any, { repositoryId, periodStart, periodEnd }: { repositoryId: string; periodStart: string; periodEnd: string }) => {
      return {
        repositoryId,
        deploymentFrequency: 2.5,
        leadTimeForChanges: 18.5,
        changeFailureRate: 8.2,
        meanTimeToRecovery: 0.75,
        periodStart,
        periodEnd,
        calculatedAt: new Date().toISOString(),
        performanceLevel: 'high',
      };
    },

    qualityScore: async (_: any, { repositoryId }: { repositoryId: string }) => {
      return {
        repositoryId,
        overallScore: 85.5,
        codeCoverage: 78.2,
        technicalDebtRatio: 3.5,
        bugDensity: 0.3,
        codeComplexity: 8.2,
        grade: 'B',
        calculatedAt: new Date().toISOString(),
      };
    },

    reliabilityScore: async (_: any, { serviceId }: { serviceId: string }) => {
      return {
        serviceId,
        overallScore: 97.5,
        uptimePercentage: 99.95,
        incidentFrequency: 0.05,
        errorRate: 0.02,
        latencyP99: 185,
        slaCompliant: true,
        calculatedAt: new Date().toISOString(),
      };
    },

    dashboardSummary: async (_: any, { employeeId }: { employeeId: string }) => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      return {
        employeeId,
        currentPeriod: {
          employeeId,
          period: 'week',
          periodStart: weekAgo.toISOString(),
          periodEnd: now.toISOString(),
          commits: 42,
          pullRequestsOpened: 18,
          pullRequestsClosed: 15,
          codeReviews: 27,
          issuesCompleted: 12,
          averageLeadTime: 2.5,
          averageCycleTime: 4.2,
          qualityScore: 85.5,
          productivityScore: 78.3,
        },
        previousPeriod: {
          employeeId,
          period: 'week',
          periodStart: twoWeeksAgo.toISOString(),
          periodEnd: weekAgo.toISOString(),
          commits: 38,
          pullRequestsOpened: 15,
          pullRequestsClosed: 14,
          codeReviews: 22,
          issuesCompleted: 10,
          averageLeadTime: 3.0,
          averageCycleTime: 4.8,
          qualityScore: 82.0,
          productivityScore: 72.5,
        },
        trends: {
          commitsChange: 10.5,
          productivityChange: 8.0,
          qualityChange: 4.3,
        },
        alerts: [],
      };
    },

    leaderboard: async (_: any, { metric, limit }: { metric: string; limit?: number }) => {
      const maxEntries = limit || 10;
      return Array.from({ length: maxEntries }, (_, i) => ({
        rank: i + 1,
        employeeId: `emp-${i + 1}`,
        employeeName: `Employee ${i + 1}`,
        value: 100 - i * 5,
        change: Math.random() * 10 - 5,
      }));
    },

    // Custom Dashboard Queries (Story 6.1)
    customDashboard: async (_: any, { dashboardId }: { dashboardId: string }) => {
      return dashboards.get(dashboardId) || null;
    },

    listCustomDashboards: async (_: any, { ownerId, audienceType }: { ownerId?: string; audienceType?: string }) => {
      let result = Array.from(dashboards.values());
      if (ownerId) {
        result = result.filter(d => d.ownerId === ownerId);
      }
      if (audienceType) {
        result = result.filter(d => d.targetAudience === audienceType);
      }
      return result;
    },

    // Executive Overview (Story 6.2)
    executiveOverview: async (_: any, { period }: { period: string }) => {
      const now = new Date();
      const periodStart = new Date(now.getTime() - getDaysForPeriod(period) * 24 * 60 * 60 * 1000);

      return {
        period,
        periodStart: periodStart.toISOString(),
        periodEnd: now.toISOString(),
        organizationKPIs: {
          totalEmployees: 150,
          avgProductivityScore: 78.5,
          avgQualityScore: 82.3,
          totalDeployments: 245,
          avgLeadTime: 18.5,
          avgCycleTime: 32.4,
          overallUptime: 99.95,
        },
        teamSummaries: [
          { teamId: 'team-1', teamName: 'Platform', memberCount: 12, productivityScore: 82.5, qualityScore: 85.2, velocityTrend: 5.2 },
          { teamId: 'team-2', teamName: 'Core API', memberCount: 8, productivityScore: 78.3, qualityScore: 80.1, velocityTrend: -2.1 },
          { teamId: 'team-3', teamName: 'Frontend', memberCount: 10, productivityScore: 75.8, qualityScore: 88.5, velocityTrend: 8.5 },
        ],
        topPerformers: [
          { employeeId: 'emp-1', employeeName: 'Alice Johnson', metric: 'commits', value: 145, rank: 1 },
          { employeeId: 'emp-2', employeeName: 'Bob Smith', metric: 'commits', value: 132, rank: 2 },
          { employeeId: 'emp-3', employeeName: 'Carol Williams', metric: 'commits', value: 128, rank: 3 },
        ],
        riskIndicators: [
          { type: 'burnout', severity: 'medium', entityType: 'employee', entityId: 'emp-5', message: 'Sustained high overtime hours', recommendation: 'Consider workload redistribution' },
        ],
        trends: {
          productivityChange: 3.2,
          qualityChange: 1.8,
          velocityChange: 5.5,
          incidentChange: -12.3,
        },
      };
    },

    aggregatedMetrics: async (_: any, { period }: { period: string; audienceType?: string }) => {
      return {
        period,
        totalCommits: 2450,
        totalPullRequests: 890,
        totalDeployments: 245,
        totalIssuesCompleted: 456,
        avgDeploymentFrequency: 2.8,
        avgLeadTime: 18.5,
        avgCycleTime: 32.4,
        avgChangeFailureRate: 8.2,
        avgUptime: 99.95,
      };
    },
  },

  Mutation: {
    // Custom Dashboard Mutations (Story 6.1)
    createCustomDashboard: async (_: any, { input }: { input: any }, context: any) => {
      const dashboardId = uuidv4();
      const now = new Date().toISOString();

      const dashboard = {
        dashboardId,
        name: input.name,
        description: input.description,
        ownerId: context.userId || 'anonymous',
        targetAudience: input.targetAudience,
        dataSources: input.dataSources.map((ds: any) => ({
          sourceType: ds.sourceType,
          sourceId: ds.sourceId,
          config: ds.config,
        })),
        widgets: input.widgets.map((w: any) => ({
          widgetId: w.widgetId || uuidv4(),
          title: w.title,
          visualizationType: w.visualizationType,
          metricType: w.metricType,
          position: w.position,
          config: w.config,
        })),
        refreshInterval: input.refreshInterval || 300,
        accessControl: {
          visibility: input.accessControl.visibility,
          allowedRoles: input.accessControl.allowedRoles,
          allowedUserIds: input.accessControl.allowedUserIds || [],
        },
        alertThresholds: [],
        createdAt: now,
        updatedAt: now,
      };

      dashboards.set(dashboardId, dashboard);
      return dashboard;
    },

    updateCustomDashboard: async (_: any, { dashboardId, input }: { dashboardId: string; input: any }) => {
      const existing = dashboards.get(dashboardId);
      if (!existing) {
        throw new Error(`Dashboard not found: ${dashboardId}`);
      }

      const updated = {
        ...existing,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      if (input.widgets) {
        updated.widgets = input.widgets.map((w: any) => ({
          widgetId: w.widgetId || uuidv4(),
          title: w.title,
          visualizationType: w.visualizationType,
          metricType: w.metricType,
          position: w.position,
          config: w.config,
        }));
      }

      dashboards.set(dashboardId, updated);
      return updated;
    },

    deleteCustomDashboard: async (_: any, { dashboardId }: { dashboardId: string }) => {
      return dashboards.delete(dashboardId);
    },

    setAlertThreshold: async (_: any, { dashboardId, input }: { dashboardId: string; input: any }) => {
      const dashboard = dashboards.get(dashboardId);
      if (!dashboard) {
        throw new Error(`Dashboard not found: ${dashboardId}`);
      }

      const threshold = {
        thresholdId: uuidv4(),
        metricType: input.metricType,
        operator: input.operator,
        value: input.value,
        severity: input.severity,
        notificationChannels: input.notificationChannels,
      };

      dashboard.alertThresholds.push(threshold);
      dashboards.set(dashboardId, dashboard);

      return threshold;
    },

    removeAlertThreshold: async (_: any, { dashboardId, thresholdId }: { dashboardId: string; thresholdId: string }) => {
      const dashboard = dashboards.get(dashboardId);
      if (!dashboard) {
        return false;
      }

      const index = dashboard.alertThresholds.findIndex((t: any) => t.thresholdId === thresholdId);
      if (index === -1) {
        return false;
      }

      dashboard.alertThresholds.splice(index, 1);
      dashboards.set(dashboardId, dashboard);
      return true;
    },
  },

  Subscription: {
    metricUpdated: {
      subscribe: (_: any, { employeeId }: { employeeId: string }) => {
        return pubsub.asyncIterator([`METRIC_UPDATED_${employeeId}`]);
      },
    },
    thresholdBreached: {
      subscribe: (_: any, { entityType }: { entityType: string }) => {
        return pubsub.asyncIterator([`THRESHOLD_BREACHED_${entityType}`]);
      },
    },
  },
};

function getDaysForPeriod(period: string): number {
  switch (period) {
    case 'week':
      return 7;
    case 'sprint':
      return 14;
    case 'month':
      return 30;
    default:
      return 7;
  }
}
