# UGJB 平台

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**统一劳动力与工程分析平台** - 将人力资源管理与工程绩效分析集成到一个开源系统中的模块化平台。

## 概述

UGJB 平台通过实时洞察，使组织能够将人才决策与技术成果对齐。它消除了分散的 SaaS 解决方案，将企业级功能与标准化集成模式和可重用组件相结合，同时降低总体拥有成本。

### 主要特性

- **统一劳动力管理** - 员工档案、技能跟踪、FTE 分配和工作状态
- **工程分析** - DORA 指标、代码质量分数和可靠性指标
- **与开发工具集成** - Jira、GitLab、Firebase Crashlytics、Prometheus
- **实时仪表板** - 可定制的 KPI 可视化和报告
- **基于角色的访问控制** - 精细的权限和数据安全性
- **开源与模块化** - 可扩展架构，无供应商锁定

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

# 验证健康端点
curl http://localhost:8080/health
```

### 访问平台

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080

## 架构

UGJB 遵循基于微服务的架构，具有明确定义的限界上下文：

- **HR 管理** - 员工注册表和分配引擎
- **工程分析** - 指标收集器、KPI 引擎、洞察仪表板
- **目标管理** - 目标和关键结果跟踪
- **项目管理** - Sprint 协调和任务分配
- **系统集成** - 数据管道和 API 网关
- **劳动力福祉** - 倦怠预测和福祉监控

## 为什么选择 UGJB？

### 解决的问题

1. **集成碎片化** - 统一来自 Firebase、Prometheus、GitLab 和 Jira 的数据
2. **领域孤岛** - 将 HR 技能管理与工程 KPI 连接
3. **成本障碍** - ≤ $120k 3 年 TCO vs $200k+ 企业 SaaS
4. **定制限制** - 保持平台稳定性的可扩展工作流

### 成功指标

| 指标 | 基线 | 目标 |
|------|------|------|
| 3 年总拥有成本 | $201k-$246k | ≤ $120k |
| 集成覆盖率 | 50% GitLab | 100% 覆盖率 |
| 洞察时间 | 72+ 小时 | ≤ 2 小时 |
| 平台正常运行时间 | 未定义 | ≥ 99.9% |

## 基本用法

### 管理员工

```bash
# 通过 API 创建员工档案
curl -X POST http://localhost:8080/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "role": "高级开发人员",
    "department": "工程",
    "status": "active",
    "fte": 100
  }'
```

### 查看工程指标

访问工程指标仪表板：
- DORA 指标（部署频率、交付时间）
- 代码质量分数
- 最近的部署
- 团队工程产出

### 配置集成

通过 Web UI 连接外部工具：
1. 导航到"集成"
2. 选择工具类型（Jira、GitLab、Firebase、Prometheus）
3. 输入 API 端点和身份验证
4. 设置同步频率

## 许可证

本项目采用开源许可证 - 有关详细信息，请参阅 [LICENSE](LICENSE) 文件。

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 支持

如有问题或支持，请在 [GitHub Issues](https://github.com/qtvhao/UGJB/issues) 上开启一个 issue。
