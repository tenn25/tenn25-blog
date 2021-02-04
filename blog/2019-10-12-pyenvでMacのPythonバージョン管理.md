---
date: 2019-10-12T21:36:49.420Z
title: pyenvでMacのPythonバージョン管理
category: others
tags:
  - Linux
  - Python
  - 開発環境
banner: ''
---

今まで venv や anaconda を使ってたので pyenv を使ってみる。

### インストール手順

```
> brew install pyenv
> brew install pyenv-virtualenv
> vi ~/.bash_profile

以下を追加
if which pyenv > /dev/null; then eval "$(pyenv init -)"    ; fi
if which pyenv-virtualenv-init > /dev/null; then eval "$(pyenv virtualenv-init -)"; fi
```

```
> pyenv install 3.7.4
> pyenv versions

MacBookAir:~ tenn25$ pyenv versions
* system (set by /Users/ryosuke/.pyenv/version)
  3.7.4

```

python 仮想環境を使いたいディレクトリで以下を実行

```
MacBookAir:~ tenn25$ cd /Users/ryosuke/Desktop/workspace/Django/
MacBookAir:Django tenn25$ python -V
Python 3.7.4
MacBookAir:Django tenn25$ cd ../
MacBookAir:workspace tenn25$ python -V
Python 2.7.10

```

### 所感

venv に比べて一度設定すれば、いちいち activate しなくて良いのはとても便利。
今後こっちメインに使ってこう。
Mac に入ってた Anaconda3 は消した・・・
