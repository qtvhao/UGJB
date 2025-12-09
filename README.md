# UGJB Platform

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**Unified Workforce & Engineering Analytics Platform** - A modular platform that integrates HR management with engineering performance analysis in a single open-source system.

---

## Why UGJB?

Traditional organizations face a critical challenge: **fragmented data across HR systems and engineering tools**. HR teams track skills and capacity in one system, while engineering metrics (DORA, code quality, incidents) live in completely separate tools like Jira, GitLab, Firebase, and Prometheus. This creates blind spots in talent decisions and technical outcomes.

**UGJB solves this** by unifying workforce management with deep engineering analytics, giving you:

- **Real-time visibility** of employee skills, capacity, and engineering KPIs in one platform
- **Cost savings** of ≤$120k 3-year TCO vs $200k+ enterprise SaaS platforms
- **Integration coverage** for Firebase Crashlytics, Prometheus, GitLab, and Jira—tools enterprise platforms often miss
- **Open-source flexibility** with enterprise-grade reliability (99.9% uptime target)

![Engineering Metrics Dashboard](screenshots/engineering-metrics-page.png)
*Track DORA metrics, code quality, deployments, and team output in real-time*

---

## What Problem Does This Solve?

### 1. Integration Fragmentation
Enterprise platforms provide robust HR management **without engineering insights**, or strong developer productivity metrics **without workforce planning**. Critical gaps exist for Firebase Crashlytics, Prometheus, and GitLab integrations, creating reliability blind spots.

**UGJB unifies**:
- Employee profiles, skills inventory, and FTE allocation
- Engineering data from Jira, GitLab, Firebase Crashlytics, Prometheus
- DORA metrics (deployment frequency, lead time, change failure rate, MTTR)
- Code quality scores and system reliability indicators

### 2. Domain Silos
HR decisions happen in isolation from engineering reality. You can't see how skill gaps impact deployment frequency or how team capacity affects incident resolution times.

**UGJB connects**:
- HR skill management → Engineering KPIs
- Workforce allocation → Project velocity
- Employee wellbeing → Burnout risk indicators

### 3. Cost Barriers
Enterprise SaaS platforms impose $200k+ 3-year TCO through escalating per-user fees and limited extensibility. Custom integrations cost $25k–$50k per system with high maintenance overhead.

**UGJB delivers**:
- ≤$120k 3-year TCO (infrastructure + development)
- No per-user licensing fees
- Reusable integration templates
- Extensible architecture without vendor lock-in

![Employee Management](screenshots/employees-page.png)
*Manage employee profiles, skills, roles, and assignments with full team visibility*

---

## Core Features

### Unified Workforce Management
- **Employee Registry** - Centralized profiles with skills, roles, FTE allocation, and work status
- **Skills Inventory** - Track technical competencies with proficiency levels and sources (self-reported, manager assessment, tool inference)
- **Workforce Assignment** - Project allocations with role definitions and FTE validation (≤100% rule)
- **Team Capacity Planning** - Real-time visibility of available capacity across teams

### Engineering Analytics
- **DORA Metrics** - Deployment frequency, lead time, change failure rate, mean time to recovery
- **Code Quality** - Test coverage, code review time, technical debt ratio, bug resolution time
- **System Reliability** - Incident frequency from Firebase Crashlytics, uptime/alert volume from Prometheus
- **Team Performance** - Commit activity, PR velocity, Jira issue completion, workflow stage metrics

### Integration Coverage
- **Jira** - Issues, tasks, sprint completion, workflow stages
- **GitLab** - Commits, pull requests, code reviews, deployment tracking
- **Firebase Crashlytics** - Crash reports, incident attribution to engineers
- **Prometheus** - System metrics, alerts, uptime monitoring
- **Bidirectional Sync** - Real-time data flow with webhook support

### Custom Dashboards
- **KPI Builder** - Drag-and-drop widgets (bar charts, line charts, gauges, heatmaps)
- **Audience Targeting** - Executive, team, or individual-focused views
- **Data Sources** - Combine metrics from DevLake, Jira, Monday.com, Prometheus
- **Real-time Refresh** - Configurable sync intervals (hourly, daily, real-time)

![Custom Dashboards](screenshots/custom-dashboards-page.png)
*Build tailored KPI dashboards with widgets from multiple data sources*

