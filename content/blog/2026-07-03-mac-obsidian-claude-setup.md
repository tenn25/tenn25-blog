---
title: "新しいMacで作る、Obsidian × Claude(MCP)の知識作業環境"
date: 2026-07-03T00:05:00+09:00
slug: "mac-obsidian-claude-setup"
categories: ["開発環境"]
tags: ["Mac", "Obsidian", "Claude", "開発環境"]
---

新しい Mac をセットアップするタイミングで、開発環境（Homebrew 中心）と、あわせて **Obsidian × Claude のナレッジ作業環境**を整えました。
「調べたことを Obsidian に貯めて、Claude から読み書きする」までを一本の流れにするのが今回のゴールです。

備忘も兼ねて手順と設計判断をまとめておきます。

## 全体像

- 開発環境は **Homebrew 中心**で構築
- VSCode は Brew 版に統一（ブラウザからDL版が入っていたので入れ直し）
- Obsidian Vault を作り、**Filesystem MCP** 経由で Claude から読み書きできる構成に
- フォルダはシンプルな5つだけで運用開始

## 1. Homebrew インストール

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Apple Silicon 用の PATH 設定
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

- Apple Silicon では `/opt/homebrew/`、Intel では `/usr/local/` に入る
- Xcode Command Line Tools（約2〜3GB）が依存で入る。Xcode 本体（40GB+）は不要

## 2. VSCode を Brew 版に入れ直し

```bash
# 旧バージョン削除
sudo rm -rf /Applications/Visual\ Studio\ Code.app

# Brew 版インストール
brew install --cask visual-studio-code
```

- 設定・拡張機能は `~/Library/Application Support/Code/` に残るので引き継がれる
- Brew 版は `code` コマンドの PATH が最初から通っている

## 3. Mac の便利設定

`defaults` でまとめて調整しておくと、初期状態のもっさり感が消えます。

```bash
# キーリピート最速化
defaults write -g KeyRepeat -int 2
defaults write -g InitialKeyRepeat -int 15

# Dock アニメーション高速化（自動非表示時）
defaults write com.apple.dock autohide -bool true
defaults write com.apple.dock autohide-time-modifier -float 0.2
defaults write com.apple.dock autohide-delay -float 0

# 拡張子を常に表示
defaults write NSGlobalDomain AppleShowAllExtensions -bool true

killall Dock Finder
```

## 4. Obsidian Vault の構築

```bash
mkdir -p ~/Documents/Obsidian/vault/{inbox,notes,daily,attachments,archive}
```

Obsidian を起動して `~/Documents/Obsidian/vault` を「Open folder as vault」で開きます。

### 初期設定

- 設定 → ファイルとリンク
  - 添付ファイルのデフォルト保存場所: 指定したフォルダ → `attachments`
  - 新しいリンクの形式: 絶対パス
- 設定 → エディタ
  - スペルチェック: OFF

### フォルダ構成（採用版）

```
~/Documents/Obsidian/vault/
├── inbox/          # 単発の調査・学び（デフォルトはここ）
├── notes/          # 整理済みの残すナレッジ
├── daily/          # 日次メモ
├── attachments/    # 画像・添付ファイル
└── archive/        # 使わなくなったもの
```

**フォルダで細かく分類しない**のがポイントです。PARA や Johnny Decimal のような精緻な分類は、個人運用だと破綻しがち。

- 「状態」をフォルダで、「内容」はタグとリンクで表現する
- 8割は inbox に置きっぱなしで OK。整理は必要になってから
- 熟練者の到達点はだいたい「シンプルなフォルダ + 検索とリンク」に落ち着く

## 5. Claude × Obsidian の連携

Vault はただの Markdown フォルダなので、Claude から参照する手段はいくつかあります。

| 方法 | 使い勝手 |
| --- | --- |
| ドラッグ&ドロップ | 単発質問向け。書き込み不可 |
| **Filesystem MCP** | フォルダ全体を読み書き可。永続化できる |
| Claude Code (CLI) | コーディング作業向け。bash 実行可能 |
| mcp-obsidian (REST) | Obsidian 機能と連動。セットアップが複雑 |

### 結論：知識作業は Filesystem MCP が一番シンプル

Vault は Markdown フォルダなので、**Filesystem MCP でパスを指定するだけ**で読み書きできます。`uv` や凝った JSON 設定は不要。Claude Desktop の 設定 → Connectors から接続するだけです。

### Claude Code との使い分け

| 用途 | 推奨 |
| --- | --- |
| コードを書いて動かす（npm test, git commit） | Claude Code |
| 知識を読み書き、ブログ下書き | Claude Desktop + Filesystem MCP |
| 図・チャート出力 | Claude Desktop |

**実行環境（コード／ナレッジ）× 作業の種類**の2軸で考えると整理しやすいです。

## 6. 「ルール」をどこに書くか

Claude に守ってほしい指示は、粒度によって置き場所を変えると邪魔になりません。

| 種類 | 例 | 置き場所 |
| --- | --- | --- |
| 全会話で守ること | 「日本語で」 | User Preferences |
| プロジェクト用 | 「Vault に書くときのフォーマット」 | Projects |
| 特定タスクの手順 | 「週次レビュー生成」 | Skills |

「サクッと出力したい」用途では **User Preferences** が最適。「保存指示があったときだけ発動するルール」として書いておくと、雑談時には発動せず邪魔になりません。

### 設定した User Preferences（例）

```
## Obsidian Vault について
- 私の Vault は ~/Documents/Obsidian/vault にあります
- 「保存して」「Obsidian に残して」と言ったら、Filesystem MCP で書き込んでください
- フォルダ構成:
  - inbox/      : 単発の調査・学び（デフォルトはここ）
  - notes/      : 整理済みの残すナレッジ
  - daily/      : 日次メモ
  - attachments/: 画像・添付ファイル
  - archive/    : 使わなくなったもの
- ファイル名は英語 kebab-case で、inbox/ 配下は先頭に yyyy-mm-dd をつけて
- frontmatter（title, created, tags）を必ず付けて
- 保存前にパスとファイル名を提示して確認してください
```

## 運用フロー

最終的に、こういう流れに落ち着きました。

```
1. Claude で調査
     ↓
2. 「inbox に保存して」と指示
     ↓
3. inbox/{YYYY-MM-DD}-{topic}.md として保存される
     ↓
4. 数日後に見直して、有用なものだけ notes/ に整形して移動
     ↓
5. 不要になったら archive/ へ
```

「調べる → 貯める → 育てる」が一本の線でつながり、調べっぱなしで消えていく知識が減りました。ちなみにこの記事自体も、inbox に貯めたメモを元に書いています。

## 参考

- [Claude](https://claude.ai/)
- [Obsidian](https://obsidian.md/)
- Filesystem MCP は Claude Desktop の 設定 → Connectors から接続
