---
date: 2018-10-23T00:26:47.420Z
title: MezzanineにGA導入-他Azureあれこれ
category: others
tags:
  - Others
banner: ''
---

### ・Mezzanine への GoogleAnalytics の導入

Mezzanine Blog に Google Analytics タグ を組み込む  
http://tk2-202-10693.vs.sakura.ne.jp/blog/mezzanine-blog%E3%81%AB/

settings.py に 1 行追加するだけ。  
GOOGLE_ANALYTICS_ID= '**\*\*\***'

AnalyticsID=トラッキング ID のこと。UA から始まる ID。

gunicorn(アプリケーションサーバ)再起動だけしたらアクセス検知できてた。簡単。

### <br>・VSCode で AzureFunction を開発する準備

https://code.visualstudio.com/tutorials/functions-extension/getting-started

- Mac なので brew でローカル実行環境をインストール。  
  Code の拡張で「AzureFunction」「C#」が必要。C#入れないとデバッグでこける。

- Azure Function は秒単位の cron 指定が可能

- VSCode 上から Function のプロジェクト選んで、TImer 以外にもトリガーが選べる。

- F5 でデバック実行  
  Console にアクセス URL が発行された。デフォルトプロジェクトなので GET でパラメータ渡してアクセス。

![](/static/media/uploads/galleries/スクリーンショット_2018-10-23_00.41.36.png)

ルートディレクトリの画面こんなん。実際の AppFunction そのまんま  
ローカル実行できるのは便利だな

![](/static/media/uploads/galleries/スクリーンショット_2018-10-23_00.47.14.png)
