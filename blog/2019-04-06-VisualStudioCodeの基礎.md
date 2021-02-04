---
date: 2019-04-06T01:28:55.420Z
title: VisualStudioCodeの基礎
category: others
tags:
  - 開発環境
  - 読んだ本
banner: ''
---

## SoftwareDesign 4 月号 VSCode 特集メモ

### Visual Studio Code とは

- Microsoft が提供しているマルチプラットフォームのコードエディタ
- Electron で作られており、Win/Mac/Linux で動くデスクトップアプリ
- コードネーム「Monaco」と呼ばれているプラットフォームに依存しない開発環境作成プロジェクトの成果物として生まれた
- 正式版がリリースされてこの 4 月でちょうど 3 年目

インストールはこちら  
[https://code.visualstudio.com/download](https://code.visualstudio.com/download)

---

### 機能概要

- 拡張機能が豊富で自由にカスタマイズできる(1 万以上)
- フォルダやファイル群を「ワークスペース」として扱うことができ、ワークスペース毎に固有設定が可能
- ワークスペース配下にあるファイルを判別し、「言語モード」にしたがって言語にあった機能を提供する
  - インテリセンス
  - デバッグ機能
  - パラメータヒント
  - コードの折りたたみ、フォーマット
  - 変数の定義場所、参照場所の表示
  - バージョン管理(Git,VSTS,SVN など)
  - ターミナルとしての機能(Powershell や bash)

これらの特徴によって実質 IDE(統合開発環境)と同等の機能が提供される

---

### 基本設定

- ショートカット  
  ショートカット一覧の PDF が表示される。

```
Help > Keyboard Shortcuts Reference(GUI)
Ctrl + K → Ctrl + R(Win)
```

- ショートカットキー設定

```
Ctrl + K → Ctrl + S(Windows)
⌘ + K → ⌘ + S(Mac)
```

- キーバインド  
  拡張機能として様々なキーマップが用意されている。  
  Vim,Emacs,IntelliJ,VisualStudio,Eclipse,Atom,SublimeText など

```
Ctrl + K → Ctrl + M(Windows)
⌘ + K → ⌘ + M(Mac)
```

- その他設定

グローバル設定とワークスペース毎の設定が可能。  
内部的には JSON ファイルで管理される。

```
Ctrl + ,(Windows)
⌘ + ,(Mac)
```

---

- ターミナル表示  
  よく使うので覚えたい。  
  bash や powershell のコンソールを表示。

```
Ctrl + @(WIndows)
Ctrl + Shift + @ (Mac)
```

※powershell で未入力時にバックスペース打った時の音がうざいので消したい方はこちら  
[https://qiita.com/mazu/items/4827b04ed532d33194c3](https://qiita.com/mazu/items/4827b04ed532d33194c3)

---

### コーディング関連の拡張機能

言語ごとに色々な拡張機能がある。  
よくある主な機能は以下の通り

- シンタックスハイライト
  構文に色をつけて見やすくする

- コードナビゲーション
  定義の移動  
  参照の検索

- インテリセンス
  クラスのメンバー一覧  
  パラメータの保管

- リンティング
  静的解析  
  コードの問題点を検出

---

### カーソル操作

- マルチカーソル
  複数行にまとめて同じ文字を追加するときなど

```
Alt + 複数行をクリック選択
```

- ボックス選択
  矩形選択

```
SHft + 矢印キー
```

---

### コードスニペット

自分で好きな文字を登録して、決まったコードを即時に入力する。(インテリセンス一覧に含まれる)  
やりかた要確認

---

### リファクタリング

JavaScript や TypeScript はデフォルトで搭載。他は拡張機能で。  
リファクタリングとリンティングをまとめて「コードアクション」と呼ぶ。

マークが出てそれをクリックすると自動でコードを直してくれるものの総称

```
Ctrl + .(Win)
⌘ + . (Mac)
```

- メソッドの抽出
- 変数の抽出
- シンボルのリネーム
  テキストを選択して F2

---

### デバッグ

```
左メニューのデバッグアイコン
Ctrl + Shift + d (Windows)
⌘ + Shift + d (Mac)

```

##### launch.json

- デバッグ構成の設定はこのファイルに書く。
- 設定は複数追加でき、異なるソース、異なる言語、SDK などを使い分けてデバッグができる

##### デバッグの開始

F5

---

### 言語のサポート

- 現在 51 言語
- 拡張子で判断するが、以下のコマンドからでも言語モードを切り替えられる。

```
Ctrl + K → M (Windows)
⌘ + K → M (Mac)
```

---

### C#/.NET Core のサンプルアプリを作る

- .NET Core3.0(1 プレビュー)のインストール
  [https://dotnet.microsoft.com/download/dotnet-core/3.0](https://dotnet.microsoft.com/download/dotnet-core/3.0)

- OmniSharp(VS Code の C#拡張)のインストール

```
> dotnet new wpf -o myWpfCoreApp

> cd myWpfCoreAp
> code .
```

```
> dotnet build
```

- tasks.json にビルドのタスクを書く

```
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label" : "build",
            "command" : "dotnet",
            "type": "process",
            "args" : [
                "build",
                "${workspaceFoler}/myWpfCoreApp.csproj"
            ],
            "problemMatcher": "$msCompile"
        }
    ]
}
```

F5 でデバッグ実行できれば OK!!!

---

### VSCode から Git を使う

#### Github 登録

[https://github.com/](https://github.com/)

新規にリポジトリを作成

#### Git をインストール

[https://git-scm.com/download](https://git-scm.com/download)

#### VSCode のターミナルからプッシュ

```
Gitにコミットしたいプロジェクトのルートディレクトリで実行
PS > git init

```

.gitignore ファイル作成
以下は例

```
bin
obj
```

各言語の,gitignore のサンプルはググったらでてくる。
[https://github.com/github/gitignore](https://github.com/github/gitignore)

github に push するまで

```
PS > git config --global user.email "メールアドレス"
PS > git config --global user.name "ユーザ名"
PS > git add .
PS > git commit -m "first commit"
PS > git remote add origin https://github.com/tenn25/myWpfCoreApp.git
PS > git push -u origin master

Githubのユーザ名、パスワードを入力
Githubに反映されてれば完了
```

### .NetCore WPF のアプリに手を加える

参考  
[https://tech.yayoi-kk.co.jp/entry/2018/12/11/103322](https://tech.yayoi-kk.co.jp/entry/2018/12/11/103322)

---

### Live Share 機能を使う

拡張機能から「Live Share」をインストール

なにかワークスペースを開く

VSCode 下側の「Live Share」を押す →MS アカウントか Github アカウントでログイン

URL がクリップボードに保存されるので、シェアしたい人に共有。

シェアされた側も同様に拡張機能をインストールして URL にアクセス。  
→ 手元のワークスペースとして表示される。

#### メモ

- ログインしなくれも閲覧のみとして共有を受けられる。
- 音声チャットもあるとかないとか・・・？
- ShareServer という機能で、共有された側も localhost でデバッグ実行が確認できる？？
