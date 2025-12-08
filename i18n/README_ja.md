# UGJB プラットフォーム

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> HR管理とエンジニアリング分析を統合するオープンソースプラットフォーム

## 問題点

テクノロジー企業は重要な課題に直面しています：**HRシステムとエンジニアリングツール間のギャップ**

- HRプラットフォーム（BambooHR、Lattice）にはエンジニアリングメトリクス（GitLab、DORAメトリクス）が不足
- エンジニアリングツール（Swarmia、LinearB）にはHR機能（スキル追跡、FTE割り当て）が含まれない
- エンタープライズSaaSソリューションはコストが高い（3年間で$200k以上）
- カスタム統合はシステムごとに$25k-50kが必要

**結果は？** 人材決定が技術成果から切り離されています。エンジニアリングマネージャーはチームの能力を見ることができず、HRチームはパフォーマンスに対するスキルの影響を測定できません。

## UGJBの解決策

UGJB（統合労働力およびエンジニアリング分析プラットフォーム）は、HR管理と深いエンジニアリング分析を単一のオープンソースシステムに統合します。

### 主な機能

**従業員管理**
- スキル、FTE割り当て、勤務状況を含む完全な従業員プロファイル
- 習熟度レベルとソース追跡を含むスキルインベントリ
- ロールベースのアクセス制御（HR、エンジニアリングリード、個人貢献者）

**エンジニアリング分析**
- DORAメトリクス（デプロイ頻度、変更失敗率、MTTR）
- GitLab/GitHub統合（コミット、PR、コードレビュー）
- Jira統合（課題追跡、スプリントメトリクス）
- Firebase Crashlytics（インシデント帰属）
- Prometheus（システム稼働時間、アラート量）

**労働力計画**
- FTE検証を伴うプロジェクト間の割り当て
- リアルタイムチーム容量の可視化
- スキル-エンジニアリング成果の相関分析

**カスタムダッシュボード**
- 異なるオーディエンス向けの構成可能なKPIダッシュボード
- DevLake、Monday.com、Latticeとの統合
- リアルタイム更新と履歴トレンド

![従業員管理](./screenshots/employees-page.png)
*役割、部門、ステータス追跡を含む従業員ディレクトリ*

![エンジニアリングメトリクス](./screenshots/engineering-metrics-page.png)
*DORAメトリクスとエンジニアリングパフォーマンス分析*

![カスタムダッシュボード](./screenshots/custom-dashboards-page.png)
*エグゼクティブとチーム向けの構成可能なKPIダッシュボードの作成*

## クイックスタート

### 前提条件

- DockerおよびDocker Compose
- Git

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# すべてのサービスを起動
docker-compose up -d

# ヘルスチェックの検証
curl http://localhost:8080/health  # APIゲートウェイ
curl http://localhost:8081         # Web UI（nginx経由）
```

### プラットフォームへのアクセス

- **Web UI**: http://localhost:8081
- **APIゲートウェイ**: http://localhost:8080
- **APIドキュメント**: http://localhost:8080/docs

### 基本的な使用方法

1. **従業員プロファイルの作成**
   ```bash
   curl -X POST http://localhost:8080/api/v1/employees \
     -H "Content-Type: application/json" \
     -d '{
       "name": "山田太郎",
       "role": "シニア開発者",
       "department": "エンジニアリング",
       "status": "active",
       "fte": 100
     }'
   ```

2. **GitLab統合の構成**
   - 設定 > 統合に移動
   - GitLabを選択
   - APIエンドポイントとトークンを入力
   - 同期頻度を設定（最小限日次）

3. **エンジニアリングメトリクスの表示**
   - エンジニアリングメトリクスページを訪問
   - DORAメトリクスを表示（デプロイ頻度、リードタイム、変更失敗率）
   - コードアクティビティとチーム出力を監視

## なぜUGJBなのか？

### 統合されたインサイト
労働力データをエンジニアリングパフォーマンスと相関させます。「Kubernetesの専門知識はインシデント解決時間を短縮するか？」などの質問に答えます。

### コスト最適化
- **ユーザーライセンス料金なし**：オープンソースモジュラーアーキテクチャ
- **3年間のTCO目標**：≤$120k（SaaSソリューションの$200k+と比較）
- **標準化された統合**：カスタム開発時間を50%削減

### エンタープライズグレードの信頼性
- 99.9%稼働時間SLA
- 包括的な可観測性（Prometheus、ELK）
- ドメイン間のリアルタイム同期

### カスタマイズ性
- モジュラーマイクロサービスアーキテクチャ
- 拡張可能な統合パターン
- ノーコード自動化ルール

## 技術アーキテクチャ

UGJBは6つの境界づけられたコンテキストを持つマイクロサービスアーキテクチャを使用します：

- **HR管理**（Java/Spring Boot）：従業員登録、割り当てエンジン
- **エンジニアリング分析**（Python/FastAPI）：メトリクスコレクター、KPIエンジン、インサイトダッシュボード
- **目標管理**（TypeScript/NestJS）：OKR、主要結果追跡
- **プロジェクト管理**（TypeScript/NestJS）：スプリント調整、タスクディスパッチ
- **システム統合**（Kotlin/Go）：データパイプライン、APIゲートウェイ
- **労働力ウェルビーイング**（Python/FastAPI）：バーンアウト予測、ウェルビーイング監視

**データストレージ**: PostgreSQL、InfluxDB、TimescaleDB、ClickHouse、Redis
**メッセージング**: Kafka、RabbitMQ
**可観測性**: Prometheus、Grafana、ELK

## 統合

UGJBは一般的なツールとのすぐに使える統合を提供します：

| ツール | 目的 | データ | プロトコル |
|--------|------|------|-----------|
| GitLab | バージョン管理 | コミット、PR、レビュー | REST + Webhooks |
| Jira | 課題追跡 | 課題、タスク | REST + Webhooks |
| Firebase Crashlytics | インシデント監視 | クラッシュ、エラー | プッシュ通知 |
| Prometheus | システムメトリクス | アラート、稼働時間 | クエリAPI |
| DevLake | エンジニアリング集約 | DORAメトリクス | REST |
| Monday.com | プロジェクト管理 | タスク、ワークフロー | GraphQL |
| Lattice | パフォーマンス管理 | OKR、レビュー | REST |

## ライセンス

MITライセンス - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## サポート

- **ドキュメント**: 詳細なアーキテクチャと実装ガイドについては`docs/`ディレクトリを参照してください
- **問題**: [GitHub Issues](https://github.com/qtvhao/UGJB/issues)で問題を送信してください
- **貢献**: プルリクエストを歓迎します！まず貢献ガイドをお読みください

---

**今日からHRとエンジニアリング間のギャップを埋めましょう。** 🚀
