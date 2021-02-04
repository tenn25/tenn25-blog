---
date: 2018-11-07T00:55:50.420Z
title: SQLDatabaseのスケールアップ挙動とエラスティックプールについて
category: others
tags:
  - Azure
  - Database
banner: ''
---

今日の学び。SQLDatabase について少し調べた。

### スケールアップ時の動き

- シングル構成の SQLDatabase の場合、レプリカが作成されて内部的に DNS が切り替えられる。
- 数秒の停止が発生するので注意が必要っぽい。

[https://docs.microsoft.com/ja-jp/azure/sql-database/sql-database-single-database-scale](https://docs.microsoft.com/ja-jp/azure/sql-database/sql-database-single-database-scale)

### エラスティックプール

- 負荷タイミングが違う複数 DB を同じエラスティックプールとしてハードウェアリソースを共有させることで、リソースの使用を効率化できる。
- あくまでリソース共有による効率化が目的であって、性能が上がるとかではない。

[https://docs.microsoft.com/ja-jp/azure/sql-database/sql-database-elastic-pool](https://docs.microsoft.com/ja-jp/azure/sql-database/sql-database-elastic-pool)
