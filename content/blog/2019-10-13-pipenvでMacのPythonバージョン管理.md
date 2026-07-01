---
title: pipenvでMacのPythonバージョン管理
date: '2019-10-13T02:15:25.420Z'
slug: pipenvで-macの-pythonバージョン管理
categories:
  - others
tags:
  - Python
  - Linux
  - 開発環境
---
最近は pipenv が良いよって Python できるギャル()の方に教えてもらったので早速つかってみる

参考 URL

https://qiita.com/sl2/items/1e503952b9506a0539ea

### インストール手順

brew で入れる。いまいちこのへんのパッケージマネージャがよく分かってない。

```
> brew install pipenv

==> Summary
🍺  /usr/local/Cellar/sqlite/3.29.0: 11 files, 3.9MB
==> Installing pipenv dependency: python
Error: Xcode alone is not sufficient on Mojave.
Install the Command Line Tools:
  xcode-select --install

エラーが出たので以下を実行
> xcode-select --install

再度
> brew install pipenv

```

```
which pip
/Users/******/.pyenv/shims/pip

 which pyenv
/usr/local/bin/pyenv

which pipenv
/usr/local/bin/pipenv


この辺消す
> brew uninstall pyenv-virtualenv
> brew uninstall pyenv

bash再起動

> which pip
/usr/local/bin/pip

which pipenv
/usr/local/bin/pipenv



```

pyenv で使ってたファイルも消す

```
> rm -rf requirements.txt
> rm -rf .python-version
```

### 使い方

プロジェクトファイルで以下

```
pipenv install django
pipenv install --dev flake8
pipenv install --dev autopep8
```

Pipfile と Pipfile.lock が作られる

PipFile には以下を追記。エイリアスを指定して任意のスクリプトを設定できる。

```
[scripts]
start = "python app.py"
lint = "flake8 ."
fix = "autopep8 -ivr ."

```

スクリプトは pipenv run コマンドで実行  
その他フォーマットや静的解析。  
インストールパッケージのセキュリティチェック  
パッケージの依存関係の確認

```
pipenv run lint
pipenv run fix
pipenv check
pipenv graph
```

Python 仮想環境を実行  
プロジェクトフォルダで以下を実行

```
> Python -V
Python 2.7.10

> pipenv shell


裏では以下が実行されているよう。
裏はvirtualenvなんだね。
. /Users/*******/.local/share/virtualenvs/SampleApp-Ez1U75i8/bin/activate


> Python -V
Python 3.7.4

Cntl+Dで抜けられる。
```

すでに Pipfile がある場合は以下

```
> pipenv install

```

