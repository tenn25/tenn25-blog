---
date: 2018-10-29T21:46:46.420Z
title: AzureDevOpsとAzureADの関係と初期設定
category: others
tags:
  - Others
banner: ''
---

### 基本知識

- AzureDevOps には組織＞プロジェクトという単位がある。
- 1 プロジェクトごとに人数やビルド時間の制限があるが、基本無料
- 作っただけだとサブスクリプションとも連携されてない。課金するには連携が必要
- AzureDevOps は AzureAD との連携が必要。

### 手順だけ箇条書きでメモ

1. Azure 上のアカウント(必ずしも MS アカウントである必要はない)で[AzureDevOps](https://azure.microsoft.com/en-us/services/devops/?nav=min)にアクセス

2. (AzureDevOps 側)Organization(組織)を作成する。

3. (AzureDevOps 側)Project を作成する。

4. (Azure ポータル側)Organization を作ったユーザログインして[Devops]で検索。すると作った組織が表示されてる。

5. (Azure ポータル側)AzureAD の連携ができてなければする。サブスクリプションの連携ができてなければする。

6. (AzureDevOps 側)AzureAD と連携が完了すると、他ユーザを追加できるようになる。[Organization Settings]から[Security]を選択。

7. (AzureDevOps 側)権限 hogehogeAdministrators に[Add]から AzureAD 上のユーザかグループを追加できる。

8. (AzureDevOps 側)他ユーザでログインすると、Organization が一覧に表示されてるので利用できる。

9. (AzureDevOps 側)その他 ProjecSettings から User 追加など可能(無料枠 5 人まで)

### 番外編

- (Azure ポータル側)DevOps で検索して、そこからプロジェクトのテンプレートを選んで作成することもできるっぽい(やったことない)

以上です。
