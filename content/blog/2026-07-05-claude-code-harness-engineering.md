---
title: "Claude Code ハーネスエンジニアリング入門 ― 読み取り専用ワークスペースの作り方"
date: 2026-07-05T00:00:00+09:00
slug: "claude-code-harness-engineering"
categories: ["開発環境"]
tags: ["Claude", "ClaudeCode", "Azure", "セキュリティ"]
---

Claude Code でクラウド環境（今回は Azure）を調査するための**読み取り専用ワークスペース**を作りました。コスト分析やリソースの棚卸しは AI に任せたい。でも `az group delete` を打たれる可能性が 0.1% でもあるなら本番サブスクリプションには繋げない――そういう場面の話です。

ポイントは、AI への「削除しないでね」という**お願いではなく、実行環境（ハーネス）側で更新操作を機械的にブロックする**こと。構築の過程で学んだ設計パターンと検証方法をまとめます。

## ハーネスエンジニアリングとは

Claude Code の安全策は、大きく2種類に分かれます。

| 種類 | 例 | 強制力 |
| --- | --- | --- |
| モデルへの指示 | CLAUDE.md、プロンプト | ソフト（モデルが従う前提） |
| ハーネスによる強制 | permissions、hooks、sandbox | ハード（モデルの判断を経ない） |

後者を設計するのが、ここで言う「ハーネスエンジニアリング」です。

LLM は原理的に指示を誤解・見落としうるので、「絶対に起きてはいけない操作」を指示だけで防ぐのは筋が悪い。**方針はモデルに伝えつつ、最後の砦はモデルの判断を経ないハーネス側に置く**、という役割分担が基本になります。

## 3層防御のパターン

読み取り専用ワークスペースは、次の3層で構成しました。

```
Layer 1: CLAUDE.md          … 方針をモデルに伝える（意図の共有）
Layer 2: permissions        … コマンド文字列のパターン照合で allow/deny
Layer 3: PreToolUse フック   … 実行直前にスクリプトで精密判定
```

- **CLAUDE.md**: プロジェクトルートに置くとセッション開始時に自動で読み込まれます。「許可される操作／禁止される操作」を明文化しておくと、モデルが迷ったときに確認してくれるようになります
- **permissions**: `.claude/settings.json` に定義。ハーネスがツール実行前にパターン照合します
- **hooks**: 正規表現など任意のロジックで判定できる最終防衛線です

## permissions の重要仕様

