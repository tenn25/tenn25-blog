---
title: "AIにブログを書かせる前に整えた、機密情報をPushさせないための多層防御"
date: 2026-07-05T00:10:00+09:00
slug: "blog-secret-push-protection"
categories: ["開発環境"]
tags: ["Claude", "GitHub", "gitleaks", "セキュリティ"]
---

最近、ブログ記事の下書きや執筆を AI(Claude)に任せる運用を始めました。調査メモから記事がスルスル出てくるのは快適なのですが、一つ怖いことがあります。**機密情報の混入**です。

APIキーのような分かりやすいものだけではありません。メモの中には職場のメールアドレス、社名や案件名といった「トークン形状をしていない機密」が普通に混ざっています。AI がそれを拾って記事に含めてしまい、そのまま公開リポジトリに push されたら手遅れです(公開リポジトリでは push された瞬間にクローラーに拾われると考えるべきです)。

そこで「AI が何を書いてきても、機密は機械的に止まる」状態を作りました。[前回のハーネスエンジニアリングの記事](/blog/claude-code-harness-engineering/)と同じ思想で、**AI へのお願いではなく、仕組みで止める**構成です。

## 全体像: 4層防御

```
commit ──✋ ① gitleaks pre-commit フック(ローカル)
push ────✋ ② GitHub Push protection(サーバー側で拒否)
公開後 ──── ③ Secret scanning alerts(履歴全体を常時監視)
         └─ ④ パートナー自動通知(AWS等がキーを自動失効)
```

重要なのは役割分担です。②③④は GitHub の機能で、既知プロバイダの API キー形式(AWS、OpenAI、GitHub PAT など)を高精度で捕まえてくれます。しかし**社名・案件名・メールアドレスのような「自分にとっての機密」は一切検知しません**。カスタムパターン機能は組織アカウント+有料プランが必要で、個人リポジトリでは使えないためです。

つまり、個人 NG ワードの防衛線は①の gitleaks だけ。ここが本丸になります。

## Layer 0: コミットの author 情報を noreply 化

コンテンツの前に、まず**メタデータからの漏洩**を塞ぎます。git の `user.email` が未設定のまま新しいマシンでコミットすると、ホスト名ベースのアドレスや、うっかり設定した実メールが author として記録されます。これは記事本文と違って目に見えないので気づきにくい。

GitHub には実メールを隠すための noreply アドレス(`<ID>+<ユーザー名>@users.noreply.github.com`)があります。ID は `https://api.github.com/users/<ユーザー名>` で確認できます。

```bash
git config --global user.name "<ユーザー名>"
git config --global user.email "<ID>+<ユーザー名>@users.noreply.github.com"
```

noreply アドレスでもコントリビューション(草)は正しく紐づきます。あわせて GitHub の Settings → Emails で次の2つを ON にしておきます。

- **Keep my email addresses private** — Web 上の操作(マージ等)でも noreply が使われる
- **Block command line pushes that expose my email** — 実メール入りコミットの push をサーバー側で拒否

## Layer 1: gitleaks でコミット前に止める

