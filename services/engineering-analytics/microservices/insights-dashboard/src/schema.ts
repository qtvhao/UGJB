export const typeDefs = `#graphql
  type Query {
    # Employee KPIs
    employeeKPIs(employeeId: ID!, period: String!): EmployeeKPIs
    employeeActivitySummary(employeeId: ID!, period: String!): ActivitySummary

    # Team KPIs
    teamKPIs(teamId: ID!, period: String!): TeamKPIs

    # DORA Metrics
    doraMetrics(repositoryId: ID!, periodStart: String!, periodEnd: String!): DORAMetrics

    # Quality Metrics
    qualityScore(repositoryId: ID!): QualityMetrics

    # Reliability Metrics
    reliabilityScore(serviceId: ID!): ReliabilityMetrics

    # Dashboard data
    dashboardSummary(employeeId: ID!): DashboardSummary
    leaderboard(metric: String!, limit: Int): [LeaderboardEntry!]!

    # Custom Dashboards (Story 6.1, 6.2)
    customDashboard(dashboardId: ID!): CustomDashboard
    listCustomDashboards(ownerId: ID, audienceType: String): [CustomDashboard!]!

    # Executive Overview (Story 6.2)
    executiveOverview(period: String!): ExecutiveOverview
    aggregatedMetrics(period: String!, audienceType: String): AggregatedMetrics
  }

  type Mutation {
    # Custom Dashboard Management (Story 6.1)
    createCustomDashboard(input: CreateDashboardInput!): CustomDashboard!
    updateCustomDashboard(dashboardId: ID!, input: UpdateDashboardInput!): CustomDashboard!
    deleteCustomDashboard(dashboardId: ID!): Boolean!

    # Alert Configuration
    setAlertThreshold(dashboardId: ID!, input: AlertThresholdInput!): AlertThreshold!
    removeAlertThreshold(dashboardId: ID!, thresholdId: ID!): Boolean!
  }

  type Subscription {
    metricUpdated(employeeId: ID!): MetricUpdate
    thresholdBreached(entityType: String!): ThresholdBreach
  }

  type EmployeeKPIs {
    employeeId: ID!
    period: String!
    periodStart: String!
    periodEnd: String!
    commits: Int!
    pullRequestsOpened: Int!
    pullRequestsClosed: Int!
    codeReviews: Int!
    issuesCompleted: Int!
    averageLeadTime: Float
    averageCycleTime: Float
    qualityScore: Float
    productivityScore: Float
  }

  type ActivitySummary {
    employeeId: ID!
    period: String!
    periodStart: String!
    periodEnd: String!
    commits: Int!
    pullRequestsOpened: Int!
    pullRequestsClosed: Int!
    codeReviewParticipations: Int!
    jiraIssuesCompleted: Int!
    leadTimeAverage: Float
    cycleTimeAverage: Float
    incidentFrequency: Float
    systemUptime: Float
  }

  type TeamKPIs {
    teamId: ID!
    period: String!
    periodStart: String!
    periodEnd: String!
    totalCommits: Int!
    totalPullRequests: Int!
    totalIssuesCompleted: Int!
    averageVelocity: Float
    teamQualityScore: Float
    teamProductivityScore: Float
    memberKPIs: [EmployeeKPIs!]!
  }

  type DORAMetrics {
    repositoryId: ID!
    deploymentFrequency: Float!
    leadTimeForChanges: Float!
    changeFailureRate: Float!
    meanTimeToRecovery: Float!
    periodStart: String!
    periodEnd: String!
    calculatedAt: String!
    performanceLevel: String!
  }

  type QualityMetrics {
    repositoryId: ID!
    overallScore: Float!
    codeCoverage: Float!
    technicalDebtRatio: Float!
    bugDensity: Float!
    codeComplexity: Float!
    grade: String!
    calculatedAt: String!
  }

  type ReliabilityMetrics {
    serviceId: ID!
    overallScore: Float!
    uptimePercentage: Float!
    incidentFrequency: Float!
    errorRate: Float!
    latencyP99: Float!
    slaCompliant: Boolean!
    calculatedAt: String!
  }

  type DashboardSummary {
    employeeId: ID!
    currentPeriod: EmployeeKPIs
    previousPeriod: EmployeeKPIs
    trends: Trends
    alerts: [Alert!]!
  }

  type Trends {
    commitsChange: Float
    productivityChange: Float
    qualityChange: Float
  }

  type Alert {
    id: ID!
    type: String!
    severity: String!
    message: String!
    createdAt: String!
  }

  type LeaderboardEntry {
    rank: Int!
    employeeId: ID!
    employeeName: String!
    value: Float!
    change: Float
  }

  type MetricUpdate {
    employeeId: ID!
    metricType: String!
    value: Float!
    timestamp: String!
  }

  type ThresholdBreach {
    entityType: String!
    entityId: ID!
    metricType: String!
    currentValue: Float!
    thresholdValue: Float!
    severity: String!
    message: String!
  }

  # Custom Dashboard Types (Story 6.1, 6.2)
  type CustomDashboard {
    dashboardId: ID!
    name: String!
    description: String
    ownerId: ID!
    targetAudience: String!
    dataSources: [DataSource!]!
    widgets: [DashboardWidget!]!
    refreshInterval: Int!
    accessControl: AccessControl!
    alertThresholds: [AlertThreshold!]!
    createdAt: String!
    updatedAt: String!
  }

  type DataSource {
    sourceType: String!
    sourceId: String
    config: String
  }

  type DashboardWidget {
    widgetId: ID!
    title: String!
    visualizationType: String!
    metricType: String!
    position: WidgetPosition!
    config: String
  }

  type WidgetPosition {
    x: Int!
    y: Int!
    width: Int!
    height: Int!
  }

  type AccessControl {
    visibility: String!
    allowedRoles: [String!]!
    allowedUserIds: [ID!]!
  }

  type AlertThreshold {
    thresholdId: ID!
    metricType: String!
    operator: String!
    value: Float!
    severity: String!
    notificationChannels: [String!]!
  }

  # Executive Overview Types (Story 6.2)
  type ExecutiveOverview {
    period: String!
    periodStart: String!
    periodEnd: String!
    organizationKPIs: OrganizationKPIs!
    teamSummaries: [TeamSummary!]!
    topPerformers: [PerformerSummary!]!
    riskIndicators: [RiskIndicator!]!
    trends: OrganizationTrends!
  }

  type OrganizationKPIs {
    totalEmployees: Int!
    avgProductivityScore: Float!
    avgQualityScore: Float!
    totalDeployments: Int!
    avgLeadTime: Float!
    avgCycleTime: Float!
    overallUptime: Float!
  }

  type TeamSummary {
    teamId: ID!
    teamName: String!
    memberCount: Int!
    productivityScore: Float!
    qualityScore: Float!
    velocityTrend: Float!
  }

  type PerformerSummary {
    employeeId: ID!
    employeeName: String!
    metric: String!
    value: Float!
    rank: Int!
  }

  type RiskIndicator {
    type: String!
    severity: String!
    entityType: String!
    entityId: ID!
    message: String!
    recommendation: String
  }

  type OrganizationTrends {
    productivityChange: Float!
    qualityChange: Float!
    velocityChange: Float!
    incidentChange: Float!
  }

  type AggregatedMetrics {
    period: String!
    totalCommits: Int!
    totalPullRequests: Int!
    totalDeployments: Int!
    totalIssuesCompleted: Int!
    avgDeploymentFrequency: Float!
    avgLeadTime: Float!
    avgCycleTime: Float!
    avgChangeFailureRate: Float!
    avgUptime: Float!
  }

  # Input Types
  input CreateDashboardInput {
    name: String!
    description: String
    targetAudience: String!
    dataSources: [DataSourceInput!]!
    widgets: [WidgetInput!]!
    refreshInterval: Int
    accessControl: AccessControlInput!
  }

  input UpdateDashboardInput {
    name: String
    description: String
    targetAudience: String
    dataSources: [DataSourceInput!]
    widgets: [WidgetInput!]
    refreshInterval: Int
    accessControl: AccessControlInput
  }

  input DataSourceInput {
    sourceType: String!
    sourceId: String
    config: String
  }

  input WidgetInput {
    widgetId: ID
    title: String!
    visualizationType: String!
    metricType: String!
    position: WidgetPositionInput!
    config: String
  }

  input WidgetPositionInput {
    x: Int!
    y: Int!
    width: Int!
    height: Int!
  }

  input AccessControlInput {
    visibility: String!
    allowedRoles: [String!]!
    allowedUserIds: [ID!]
  }

  input AlertThresholdInput {
    metricType: String!
    operator: String!
    value: Float!
    severity: String!
    notificationChannels: [String!]!
  }
`;
