---
date: 2018-10-25T22:23:52.420Z
title: MS OpenHack3日目
category: others
tags:
  - Others
banner: ''
---

3 日目。大満足でした。

### サーバーレスアーキテクチャ

Azure のサーバーレスサービスにも色々あるが、  
それぞれの使いわけやコンポーネントの分け方が難しい。

「これをやるには、このサービスを使わないといけない」というのはないので  
適材適所でベストな物を選択する必要がある。

まずは LogicApps をベースに使ってくのが良さそう。  
プログラミングしなくても、ループや条件分岐を含めながら、  
様々な Azure リソースを繋いでワークフローを作成できる。

![](/static/media/uploads/galleries/スクリーンショット_2018-10-25_22.23.30.png)

![](/static/media/uploads/galleries/スクリーンショット_2018-10-25_22.22.21.png)

GUI による設定なので、文字列と変数アイコンが混在する独特な見た目。  
正直、最初は非常にとっつきにくい。これはこれでつらい。  
文字列操作や関数を使うときに記述方法がわからず、みんな躓くと思う。  
（公式リファレンスをくまなく読み込むと分かってくる気がする）

ノウハウとしては、  
LogicApp で難しそうな処理を FunctionApp として外に出して  
LogicApp から呼び出してあげると良さそう。

非同期処理や、複数処理を待機するような処理は悩むが、  
LogicApp の Batch&nbsp;message でフロント、バックエンドと処理を 2 つに分けたり  
Durable Function を使うと実現できそうだった。

(参考：Azure Logic Apps でのメッセージの送信、受信、バッチ処理)  
https://docs.microsoft.com/ja-jp/azure/logic-apps/logic-apps-batch-process-send-receive-messages

とは言え、これも方法が色々考えられそうなので、適材適所。  
それぞれのサービスの得意不得意を抑えると良い判断ができそう。

正直 AWS にも全然負けてないと思う。  
EventGrid、EventHub、Logic App、FunctionApp あたりは  
研究の余地ありだと思いました。

OpenHack、行ってよかったです。