### Security & Access Control
- **Role-Based Permissions** - HR (full access), Engineering Lead (team data), Individual (own data)
- **Audit Logging** - Compliance tracking for all data modifications
- **Secure Credentials** - Encrypted storage for integration API keys
- **OAuth2/OIDC** - Central identity provider with per-service network policies

---

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# Start all services
docker-compose up -d

# Verify health endpoints
curl http://localhost:8080/health  # API Gateway
curl http://localhost:8081/health  # Nginx Proxy
```

### Access the Platform
- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080

### First Steps
1. Navigate to **Employees** → Create employee profiles with roles and skills
2. Go to **Integrations** → Configure Jira, GitLab, Firebase, Prometheus connections
3. Visit **Engineering Metrics** → View DORA metrics and code quality dashboards
4. Explore **Custom Dashboards** → Build KPI visualizations for your team

---

## Architecture Overview

UGJB follows a **microservices architecture** with clearly defined bounded contexts:

### Bounded Contexts

#### HR Management
- **EmployeeRegistry** (Java 17, Spring Boot, Hibernate) - Central source for employee profiles and skills
- **AllocationEngine** (Kotlin, Spring Boot, jgrapht) - Optimizes workforce allocation across projects

#### Engineering Analytics
- **MetricsCollector** (Python 3.11, FastAPI, Pandas) - Ingests raw data from version control and CI/CD
- **KPIEngine** (Python 3.11, PySpark, scikit-learn) - Calculates DORA metrics and quality scores
- **InsightsDashboard** (TypeScript, React, GraphQL) - Serves visualization endpoints

#### Goal Management
- **ObjectiveService** (TypeScript, NestJS, TypeORM) - Manages OKR lifecycle
- **KeyResultTracker** (TypeScript, NestJS, BullMQ) - Tracks progress against measurable results

#### Project Management
- **SprintCoordinator** (TypeScript, NestJS, TypeORM) - Sprint planning and execution
- **TaskDispatcher** (TypeScript, NestJS, BullMQ) - Assigns tasks based on skills/availability

#### System Integration
- **DataPipeline** (Kotlin, Apache Camel, Kafka Streams) - ETL for Jira/GitLab/Firebase
- **API Gateway** (Go, Gin, OPA) - Unified entry point with routing and security

#### Workforce Wellbeing
- **WellbeingMonitor** (Python 3.11, FastAPI, Pydantic) - Collects wellbeing indicators
- **BurnoutPredictor** (Python 3.11, scikit-learn, XGBoost) - Identifies burnout risks using ML

### Data Stores
- **PostgreSQL** - Transactional data (employees, assignments, objectives)
- **InfluxDB/TimescaleDB** - Time-series metrics (engineering activity, wellbeing)
- **ClickHouse** - Analytical queries (KPI aggregations)
- **Redis** - Read-optimized caching (dashboard data)

### Communication Patterns
- **REST APIs** - Synchronous CRUD operations (OpenAPI 3.x specs)
- **gRPC** - Low-latency service-to-service calls (Protobuf schemas)
- **Kafka/RabbitMQ** - Asynchronous event streaming (Avro schemas)

---

## Use Cases

### HR Manager: Create Employee Profile
Navigate to Employees → Enter details (name, role, department, status, FTE, location, manager, hire date) → Assign skills from taxonomy → Save profile → Employee appears in directory with all data.

**Validation**: FTE ≤ 100%, valid manager ID, active status required for project assignments.

### Engineering Lead: View Team Metrics
Access Engineering Metrics → Select team → View DORA metrics (deployment frequency, lead time, change failure rate, MTTR) → Drill into code quality (test coverage, review time, technical debt) → Export report.

**Scope**: Direct reports only, aggregated by sprint/week/month.

### Project Manager: Assign Resources
Select project → Assign Employee → Choose employee → Set role (Lead/Contributor/Advisor) → Allocate FTE % → Set dates → Save.

**Business Rules**: Total FTE across all projects ≤ 100%, assignment end date ≤ project end date, only active employees.

### Admin: Configure Integration
Navigate to Integrations → Select tool (Jira/GitLab/Firebase/Prometheus) → Enter API endpoint and credentials → Set sync frequency (min daily) → Test connection → Save.

**Security**: Encrypted credential storage, audit logging, min daily sync requirement.

---

## API Reference

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication
```bash
# All requests require JWT Bearer token
Authorization: Bearer <token>
```

### Endpoints

#### Employees
```bash
# List employees with filtering
GET /employees?status=active&department=Engineering

# Get employee with skills
GET /employees/{id}