`.claude/settings.json` の `permissions.allow` / `deny` について、設計に効いてくる仕様を[公式ドキュメント](https://code.claude.com/docs/en/permissions)で確認しました。ここを誤解すると設計が破綻します。

### 1. 評価順は deny → ask → allow で、deny が常に勝つ

パターンの具体性は関係ありません。`Bash(az *)` を deny に入れると、`Bash(az account show)` を allow していても効かなくなります。

つまり **deny には例外を作れません**。誤検知しやすいパターンを deny に入れると、抜け道を作る手段がなく詰みます。

### 2. ワイルドカード `*` は先頭・中間・末尾どこでも置ける

例えば `Bash(az * delete*)` で「az の任意サブコマンドの delete」を弾けます。

### 3. 複合コマンドは分割して個別評価される

`a && b`、`a | b`、`a; b` のような複合コマンドは、分割されてそれぞれ評価されます。allow 済みのコマンドに危険なコマンドを連結しても抜けられません。

### 4. フックで許可を広げることはできない

PreToolUse フックが allow を返しても、deny/ask ルールはスキップされません。フックによる deny は最終的に有効ですが、逆方向（フックで permissions の deny を上書きして許可する）はできない設計です。

## 設計パターン: deny とフックの役割分担

更新系操作を「動詞ベース」でブロックする場合、permissions のパターン照合（substring match）と、フックの正規表現では得意分野が違います。

**permissions の deny には、誤検知の心配がない明確に破壊的な動詞だけ**を入れます。

- `create` / `delete` / `update` / `purge` / `restart` など
- ⚠️ 短い動詞は substring 誤検知に注意。`set` は `--offset` に、`start` は `--start-date` にマッチしてしまいます。前述のとおり deny には例外を作れないので、こういう動詞を deny に入れると読み取り系コマンドまで巻き添えで死にます

**フック側では、単語境界つき正規表現で精密に判定**します。

- 境界の文字クラスに `-` を含めると、`--enable-xxx` のようなフラグ名を動詞判定から除外できます
- ローカル操作（`az account set` や `az extension add` など、クラウドに影響しないもの）は判定前に sed で除去して例外化します

### settings.json の骨格

```json
{
  "permissions": {
    "allow": [
      "Bash(az login*)",
      "Bash(az account show*)",
      "Bash(az costmanagement query*)",
      "Bash(az graph query*)",
      "Bash(az * list*)"
    ],
    "deny": [
      "Bash(az * create*)",
      "Bash(az * delete*)",
      "Bash(az * update*)",
      "Bash(az deployment *)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/az-guard.sh\"",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

allow に読み取り系（`list` / `show` / `query` など）を並べておくと、調査系コマンドは確認プロンプトなしで通るようになり、使い勝手が大きく変わります。

### ガードスクリプトの骨格

フックは stdin から JSON（`tool_input.command` など）を受け取り、deny したいときは `permissionDecision: "deny"` を JSON で標準出力に返します。

```bash
#!/bin/bash
set -uo pipefail
cmd=$(jq -r '.tool_input.command // ""')

# 対象コマンドを含まなければ素通し
printf '%s' "$cmd" | grep -qE '(^|[^[:alnum:]_./-])az[[:space:]]' || exit 0

deny() {
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$1"
  exit 0
}

# REST 直叩きの変更系メソッドも忘れず塞ぐ（照会用の POST は通す）
printf '%s' "$cmd" | grep -qiE 'az[[:space:]]+rest[^;|&]*(--method|-m)[[:space:]=]+["'"'"']?(put|patch|delete)' \
  && deny "az rest の変更系メソッド"

# ローカル操作を除外してから、単語境界つきで更新系動詞を検出
checked=$(printf '%s' "$cmd" | sed -E 's/az[[:space:]]+account[[:space:]]+set([^[:alnum:]_-]|$)/__local__ /g')
MUTATING='(create|delete|update|set|add|remove|start|stop|restart|scale|deploy|import|export|assign)'
printf '%s' "$checked" | grep -qE "(^|[^[:alnum:]_-])${MUTATING}([^[:alnum:]_-]|\$)" \
  && deny "更新系動詞を検出"

exit 0
```

（`MUTATING` の動詞リストは抜粋です。実際は対象サービスのコマンド体系を見ながら育てていきます）

ポイントは2つ。

- **REST API 経由の抜け道も塞ぐ**。`az rest --method put` や、URL 末尾の `/start` のようなアクション呼び出しも動詞判定に引っかかる形にしておきます
- **誤検知の方向を意識する**。deny はフェイルセーフ側の誤検知（過剰ブロック）なら許容できますが、逆（すり抜け）は許容できません。迷ったらブロック側に倒します

## 検証の方法論（ここが一番大事）

セキュリティ機構は「動くはず」で終わらせてはいけません。3段階で検証します。

### 1. パイプテスト

フックが受け取る JSON を手で合成して、スクリプトに直接流します。

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"az group create -n x"}}' | bash .claude/hooks/az-guard.sh
```

更新系（deny されるべき）・読み取り系（通るべき）・境界ケース（`--start-date` や `--offset` の誤検知チェック）・対象外コマンドを一通り流し、deny JSON の有無と exit code を確認します。

### 2. スキーマ検証

`jq -e` で settings.json の構造を確認します。

```bash
jq -e '.hooks.PreToolUse[] | select(.matcher=="Bash") | .hooks[].command' .claude/settings.json
```

⚠️ ここが怖いところで、settings.json が壊れていてもエラーにはならず、**その設定ファイル全体が黙って無効化**されます。「守られているつもりで守られていない」状態になるので、構造の検証は必須です。

### 3. 実地発火テスト

最後に、実セッションで本当にブロックされるかを確認します。ここで使うのは**無害なコマンド**です。

- 例: `az group create --help`（実行されてもヘルプが表示されるだけ）
- ブロックされれば成功。素通りしても実害なし

本物の更新コマンドでテストするのは絶対にダメです。フックが効いていなかった場合、そのまま実行されます。

### ハマりどころ: 設定のリロード

一つ大きな落とし穴があります。セッション開始時に `.claude/` ディレクトリが存在しなかった場合、**後から作った settings.json はそのセッションでは読み込まれません**（ファイル監視の対象になっていないため）。

`/hooks` を一度開くか、セッションを再起動すると有効になります。実地発火テストで素通りしたら、パターンの間違いを疑う前に、まずこれを疑ってください。

## まとめ

- 「絶対に起きてはいけない操作」は、プロンプトではなく**ハーネスで止める**
- 防御は **CLAUDE.md（意図）→ permissions（パターン照合）→ フック（精密判定）** の3層で
- deny には例外を作れないので、**誤検知しない動詞だけを deny に、際どい判定はフックに**寄せる
- そして何より、**パイプテスト → スキーマ検証 → 無害コマンドでの実地発火テスト**の3段階で「本当に効いていること」を確認する

この構成にしてからは、安心して Claude Code にサブスクリプションの調査を任せられるようになりました。クラウドに限らず、「読み取りは自由に、書き込みは絶対に止めたい」場面全般で使えるパターンだと思います。

## 参考

- [Claude Code の permissions 公式ドキュメント](https://code.claude.com/docs/en/permissions)
- [Claude Code の hooks 公式ドキュメント](https://code.claude.com/docs/en/hooks)
