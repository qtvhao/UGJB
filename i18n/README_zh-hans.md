# UGJB 平台

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> 统一人力资源管理与工程分析的开源平台

## 问题所在

科技公司面临一个关键挑战：**人力资源系统和工程工具之间的鸿沟**。

- HR 平台（BambooHR、Lattice）缺乏工程指标（GitLab、DORA 指标）
- 工程工具（Swarmia、LinearB）不包含 HR 功能（技能追踪、FTE 分配）
- 企业级 SaaS 解决方案成本高昂（3 年超过 20 万美元）
- 自定义集成每个系统需要 2.5-5 万美元

**结果？** 人才决策与技术成果脱节。工程经理看不到团队能力，HR 团队无法衡量技能对绩效的影响。

## UGJB 的解决方案

UGJB（统一劳动力与工程分析平台）将 HR 管理与深度工程分析整合到单一的开源系统中。

### 主要功能

**员工管理**
- 完整的员工档案，包含技能、FTE 分配和工作状态
- 技能库，具有熟练程度级别和来源追踪
- 基于角色的访问控制（HR、工程主管、个人贡献者）

**工程分析**
- DORA 指标（部署频率、变更失败率、MTTR）
- GitLab/GitHub 集成（提交、PR、代码审查）
- Jira 集成（问题追踪、冲刺指标）
- Firebase Crashlytics（事件归因）
- Prometheus（系统正常运行时间、警报量）

**劳动力规划**
- 跨项目分配，具有 FTE 验证
- 实时团队容量可视化
- 技能-工程成果关联分析

**自定义仪表板**
- 可配置的 KPI 仪表板用于不同受众
- 与 DevLake、Monday.com、Lattice 集成
- 实时刷新和历史趋势

![员工管理](./screenshots/employees-page.png)
*员工目录，包含角色、部门和状态追踪*

![工程指标](./screenshots/engineering-metrics-page.png)
*DORA 指标和工程绩效分析*

![自定义仪表板](./screenshots/custom-dashboards-page.png)
*为执行层和团队层创建可配置的 KPI 仪表板*

## 快速开始

### 前提条件

- Docker 和 Docker Compose
- Git

### 安装

```bash
# 克隆仓库
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# 启动所有服务
docker-compose up -d

# 验证健康检查
curl http://localhost:8080/health  # API 网关
curl http://localhost:8081         # Web UI（通过 nginx）
```

### 访问平台

- **Web UI**: http://localhost:8081
- **API 网关**: http://localhost:8080
- **API 文档**: http://localhost:8080/docs

### 基本使用

1. **创建员工档案**
   ```bash
   curl -X POST http://localhost:8080/api/v1/employees \
     -H "Content-Type: application/json" \
     -d '{
       "name": "张三",
       "role": "高级开发工程师",
       "department": "工程部",
       "status": "active",
       "fte": 100
     }'
   ```

2. **配置 GitLab 集成**
   - 导航到设置 > 集成
   - 选择 GitLab
   - 输入 API 端点和令牌
   - 设置同步频率（最少每日）

3. **查看工程指标**
   - 访问工程指标页面
   - 查看 DORA 指标（部署频率、交付时间、变更失败率）
   - 监控代码活动和团队产出

## 为什么选择 UGJB？

### 统一洞察
将劳动力数据与工程绩效关联。回答如下问题："Kubernetes 专业知识是否减少了事件解决时间？"

### 成本优化
- **无用户许可费用**：开源模块化架构
- **3 年 TCO 目标**：≤12 万美元（对比 SaaS 解决方案的 20+ 万美元）
- **标准化集成**：减少 50% 的自定义开发时间

### 企业级可靠性
- 99.9% 正常运行时间 SLA
- 全面的可观测性（Prometheus、ELK）
- 跨域实时同步

### 可定制性
- 模块化微服务架构
- 可扩展的集成模式
- 无代码自动化规则

## 技术架构

UGJB 采用微服务架构，有 6 个限界上下文：

- **HR 管理**（Java/Spring Boot）：员工注册、分配引擎
- **工程分析**（Python/FastAPI）：指标收集器、KPI 引擎、洞察仪表板
- **目标管理**（TypeScript/NestJS）：OKR、关键结果追踪
- **项目管理**（TypeScript/NestJS）：冲刺协调、任务分配
- **系统集成**（Kotlin/Go）：数据管道、API 网关
- **劳动力福祉**（Python/FastAPI）：倦怠预测、福祉监控

**数据存储**: PostgreSQL、InfluxDB、TimescaleDB、ClickHouse、Redis
**消息传递**: Kafka、RabbitMQ
**可观测性**: Prometheus、Grafana、ELK

## 集成

UGJB 提供对常用工具的现成集成：

| 工具 | 用途 | 数据 | 协议 |
|------|------|------|------|
| GitLab | 版本控制 | 提交、PR、审查 | REST + Webhooks |
| Jira | 问题追踪 | 问题、任务 | REST + Webhooks |
| Firebase Crashlytics | 事件监控 | 崩溃、错误 | 推送通知 |
| Prometheus | 系统指标 | 警报、正常运行时间 | 查询 API |
| DevLake | 工程聚合 | DORA 指标 | REST |
| Monday.com | 项目管理 | 任务、工作流 | GraphQL |
| Lattice | 绩效管理 | OKR、审查 | REST |

## 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 支持

- **文档**: 查阅 comprehensive guides 目录获取详细的架构和实现指南
- **问题**: 在 [GitHub Issues](https://github.com/qtvhao/UGJB/issues) 提交问题
- **贡献**: 欢迎 Pull Requests！请先阅读我们的贡献指南

---

**从今天开始弥合 HR 与工程之间的鸿沟。** 🚀
