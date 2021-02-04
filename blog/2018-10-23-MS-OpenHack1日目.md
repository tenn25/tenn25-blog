---
date: 2018-10-23T21:47:38.420Z
title: MS OpenHack1日目
category: others
tags:
  - Others
banner: ''
---

MS OpenHack に行って来た。  
MicroSoft の外人イケメンエンジニアが付いてくれてアドバイスをもらいながらチームで課題を解決していくスタイル。

### Azure の FunctionApps と LogicApps について

FunctionApp は AWS Lambda みたいな FaaS のサービス  
言語は基本的に C#,JavaScript とか他プレビューの言語もあるけど C#一択だと思う。

Lambda のような従量課金プランもあるけど、暖気に時間がかかるという点は一緒。  
AppService の中の１機能なので WebApps(IIS の PaaS サービス)と同じように AppService プラン上で実行することもできる。  
こっちの方が起動が速いんだと思う(未検証)。ただしこっちは時間制で常時課金されてく。

トリガーは Timer Trigger、HTTP Torigger など複数から選択する。

VSCode に Extention を入れることで簡単にローカルのデバック実行可能。  
Azure 上へのデプロイも VSCode から可能。便利。

POST の動作確認は何かしらツールを使って確認するといい。Postman とか。

---

LogicApp は、Function やそれ以外の処理などを GUI 上で繋げるような形で一連のロジックを形成できる。

今回は、[リクエストの受付]→[FunctionApp の実行]→[レスポンスを加工して返す]  
という 3 ステップのロジックを組んで、LogicApp から Function を呼べた。

ちょっと操作に癖があるので最初とっつきにくい。  
慣れればとても簡単に組めると思う。

### VSCode と Azure の連携

VScode は[Command]+[Shift]+[L]で色々なコマンド操作ができる。  
Azure の Extention を入れてサブスクリプションと連携しておけば  
Azure:とか AzureFunction:と打つと Azure に対しての操作ができる。  
サブスクリプションの連携を切るときも[Azure: Sign Out]で可能。

### AzureDevOps の Git を使う。Clone から Push まで

AzureDevOps は、Wiki と Git と CI ツールとタスク管理がオールインワンになったすごいやつ

そこに Git リポジトリを作成。  
AzureDevOps にアクセスするユーザ作って権限は Basic にしとこう。  
Windows の人は HTTPS で Clone できたけど、  
Mac 勢は SSH 公開鍵を登録して git@のパスで Clone した。

\$ git clone git@ssh.dev.azure.com:v3/[組織名]/[プロジェクト名]/[リポジトリ名]  
AzureDevOps の Git のパスは ↑ みたいな構成になってる。

コマンドを打ったディレクトリの直下に[リポジトリ名]のフォルダが作られる。それと同じ階層に.git も作成される。

### メモ：Git のコマンド

ごちゃごちゃやってて一度.git ファイルが壊れてしまったので  
.git を消して以下の通りやり直した。

普段 GUI なので CLI からだと全く分からなくて助けてもらった・・  
ここら辺は最低限コマンド覚えときたい・・

\$ git init  
このコマンドでリポジトリフォルダの直下に.git が改めて作られる。

\$ git add .  
以下の階層のファイル全てをステージングへあげる。  
アスタリスクだっけと思ったらドットだった。

\$ git status  
状況をみたい時はこのコマンドで逐一確認。

\$ git commit -m "Create Rating"  
コミット時はコメント必須だった。message の m なんだろうか・・

\$ git remote add origin&nbsp;<span>git@ssh.dev.azure.com:v3/[組織名]/[プロジェクト名]/[リポジトリ名]</span>  
.git 削除したので Clone 先が分からなくなってる。  
リモートリポジトリを再度指定。

\$ git push -u origin master  
初回だったので Origin の master ブランチに push
