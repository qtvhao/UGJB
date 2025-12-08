# UGJB 平台

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> 統一人力資源管理與工程分析的開源平台

## 問題所在

科技公司面臨一個關鍵挑戰：**人力資源系統和工程工具之間的鴻溝**。

- HR 平台（BambooHR、Lattice）缺乏工程指標（GitLab、DORA 指標）
- 工程工具（Swarmia、LinearB）不包含 HR 功能（技能追蹤、FTE 分配）
- 企業級 SaaS 解決方案成本高昂（3 年超過 20 萬美元）
- 自訂整合每個系統需要 2.5-5 萬美元

**結果？** 人才決策與技術成果脫節。工程經理看不到團隊能力，HR 團隊無法衡量技能對績效的影響。

## UGJB 的解決方案

UGJB（統一勞動力與工程分析平台）將 HR 管理與深度工程分析整合到單一的開源系統中。

### 主要功能

**員工管理**
- 完整的員工檔案，包含技能、FTE 分配和工作狀態
- 技能庫，具有熟練程度級別和來源追蹤
- 基於角色的存取控制（HR、工程主管、個人貢獻者）

**工程分析**
- DORA 指標（部署頻率、變更失敗率、MTTR）
- GitLab/GitHub 整合（提交、PR、程式碼審查）
- Jira 整合（問題追蹤、衝刺指標）
- Firebase Crashlytics（事件歸因）
- Prometheus（系統正常運作時間、警報量）

**勞動力規劃**
- 跨專案分配，具有 FTE 驗證
- 即時團隊容量視覺化
- 技能-工程成果關聯分析

**自訂儀表板**
- 可設定的 KPI 儀表板用於不同受眾
- 與 DevLake、Monday.com、Lattice 整合
- 即時重新整理和歷史趨勢

![員工管理](./screenshots/employees-page.png)
*員工目錄，包含角色、部門和狀態追蹤*

![工程指標](./screenshots/engineering-metrics-page.png)
*DORA 指標和工程績效分析*

![自訂儀表板](./screenshots/custom-dashboards-page.png)
*為執行層和團隊層建立可設定的 KPI 儀表板*

## 快速開始

### 前提條件

- Docker 和 Docker Compose
- Git

### 安裝

```bash
# 複製儲存庫
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# 啟動所有服務
docker-compose up -d

# 驗證健康檢查
curl http://localhost:8080/health  # API 閘道
curl http://localhost:8081         # Web UI（通過 nginx）
```

### 存取平台

- **Web UI**: http://localhost:8081
- **API 閘道**: http://localhost:8080
- **API 文件**: http://localhost:8080/docs

### 基本使用

1. **建立員工檔案**
   ```bash
   curl -X POST http://localhost:8080/api/v1/employees \
     -H "Content-Type: application/json" \
     -d '{
       "name": "張三",
       "role": "資深開發工程師",
       "department": "工程部",
       "status": "active",
       "fte": 100
     }'
   ```

2. **設定 GitLab 整合**
   - 導航到設定 > 整合
   - 選擇 GitLab
   - 輸入 API 端點和令牌
   - 設定同步頻率（最少每日）

3. **查看工程指標**
   - 造訪工程指標頁面
   - 查看 DORA 指標（部署頻率、交付時間、變更失敗率）
   - 監控程式碼活動和團隊產出

## 為什麼選擇 UGJB？

### 統一洞察
將勞動力資料與工程績效關聯。回答如下問題：「Kubernetes 專業知識是否減少了事件解決時間？」

### 成本最佳化
- **無使用者授權費用**：開源模組化架構
- **3 年 TCO 目標**：≤12 萬美元（對比 SaaS 解決方案的 20+ 萬美元）
- **標準化整合**：減少 50% 的自訂開發時間

### 企業級可靠性
- 99.9% 正常運作時間 SLA
- 全面的可觀測性（Prometheus、ELK）
- 跨網域即時同步

### 可自訂性
- 模組化微服務架構
- 可擴展的整合模式
- 無程式碼自動化規則

## 技術架構

UGJB 採用微服務架構，有 6 個限界上下文：

- **HR 管理**（Java/Spring Boot）：員工註冊、分配引擎
- **工程分析**（Python/FastAPI）：指標收集器、KPI 引擎、洞察儀表板
- **目標管理**（TypeScript/NestJS）：OKR、關鍵結果追蹤
- **專案管理**（TypeScript/NestJS）：衝刺協調、任務分配
- **系統整合**（Kotlin/Go）：資料管道、API 閘道
- **勞動力福祉**（Python/FastAPI）：倦怠預測、福祉監控

**資料儲存**: PostgreSQL、InfluxDB、TimescaleDB、ClickHouse、Redis
**訊息傳遞**: Kafka、RabbitMQ
**可觀測性**: Prometheus、Grafana、ELK

## 整合

UGJB 提供對常用工具的現成整合：

| 工具 | 用途 | 資料 | 協定 |
|------|------|------|------|
| GitLab | 版本控制 | 提交、PR、審查 | REST + Webhooks |
| Jira | 問題追蹤 | 問題、任務 | REST + Webhooks |
| Firebase Crashlytics | 事件監控 | 當機、錯誤 | 推送通知 |
| Prometheus | 系統指標 | 警報、正常運作時間 | 查詢 API |
| DevLake | 工程彙總 | DORA 指標 | REST |
| Monday.com | 專案管理 | 任務、工作流程 | GraphQL |
| Lattice | 績效管理 | OKR、審查 | REST |

## 授權

MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案。

## 支援

- **文件**: 查閱 `docs/` 目錄取得詳細的架構和實作指南
- **問題**: 在 [GitHub Issues](https://github.com/qtvhao/UGJB/issues) 提交問題
- **貢獻**: 歡迎 Pull Requests！請先閱讀我們的貢獻指南

---

**從今天開始彌合 HR 與工程之間的鴻溝。** 🚀