[gitleaks](https://github.com/gitleaks/gitleaks) は OSS の秘密情報スキャナで、最大の強みは **pre-commit フックとしてローカルで動かせる**ことと、**カスタムルールを無料で書ける**ことです。

### 設計判断: 設定ファイルを2段に分ける

ここが今回一番の学びでした。NG ワード(社名や自分のメールアドレス)を検知したいわけですが、**公開リポジトリの設定ファイルに NG ワードを書くと、それ自体が情報公開になってしまう**のです。

そこで設定を2つに分けました。

| ファイル | git 管理 | 内容 |
| --- | --- | --- |
| `.gitleaks.toml` | コミットする | 組み込みルール(APIキー等150種+)の継承、除外パス |
| `.gitleaks.local.toml` | **.gitignore 済み** | 個人 NG ワード(メール・社名・案件名) |

公開してよい方の `.gitleaks.toml` はこれだけです。

```toml
title = "blog gitleaks config"

[extend]
useDefault = true   # 組み込みルールを継承

[[allowlists]]
description = "テーマ(submodule)のサンプルとビルド出力は対象外"
paths = ['''themes/''', '''public/''']
```

git 管理外の `.gitleaks.local.toml` に、本当の NG ワードを書きます(以下はダミーです)。

```toml
title = "blog local NG words"

[extend]
path = ".gitleaks.toml"   # 公開設定を継承(組み込みルールも効く)

[[rules]]
id = "work-email"
description = "職場ドメインのメールアドレス"
regex = '''(?i)[a-z0-9._%+-]+@example\.co\.jp'''

[[rules]]
id = "personal-ng-words"
description = "社名・案件名など。大文字小文字区別なし・部分一致"
regex = '''(?i)(company-a|project-x)'''
```

ポイントは `(?i)` で大文字小文字を無視し、**あえて単語境界を付けない**こと。複合語(サービス名+TOWN のような派生名)にもマッチさせるためです。過剰検知は許容し、すり抜けは許容しない――フェイルセーフ側に倒します。

### pre-commit フック

`.githooks/pre-commit` を作り、ステージ済みの差分をスキャンします。ローカル設定があればそちらを優先する作りです。

```bash
#!/usr/bin/env bash
set -uo pipefail

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "[pre-commit] gitleaks が見つかりません (brew install gitleaks)" >&2
  exit 1
fi

config=".gitleaks.toml"
[ -f ".gitleaks.local.toml" ] && config=".gitleaks.local.toml"

exec gitleaks git --pre-commit --staged --redact --verbose --config "$config"
```

`.git/hooks/` はバージョン管理できないので、リポジトリ内の `.githooks/` に置いて切り替えます(クローンごとに1回)。

```bash
git config core.hooksPath .githooks
```

### CI でも保険を掛ける

Web UI から直接編集した場合やフック未設定のクローンからの push に備えて、GitHub Actions でも全履歴をスキャンします。

```yaml
name: gitleaks
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

CI 側にはローカル設定(NG ワード)が無い点は割り切りです。標準的な秘密情報は CI が、個人 NG ワードは手元のフックが守る、という分担になります。

## 検証: 「動くはず」で終わらせない

セキュリティ機構は発火テストをして初めて完成です。3段階でやりました。

1. **直接テスト**: 偽の API キーや NG ワードを含むファイルをステージし、フックを直接実行して検知と exit code を確認
2. **実地発火テスト**: そのまま `git commit` を実行し、実際にブロックされることを確認(テスト後にファイル削除)
3. **全量スキャン**: `gitleaks git`(全履歴)と `gitleaks dir`(作業ツリー)を実行

やってみて分かったハマりどころが3つあります。

- **テスト用の偽キーはエントロピー閾値に注意**。`AKIA` + 単純な文字列で作った偽 AWS キーは、ランダムさが足りず組み込みルールの閾値未満でスルーされました。テストには本物っぽいランダム文字列が必要です
- **NG ワードを消す修正コミットはちゃんと通る**。gitleaks は追加行しか見ないので、削除差分はブロックされません(そうでないと修正すらできなくなるところでした)
- **コミットメッセージは対象外**。フックが見るのはステージ差分だけなので、メッセージに NG ワードを書いたら素通りします。「◯◯を削除」のようなメッセージを書きがちなので注意

### 実際に見つかった

全量スキャンの結果、**7年前の記事のコマンド例に、案件名入りのファイル名が含まれていた**ことが分かりました。5年間公開され続けていたことになります。トークン形状をしていない機密は GitHub では絶対に検知されないので、カスタムルールを書いて初めて見つかった形です。記事は修正済みですが、「既に公開してしまっているものの検出」という意味でも全量スキャンはやる価値がありました。

## Layer 2-4: GitHub 側の設定

リポジトリと個人アカウントの両方に設定があり、全部で5箇所です。

| 設定 | 場所 |
| --- | --- |
| Secret Protection (alerts) | リポジトリ Settings → Advanced Security |
| Push protection | 同上 |
| Push protection for yourself | 個人 Settings → Code security |
| Keep my email addresses private | 個人 Settings → Emails |
| Block command line pushes that expose my email | 同上 |

細かい気づきを2つ。

- **UI のボタンは「実行できる操作」を表示します**。「Disable」と表示されていれば現在 ON です。最初逆に読んで混乱しました
- **「Push protection for yourself」はアカウントに紐づく設定**です。手元の AI エージェントが自分の認証情報で push する分には効きますが、GitHub App や CI(`GITHUB_TOKEN`)経由の push には効きません。記事作成の自動化を見据えるなら、**リポジトリ側の Push protection も ON** にして「誰が・何が push しても効く」状態にしておくべきです

## 調査: コミットの author メールはどこまで見えるのか

過去のコミットに実メールが残っている場合、どこまで「見つかる」のかも調べました。

- GitHub のフリーテキスト検索やドメインのワイルドカード検索(`author-email:*@example.co.jp`)では**出てきません**
- ただし完全一致(`author-email:taro@example.co.jp`)のコミット検索では出ます。私の場合、昔の複数の公開リポジトリ・数十コミットに職場メールが残っていました。アドレスを知っている人(例えば同僚)が検索すれば、個人アカウントとの紐付けは全部見えます
- コミット URL に `.patch` を付ければ誰でも生のメールアドレスを見られます(API や clone 後の `git log` も同様)
- GH Archive のような GitHub 全体の公開イベントデータセットには**ドメイン横断で**記録が残っており、OSINT 系のメール収集ツールが見るのはこちらです

つまり「偶然見つかるリスクは低いが、調べる人には確実に見つかる」状態。過去の履歴から消すには `git filter-repo` での書き換え + force push が必要で、さらに GitHub 側のキャッシュ(旧 SHA 直打ちでの閲覧)の完全消去はサポートへの依頼が要ります。外部データセットの過去分は消せません。**「後から消す」のコストが異常に高いからこそ、入口で止める仕組みに投資する価値がある**、というのが結論です。

## まとめ

- AI に書かせる時代の機密対策は「AI を信頼するか」ではなく「**混入しても機械的に止まるか**」で設計する
- GitHub の保護機能は API キー特化。**社名・案件名・メールは gitleaks のローカルカスタムルールでしか守れない**
- NG ワード定義は git 管理外に分離する(公開設定に書いたらそれ自体が漏洩)
- author メールという見えない漏洩経路も忘れずに(noreply 化 + メール保護設定)
- 仕込んだら必ず発火テスト。ついでに全履歴スキャンをすると、過去の混入も見つかる

ちなみにこの記事自体も AI が下書きしていますが、公開前に今回仕込んだ gitleaks フックを通過しています。仕組みが自分の記事を検閲してくれる、というのはなかなか気分の良いものです。

## 参考

- [gitleaks](https://github.com/gitleaks/gitleaks)
- [GitHub Secret scanning ドキュメント](https://docs.github.com/en/code-security/secret-scanning)
- [前回: Claude Code ハーネスエンジニアリング入門](/blog/claude-code-harness-engineering/)
