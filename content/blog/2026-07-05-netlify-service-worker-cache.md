---
title: "リニューアルしたはずのブログが古いまま表示される ― 犯人はService Workerだった"
date: 2026-07-05T18:30:00+09:00
slug: "netlify-service-worker-cache"
categories: ["others"]
tags: ["Netlify", "ServiceWorker", "ブログ", "トラブルシューティング"]
---

[先日ブログを Gatsby から Hugo + Blowfish に刷新した](/blog/hugo-blog-renewal/)のですが、**ブラウザによっては、何度アクセスしてもリニューアル前の古いページが表示され続ける**ので調査しました。

結論、犯人は**自分のブラウザの中に棲みついていた古い Service Worker** でした。

Service Workerの存在を知らなかったので、学習のためまとめておきます。

## 起きたこと

- リニューアル後のブログにアクセスすると、**旧サイト(Gatsby 時代)のページが表示される**
- ハードリロード(Cmd+Shift+R)すると一時的に直るが、**通常アクセスに戻るとまた古い状態に戻る**
- Chrome のシークレットモードでは**発生しない**(新サイトが正しく表示される)
- Netlify の「Clear cache and deploy site」を実行しても**改善しない**

デプロイは成功していて、シークレットモードでは新サイトが見える。つまりサーバー側は正しい。それなのに通常ウィンドウでは古いまま――この時点で「ブラウザ側に何かいる」ことは確定です。

## 犯人: Service Worker

DevTools の Application タブを開いてみると、いました。

![Chrome DevTools の Application → Service workers パネル。sw.js が「#172 activated and is running」と表示されている](/img/2026-07-05-devtools-service-worker.png)


tenn25.com に `sw.js` が「**#172 activated and is running**」の状態で登録されています。リニューアルで消えたはずのGatsby製ブログのスクリプトが、ブラウザの中で稼働し続けていたことが原因でした。

Service Worker(SW)は、サイト本体とは別にブラウザの裏側で動き続ける特殊なスクリプトで、次の性質を持っています。

- タブを閉じても、ページを開いていなくても**バックグラウンドで生き続ける**
- ページの通信を**横取り**して、サーバーに問い合わせることなく**キャッシュから応答を直接返せる**
- 一度ブラウザに登録されると、サーバー側で何を変えようと(デプロイし直そうと、CDN キャッシュを消そうと)**関係なく古い応答を返し続けられる**

うちのブログの場合、旧サイトが Gatsby 製で、初期構築(2018年)の時点から `gatsby-plugin-offline` が入っていました。このプラグインはオフライン対応のために `sw.js` を自動生成してブラウザに登録します。つまり**過去にこのブログを訪れたブラウザには、旧サイト一式をキャッシュした SW が登録済み**でした。

そして Hugo への刷新でサイトから `sw.js` は消えましたが、**ブラウザに登録済みの SW は消えません**。主を失った古い SW が居座り、手元にあるキャッシュ(=旧 Gatsby サイト)を配り続けていた、というのが真相でした。

## なぜ他の対処では直らなかったのか

切り分けで試した対処が効かなかった理由も、SW だと分かればすべて説明がつきます。

| 対処 | 効かなかった理由 |
| --- | --- |
| シークレットモード | 過去に SW を登録していないまっさらな環境なので、そもそも問題が起きない(=切り分けとしては有効) |
| ハードリロード | **一時的に SW をバイパスするだけ**。登録自体は残るので、通常アクセスに戻ると再び介入する |
| Netlify のキャッシュクリア | これはビルド/CDN 側のキャッシュの話。**ブラウザに登録済みの SW には一切関係がない** |

「シークレットモードだと直る」「ハードリロードで一瞬だけ直る」の組み合わせは、SW を疑うサインとして覚えておいて損はないです。

## 解決手順(自分のブラウザ)

Chrome DevTools から古い SW を直接除去します。

1. DevTools → **Application** タブ → **Service workers** を開く
2. 該当ドメイン(tenn25.com)に `sw.js` が **activated and running** の状態で登録されているのを確認
3. **Unregister** をクリックして登録解除
4. 同じ Application タブの **Storage → Cache storage** に残っているキャッシュも削除
5. 通常リロードして、新しいブログが表示されることを確認

これで手元では解決しました。

## 残る問題: 訪問者のブラウザには古いSWが残っている

ただし、いま消したのは**自分のブラウザの SW だけ**です。リニューアル前にこのブログを訪れたことのある人のブラウザには、まだ古い SW が残っている可能性があります。その人たちには依然として旧サイトが表示されているかもしれません。

こちらから訪問者のブラウザを直接操作することはできないので、恒久対応としては「**新しい `sw.js` を同じ場所に配置して、古い SW を自壊させる**」という kill switch パターンをデプロイすることになります(SW は登録元の URL を定期的に再取得して更新をチェックするため、そこに"自殺する SW"を置いておく作戦です)。

```js
// static/sw.js としてルートに配置(旧 sw.js を上書きする)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 旧サイトのキャッシュを全削除
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      // 自分自身の登録を解除
      await self.registration.unregister();
      // 開いているタブを再読み込みさせ、SW なしの状態に戻す
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => client.navigate(client.url));
    })()
  );
});
```

ポイントは 2 つです。

- `skipWaiting()` で待機をスキップし、古い SW から**即座に**制御を奪う
- `activate` 内の後始末は `event.waitUntil()` で包む。これがないと、非同期処理の途中でブラウザが SW を停止してしまい、掃除が中途半端に終わることがあります

このパターンは Gatsby 公式も SW を外すとき用に [gatsby-plugin-remove-serviceworker](https://www.gatsbyjs.com/plugins/gatsby-plugin-offline/#remove) として案内している定石で、汎用実装の [self-destroying-service-worker](https://github.com/NekR/self-destroying-service-worker) もあります。

まぁ個人ブログなので、ここまでの対応はしないことにします。
商用の実運用だと面倒なことになりそうですね。

## 再発防止: キャッシュ戦略の見直し

あわせて、Netlify 側のキャッシュヘッダも見直す予定です。方針は王道の組み合わせで、

- **HTML は `no-cache`**(毎回サーバーに確認させる。更新が即座に届く)
- **JS/CSS はハッシュ付きファイル名で長期キャッシュ**(内容が変わればファイル名が変わるので、キャッシュが古くなる心配がない)

Netlify なら `_headers` ファイル(または `netlify.toml` の `[[headers]]`)で指定できます。

```
/*.html
  Cache-Control: no-cache
```


## まとめ

- 「デプロイは成功しているのに古いページが出る」「シークレットモードだと直る」「ハードリロードで一瞬だけ直る」が揃ったら **Service Worker を疑う**
- SW はサーバー側のデプロイやキャッシュクリアの**射程外**。ブラウザに登録された時点で、消す手段は Unregister か kill switch しかない
- 自分のブラウザは DevTools → Application → Service workers から Unregister で解決
- 過去の訪問者のブラウザに残った SW には、**自壊する sw.js を同じ URL に配置**して対処する
- SW を外すフレームワーク移行(Gatsby → Hugo など)では、この問題が**必ず**起きる。移行時に kill switch を仕込んでおくのが正解だった

## 参考

- [Service Worker API - MDN](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
- [self-destroying-service-worker](https://github.com/NekR/self-destroying-service-worker)
- [gatsby-plugin-offline (Remove)](https://www.gatsbyjs.com/plugins/gatsby-plugin-offline/#remove)
- [前回: ブログをHugoで刷新しました](/blog/hugo-blog-renewal/)
