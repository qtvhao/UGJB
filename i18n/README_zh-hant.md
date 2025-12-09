# UGJB 平台

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**統一勞動力與工程分析平台** - 將人力資源管理與工程績效分析整合到一個開源系統中的模組化平台。

## 概述

UGJB 平台透過即時洞察，使組織能夠將人才決策與技術成果對齊。它消除了分散的 SaaS 解決方案，將企業級功能與標準化整合模式和可重用元件相結合，同時降低總體擁有成本。

### 主要特性

- **統一勞動力管理** - 員工檔案、技能追蹤、FTE 分配和工作狀態
- **工程分析** - DORA 指標、程式碼品質分數和可靠性指標
- **與開發工具整合** - Jira、GitLab、Firebase Crashlytics、Prometheus
- **即時儀表板** - 可自訂的 KPI 視覺化和報告
- **基於角色的存取控制** - 精細的權限和資料安全性
- **開源與模組化** - 可擴充架構，無供應商鎖定

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

# 驗證健康端點
curl http://localhost:8080/health
```

### 訪問平台

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080

## 架構

UGJB 遵循基於微服務的架構，具有明確定義的限界上下文：

- **HR 管理** - 員工註冊表和分配引擎
- **工程分析** - 指標收集器、KPI 引擎、洞察儀表板
- **目標管理** - 目標和關鍵結果追蹤
- **專案管理** - Sprint 協調和任務分配
- **系統整合** - 資料管道和 API 閘道
- **勞動力福祉** - 倦怠預測和福祉監控

## 為什麼選擇 UGJB？

### 解決的問題

1. **整合碎片化** - 統一來自 Firebase、Prometheus、GitLab 和 Jira 的資料
2. **領域孤島** - 將 HR 技能管理與工程 KPI 連接
3. **成本障礙** - ≤ $120k 3 年 TCO vs $200k+ 企業 SaaS
4. **自訂限制** - 保持平台穩定性的可擴充工作流

### 成功指標

| 指標 | 基線 | 目標 |
|------|------|------|
| 3 年總擁有成本 | $201k-$246k | ≤ $120k |
| 整合覆蓋率 | 50% GitLab | 100% 覆蓋率 |
| 洞察時間 | 72+ 小時 | ≤ 2 小時 |
| 平台正常運行時間 | 未定義 | ≥ 99.9% |

## 基本用法

### 管理員工

```bash
# 透過 API 建立員工檔案
curl -X POST http://localhost:8080/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "張三",
    "role": "高級開發人員",
    "department": "工程",
    "status": "active",
    "fte": 100
  }'
```

### 查看工程指標

訪問工程指標儀表板：
- DORA 指標（部署頻率、交付時間）
- 程式碼品質分數
- 最近的部署
- 團隊工程產出

### 配置整合

透過 Web UI 連接外部工具：
1. 導航到「整合」
2. 選擇工具類型（Jira、GitLab、Firebase、Prometheus）
3. 輸入 API 端點和身份驗證
4. 設定同步頻率

## 許可證

本專案採用開源許可證 - 有關詳細資訊，請參閱 [LICENSE](LICENSE) 檔案。

## 貢獻

歡迎貢獻！請隨時提交 Pull Request。

## 支援

如有問題或支援，請在 [GitHub Issues](https://github.com/qtvhao/UGJB/issues) 上開啟一個 issue。
