---
date: 2018-10-24T20:59:49.420Z
title: MS OpenHack2日目
category: others
tags:
  - Others
banner: ''
---

昨日に引き続き。Azure まみれな日々。

### AzureDevOps の仕様変更に怯えないために

AzureDevOps(旧 VSTS)は 3 週間周期くらいで UI や機能のアップデートがかかる。  
たまに UI の変化っぷりがえげつないので、完全に使い方が分からなくなる。

そんな時は、Twitter で愚痴らず右上の自分のアイコンから[Preview Features]を開こう。  
該当の新機能を OFF にすれば、とりあえず前の UI に戻る。  
本機能として取り込まれる前に使い方を確認するべき。

仕様変更とは別で、Azure 界隈は UI 上のバグもたまにある。。  
今日は AzureDevOps のビルドパイプライン作成中に不具合らしいものと遭遇した。  
テンプレートからパイプラインを作ったところ、プルダウンメニューに表示されるはずのものが出なかった。

手動で作り直したら大丈夫だったので、  
テンプレートを選択してある程度の型が構築されるような機能は気をつけたほうがいいという知見を得た。

### AppInsights のデータ分析

AWS でいう CloudWatch みたいなやつ。ただ、取れる情報の幅がかなり広い。  
個人的に Azure で一番評価されるべきだと思ってる(運用目線でかなり頼りになる)

何もしなくてもグラフィカルにいろんなデータが取れるが、  
AppInsights ＞概要＞分析　から、KQL という独自のクエリ言語で好きにログ分析する方法を学んだ。

今回 FunctionApp の監視ログに対して実行した例  
10 時間以内に実行された Function ごとの実行回数と、平均実行時間を棒グラフで表示。

---

requests |
project timestamp, name, duration |
where timestamp > ago(3d) |
summarize count() ,avg(duration) by name|
render … kind=unstacked

---

![](/static/media/uploads/galleries/スクリーンショット_2018-10-24_20.46.32.png) </span>

公式で解説動画が無料で見れるらしい。英語だけど  
https://azureupdatesj.wordpress.com/2018/07/24/free-query-language-course-la-ai/

いまいち、句ごとに|が入る記法に納得いかない w

### API Management による API 管理

AWS でいう API Gateway みたいなやつ。  
エンドポイントがバラバラの LogicApps や AppFunction などを  
REST API チックにまとめることができる。(フロントエンドとバックエンドの紐付けをして整理整頓する感じかな)

Swagger でインポート、エクスポートできるあたりは他と一緒。  
特別ここが凄い！と思った点は今の所ないのだけど、Azure は FunctionApp が強いのでそれらを使ってくなら必然的に使うことになると思う。

### Durable Function について

AWS でいう、Lambda みたいなやつ。  
Lambda わかる人は以下の公式ドキュメントの図だけで良いので流し見してほしい。  
https://docs.microsoft.com/ja-jp/azure/azure-functions/durable-functions-overview

基本的に Funtion は 1 機能(数秒から数分)を処理するのみだけど、  
複数の処理を簡単に繋げる仕組みが備わってる。全体で数時間かかるような一連の処理も作成できそう。

・関数チェーン…A→B→C という決まった順序で複数実行する。  
・ファンイン/ファンアウト…A,B,C すべて終わったら D を実行するという処理が作れる。  
・非同期 HTTP API…時間のかかる処理を非同期で行うことができる。  
&nbsp; &nbsp; 参考：&nbsp;https://blog.shibayan.jp/entry/20180130/1517301227  
・監視…特定の条件を満たすまでポーリングする。  
・人による操作…人間の「承認ボタンポチー」を Function と Function の間に挟める。

こういうピタゴラスイッチってお手製だと大変だったけど  
中身のロジックだけ作れば良くなるので楽だし、できることの幅も広がった。