# Create employee
POST /employees
{
  "name": "John Smith",
  "role": "Senior Developer",
  "department": "Engineering",
  "status": "active",
  "fte": 100,
  "location": "Remote",
  "managerId": "mgr-123",
  "hireDate": "2024-01-15"
}

# Update employee
PUT /employees/{id}
```

#### Skills
```bash
# List skills with search
GET /skills?category=Frontend&search=React

# Assign skill to employee
POST /employees/{id}/skills
{
  "skillId": "skill-789",
  "proficiency": "Expert",
  "source": "Manager Assessment"
}
```

#### Assignments
```bash
# Create workforce assignment
POST /assignments
{
  "employeeId": "emp-456",
  "projectId": "proj-123",
  "role": "Lead",
  "allocation": 50,
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}

# Validates: FTE ≤ 100%, end date ≤ project end
```

#### Engineering Metrics
```bash
# Get employee activity data
GET /employees/{id}/activity?period=week

# Returns: commits, PRs, reviews, Jira issues, lead time, incidents
```

### Response Codes
- **200** - Success
- **201** - Created
- **202** - Accepted (pending approval, e.g., new skill requests)
- **400** - Validation error (e.g., FTE exceeds 100%)
- **401** - Unauthorized
- **404** - Not found

---

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/unified_analytics

# Service URLs
EMPLOYEE_REGISTRY_URL=http://employee-registry:8021
METRICS_COLLECTOR_URL=http://metrics-collector:8031

# External Integrations
LATTICE_API_URL=https://api.lattice.com
LATTICE_API_KEY=your_key_here
MONDAY_API_URL=https://api.monday.com/v2
MONDAY_API_KEY=your_key_here
DEVLAKE_API_URL=http://devlake:8080
```

### Docker Compose Services

All services are defined in `docker-compose.yml`:
- **nginx-proxy** (port 8081) - Main entry point
- **api-gateway-service** (port 8080) - API routing
- **employee-registry** (port 8021) - HR data
- **metrics-collector** (port 8031) - Engineering data ingestion
- **kpi-engine** (port 8032) - Metrics calculation
- **insights-dashboard** (port 8033) - Visualizations
- **unified-analytics-api** (port 8090) - Dashboard config & platform sync

---

## Success Metrics

| Metric | Baseline | Target | How We Measure |
|--------|----------|--------|----------------|
| 3-year Total Cost of Ownership | $201k-$246k | ≤ $120k | Finance ledgers + vendor invoices |
| Integration Coverage | 50% GitLab | 100% Firebase/Prometheus/GitLab/Jira | API tests + integration dashboard |
| Time-to-Insight (data → KPI) | 72+ hours | ≤ 2 hours | Platform telemetry + latency logs |
| Platform Uptime | Undefined | ≥ 99.9% | Prometheus SLO tracking |
| Skills-Engineering Correlation | Not measured | 20% lead time improvement | Cohort analysis (HR skills × Jira/GitHub KPIs) |

---

## Contributing

Contributions are welcome! Please feel free to submit Pull Requests.

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/UGJB.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git commit -m "feat: add your feature description"

# Push and create a PR
git push origin feature/your-feature-name
```

---

## Internationalization

README available in 15 languages:

- [简体中文](i18n/README_zh-hans.md) - Simplified Chinese
- [繁體中文](i18n/README_zh-hant.md) - Traditional Chinese
- [한국어](i18n/README_ko.md) - Korean
- [日本語](i18n/README_ja.md) - Japanese
- [Español](i18n/README_es.md) - Spanish
- [Français](i18n/README_fr.md) - French
- [Deutsch](i18n/README_de.md) - German
- [Italiano](i18n/README_it.md) - Italian
- [Русский](i18n/README_ru.md) - Russian
- [Português (Brasil)](i18n/README_pt-br.md) - Brazilian Portuguese
- [हिन्दी](i18n/README_hi.md) - Hindi
- [తెలుగు](i18n/README_te.md) - Telugu
- [বাংলা](i18n/README_bn.md) - Bengali
- [اردو](i18n/README_ur.md) - Urdu
- [العربية](i18n/README_ar.md) - Arabic

---

## License

This project is licensed under an open-source license - see the [LICENSE](LICENSE) file for details.

---

## Support

For questions or support, please open an issue on [GitHub Issues](https://github.com/qtvhao/UGJB/issues).

---

**Built with ❤️ for engineering teams who value data-driven talent decisions**
