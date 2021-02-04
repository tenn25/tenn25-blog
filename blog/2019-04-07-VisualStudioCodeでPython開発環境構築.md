---
date: 2019-04-07T19:12:51.420Z
title: VisualStudioCodeでPython開発環境構築
category: others
tags:
  - Python
  - 開発環境
  - 読んだ本
banner: ''
---

## SoftwareDesign 4 月号 VSCode 特集メモ

### Python 開発環境構築

python3.6 が前提

##### Pyhton 拡張のインストール

「python」で検索して Microsoft 公式の python 拡張をインストール&再起動

##### VSCode で新しいプロジェクト用のフォルダを作成して開く。

File > Open

##### pyhton3 の環境を立ち上げる

参考  
https://www.python.jp/install/install.html

pipenv や virtualenv でも構わないが、
python3.3 からは python 自体に venv が含まれているので使える。

VsCode 上でターミナルを開くと、開いてるフォルダがカレントディレクトリとなるので  
そこで以下のコマンドを実行。

```
Linux
$python -m venv venv

Win
>python3 -m venv venv

```

これで、フォルダ直下に venv というこのプロジェクト専用の python 実行環境ができた！

なお、Windows 初回は以下を実行する。  
ローカルに保存されているスクリプトに実行権限を与える。

```
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

```

#####

左下の歯車> setting > WorkSpace Setting タブ

```
⌘ + , (Mac)
Ctrl + . (WIn?)
```

settings.json が作られる。  
ワークスペースの設定は個々にこれに設定する。

```
{
    // PythonのPATHをワークスペースの仮想環境にする
    "python.pythonPath": "venv/bin/python", //(Mac)
    ////// "python.pythonPath": "${workspaceFolder}\\venv\\Scripts\\python.exe", //(Windows)

    // 仮想環境にインストールしたファイルは監視対象から除外する
    "files.watcherExclude": {
        "**/venv/**": true
    },
}
```

##### 再起動

setting.json が反映され、このプロジェクトで使う Python 環境が変更される

##### ターミナルから使う Python 環境も変更

コマンドパレットを起動し、「インタプリターの選択(Select Interpreter)」を選択

```
Ctrl + Shift + P
```

venv を選択

一度ターミナルを閉じて(exit)、再度開く

```
(venv) MacBookAir:VSCodeProject tenn25$
```

環境が表示されてれば OK

仮想環境が有効にならない場合は以下コマンド
(カレントディレクトリはプロジェクトフォルダ)

```
> source venv/bin/activate

PS> ./venvScripts/Activate.ps1

```

参考  
[Using Python environments in VS Code](https://code.visualstudio.com/docs/python/environments)

---

##### Linter のインストール

PyLint が推奨されるが、かなりチェックが厳しいので Flake8 を使おう

お好みで pip のアップグレード

```
pip install --upgrade pip
```

flake8 のインストール

```

pip install flake8
```

##### PyLint を無効化して Flake8 を有効化する

settings.json 全体

```
{
    〜上記設定は省略〜

    //リンタでPyLintは使わない
    "Python.linting.pylintEnabled": false,
    //リンタでFlake8を使う
    "Python.linting.pylintEnabled": true,
}
```

適当なコードを書いてみてリンターが機能するか確認

```
def hello():
    print("Hello")
```

---

##### コードフォーマッタ

```
pip install black
```

settings.json を追記

```
{
    〜上記設定は省略〜


    // コードフォーマッタはBlackを使う
    "python.formatting.provider": "black",
    // Blackは貼り付け時の整形に対応していないので無効にする
    "python.formatOnPaste": false,
    // 1行の文字数を88文字とする
    "python.linting.flake8Args": ["--max-line-length", "88"],
}
```

試しに長い引数を持つ関数を作ってみる

```
def many_argument_function(
    first_name: str, middle_name: str, last_name: str, city: str, state: str, zip_code: int, country: str, phone: str
):
    pass

```

フォーマットかける

```
Ctrl + Shift + F

```

フォーマットされたら OK

```
def many_argument_function(
    first_name: str,
    middle_name: str,
    last_name: str,
    city: str,
    state: str,
    zip_code: int,
    country: str,
    phone: str,
):
    pass

```

##### Jupter Notebook をつかう

同様に VsCode では October2018 から Jupyter をサポート

データの可視化ができるよ

```
pip install matplotlib

```

以下のファイルを作成

```
# %%

import matplotlib.pyplot as plt

flg, ax = plt.subplots()
ax.plot([2, 1, 3])
```

[# %%]から次の[# %%]までが、1 つのセルと認識される。

RunCell を実行すると、右にグラフのウィンドウが表示されれば OK。

##### Jupyter 形式で出力

グラフのウィンドウの保存アイコンから、.pyinb 形式で保存

##### 保存した.pyinb ファイルを VSCode で開く

開くと Python コードで開くかと聞かれるので[Import]を選択

```
Python Extention for VSCodeのメリット

VSCodeでデバッグやIDEの機能が使える
なおかつJupyterのによる可視化やPython以外のコードも使える

```

##### 正規分布の確率密度関数を描画

新しいファイルで同様のことを行う。

```
# %%

import math
import random
import matplotlib.pyplot as plt


def pdf(x, mu, sigma):
    sigma_pow = sigma * 2
    return (
        1
        / math.sqrt(2 * math.pi * sigma_pow)
        * math.exp(-(x - mu) ** 2 / 2 * sigma_pow)
    )


# pdf関数を可視化して確認


x = [x * 0.01 for x in range(-500, 500)]
y = [pdf(x_, 0, 1) for x_ in x]
fig, ax = plt.subplots()
ax.plot(x, y)
ax.hist([random.gauss(0, 1) for _ in range(10000)], bins=20, density=True)


```

描画すると少し正規分布とずれているので、デバッグする。
ブレークポイントを入れて変数の値を見ながら意図した動きをしてるか確認しよう。

```
誤り)     sigma_pow = sigma * 2
正しい)     sigma_pow = sigma ** 2
```

正規分布にしたがってヒストグラムが表示されたら OK!!!!

---
