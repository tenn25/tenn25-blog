---
title: "3年半ぶりにAzureへ戻る ― 見落としがちな廃止・移行アップデート棚卸し"
date: 2026-07-03T00:00:00+09:00
slug: "azure-updates-recap-4years"
categories: ["Azure"]
tags: ["Azure", "SRE"]
---

しばらく Azure から離れていたのですが、また触る機会ができたので、直近4年ぶんの主要な変更をまとめて棚卸ししました。
新機能そのものより、**「知らないと事故る廃止・移行系」**と**「インパクトの大きいもの」**を優先して整理しています。

同じように「久しぶりに Azure に戻る」人のチェックリストとして使えるはずです。

> ⚠️ 記載内容は執筆時点(2026年7月)の情報です。廃止日や後継サービスの状況は変わることがあるので、**実際の移行判断の前に必ず公式ドキュメントで最新を確認**してください。

## 🚨 最優先で押さえる変更

### Microsoft Entra ID（旧 Azure AD）

2023年7月に **Azure AD → Microsoft Entra ID** へリブランドされました。呼称が変わっただけで、機能・API・ライセンス・サインインURL・PowerShell cmdlet は据え置きです。

- Conditional Access → Microsoft Entra Conditional Access
- Azure AD Connect → Microsoft Entra Connect

ただし**モジュールの世代交代**は実害があります。

- **Azure AD PowerShell モジュールは廃止**（2024年3月）→ Microsoft Graph PowerShell へ移行
- 既存スクリプトが古いモジュール前提だと動かなくなるので要確認

ドキュメントも新旧の呼称が混在しているので、検索するときは両方の名前で当たると早いです。

### Application Gateway

- **V1 は完全廃止**（2026年4月28日）
  - 2023年7月以降は新規顧客が作成不可
  - 2024年9月以降は既存サブスクリプションでも新規作成不可
- V2 では TCP/TLS proxy（L4プロキシ）と Autoscaling に対応

既存環境が V1 のまま残っていないか、まず確認したいポイントです。

### Application Insights

- **Classic App Insights は廃止**（2024年2月29日）→ Workspace-based App Insights へ
  - 未移行リソースは2024年5月から自動的に段階移行された
- **Instrumentation Key の ingestion サポートは終了**（2025年3月31日）→ **Connection String へ移行必須**

Terraform で管理している場合、移行が destroy/recreate になってデータロスを招くパターンがあります（`azurerm` 3.49 以降で回避可能）。ここは事前にプランを確認しておくと安全です。

### Azure Automation

runbook 運用をしている環境は、ここが一番の地雷原です。

- **Run As アカウントは廃止**（2023年9月30日）→ Managed Identity へ
- **Agent-based の User Hybrid Runbook Worker は廃止**（2024年8月31日）→ Extension-based へ
  - 2025年4月1日以降は Agent-based でのジョブ実行が停止
- **AzureRM PowerShell モジュールは廃止**（2024年2月29日）
  - 2025年2月1日以降、AzureRM を使う runbook は実行停止
  - **古い runbook は Az モジュールへ書き換えが必要**
- Update Management / Change Tracking（Log Analytics 版）は廃止（2024年8月31日）→ Azure Update Manager と AMA 版へ
- PowerShell 7.2 runbooks が GA

「昔書いた runbook がそのまま動いているはず」という前提が一番危ないので、モジュールの世代を先に確認しましょう。

### Azure Cache for Redis

- **Basic / Standard / Premium は廃止予定**（2028年9月30日）
- **Enterprise tier は廃止予定**（2027年3月30日）
- 後継の **Azure Managed Redis** が GA
  - Memory Optimized / Balanced / Compute Optimized / Flash Optimized の4 tier
  - Redis Enterprise ベース、ベクトル検索対応、最大 99.999% SLA
  - 旧サービスより高性能・低コスト
- **TLS 1.0/1.1 のサポート終了**（2024年10月1日）→ TLS 1.2 必須

廃止は少し先ですが、新規構築なら最初から Managed Redis を検討する場面です。

### Azure SQL Database

- **Hyperscale Serverless が GA**（2024年）
  - 負荷に応じてコンピュートが自動スケール。Hyperscale の拡張性 + サーバレスのコスト効率
- Hyperscale の最大サイズが 128 TB に拡張、log rate 150 MB/s、Elastic Pools 対応
- serverless の auto-pause delay 最小値が15分に短縮
- AI 関連の大幅強化
  - JSON data type、ベクトル型、ベクトル検索（DiskANN ベース）、Azure OpenAI 連携
- Copilot in Azure SQL Database で自然言語 → SQL

### App Service

- **App Service Environment v1/v2 は廃止**（2024年8月31日）→ v3 へ
- Premium v4 (Pv4) plan が public preview（2025年5月、Windows/Linux 両対応）
- **Sidecar 機能（Linux）が GA**（2024年11月）→ AI モデルや補助コンテナを横付けできる
- 自動スケーリングの改善、Cobalt（ARM）ベース VM 対応

## 軽め（要点だけ）

### Key Vault

- Managed HSM が GA
- RBAC（access policies からの移行）がデフォルト推奨に
- 証明書ローテーションの自動化、Private Link 対応の強化

### Blob Storage

- Lifecycle management の粒度向上
- **Cold tier** 追加（Hot / Cool / Cold / Archive）
- Object replication の拡張、SFTP 対応 GA
- Vaulted backup（不変バックアップ）

### Azure DNS

- 大きな破壊的変更は少なめ
- **Private Resolver**（旧 Private DNS Zone とは別の再帰DNSサービス）が GA
- エイリアス対応の拡張

## 久しぶりの復帰で踏みやすい"地雷"

改めて、離れている間に踏みやすいポイントを並べておきます。

1. **既存 runbook が AzureRM のまま動いていないか** — 2025年2月以降は動かない
2. **App Insights の Instrumentation Key → Connection String 移行**
3. **Hybrid Runbook Worker が Extension-based になっているか**
4. **Application Gateway V1 が残っていないか** — すでに廃止期限を迎えている
5. **Azure AD の呼称・PowerShell モジュールの世代** — 新旧混在に注意

## 復帰時にやったチェックリスト

- [ ] 対象リソースに廃止対象サービスが残っていないか棚卸し
- [ ] Terraform コードの `azurerm` provider バージョン確認
- [ ] runbook の Az モジュール対応状況を確認
- [ ] Application Gateway V1 が残っていれば移行計画

## まとめ

久しぶりに触ると「サービス名が変わっている」「モジュールが廃止されている」あたりで最初につまずきます。
機能追加は後から追えばよくて、**まず廃止・移行系を潰しておくと、既存環境がある日突然動かなくなる系の事故を防げる**というのが今回の学びでした。

繰り返しですが、廃止日は動くので、移行判断の前に公式ドキュメントで最新を確認してください。
