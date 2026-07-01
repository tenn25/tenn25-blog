# tenn25 blog

ITエンジニア兼ボードゲーム製作者 **tenn25** の個人ブログ。
[Hugo](https://gohugo.io/) + [Blowfish](https://blowfish.page/) 製。

🌐 https://tenn25.com

## 開発

```bash
# 依存: hugo extended (0.163+)
brew install hugo

# 初回クローン時はテーマ(submodule)を取得
git submodule update --init --recursive

# ローカルサーバ（下書き含む）
hugo server -D

# 本番ビルド
hugo --gc --minify
```

## 記事を書く

`content/blog/` に Markdown を追加するだけ。frontmatter 例:

```yaml
---
title: "記事タイトル"
date: 2026-07-02T10:00:00+09:00
slug: "custom-url-slug"   # /blog/<slug>/ になる。省略時はファイル名から生成
categories: ["boardgame"] # または ["others"] など
tags: ["ボードゲーム", "制作記"]
---
```

- 画像は `static/img/` に置き、本文から `/img/xxx.png` で参照
- 公開URLは `/blog/<slug>/`（既存記事は旧URLを維持）

## デプロイ

`master` への push で Netlify が `hugo --gc --minify` を実行し公開（独自ドメイン `tenn25.com` / CNAME）。

## 構成

| パス | 役割 |
| ---- | ---- |
| `content/blog/` | 記事(Markdown) |
| `static/img/` | 記事内画像 |
| `assets/img/icon.jpg` | プロフィール画像 |
| `config/_default/` | サイト設定(hugo/params/languages/menus) |
| `themes/blowfish/` | テーマ(git submodule) |
