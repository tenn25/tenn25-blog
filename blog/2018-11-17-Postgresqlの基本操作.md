---
date: 2018-11-17T01:53:43.420Z
title: Postgresqlの基本操作
category: others
tags:
  - Database
  - blog
banner: ''
---

Mezzanine ブログの記事データをみたくて DB の中を見てみた。  
…が、DB には大した情報は何も入ってなかった。  
投稿履歴とかどこにあるんだろ・・？

---

### ログイン

-U でユーザ名指定  
-d で接続先 DB も指定可

```
[tenn25@ip-10-0-0-51 ~]$ psql -U postgres
psql (11.0)
"help" でヘルプを表示します。

postgres=#

```

psql は\に続けてコマンドを実行するスタイル。
DB 一覧を表示

```
blog=# \l
                                        データベース一覧
    名前    |  所有者  | エンコーディング | 照合順序 | Ctype(変換演算子) |     アクセス権限
------------+----------+------------------+----------+-------------------+-----------------------
 blog       | postgres | UTF8             | C        | C                 | =Tc/postgres         +
            |          |                  |          |                   | postgres=CTc/postgres+
            |          |                  |          |                   | tenn25=CTc/postgres
 postgres   | postgres | UTF8             | C        | C                 |
 template0  | postgres | UTF8             | C        | C                 | =c/postgres          +
            |          |                  |          |                   | postgres=CTc/postgres
 template1  | postgres | UTF8             | C        | C                 | =c/postgres          +
            |          |                  |          |                   | postgres=CTc/postgres
 tenn25blog | postgres | UTF8             | C        | C                 | =Tc/postgres         +
            |          |                  |          |                   | postgres=CTc/postgres+
            |          |                  |          |                   | tenn25=CTc/postgres
(5 行)
```

DB に接続

```
postgres=# \c blog
データベース "blog" にユーザ "postgres" として接続しました。
blog=#
```

テーブル一覧を表示

```
blog=# \dt
                     リレーション一覧
 スキーマ |            名前            |    型    | 所有者
----------+----------------------------+----------+--------
 public   | auth_group                 | テーブル | tenn25
 public   | auth_group_permissions     | テーブル | tenn25
 public   | auth_permission            | テーブル | tenn25
 public   | auth_user                  | テーブル | tenn25
 public   | auth_user_groups           | テーブル | tenn25
 public   | auth_user_user_permissions | テーブル | tenn25
 public   | django_admin_log           | テーブル | tenn25
 public   | django_content_type        | テーブル | tenn25
 public   | django_migrations          | テーブル | tenn25
 public   | django_session             | テーブル | tenn25
(10 行)
```

---

### クエリ実行

SQL の実行。改行もできる。 ; をお忘れなく。。

```
blog=# select *
from django_migrations
;
 id |     app      |                   name                   |            applied
----+--------------+------------------------------------------+-------------------------------
  1 | contenttypes | 0001_initial                             | 2018-10-21 21:08:51.960126+09
  2 | auth         | 0001_initial                             | 2018-10-21 21:08:52.124047+09
  3 | admin        | 0001_initial                             | 2018-10-21 21:08:52.14754+09
  4 | admin        | 0002_logentry_remove_auto_add            | 2018-10-21 21:08:52.15789+09
  5 | admin        | 0003_logentry_add_action_flag_choices    | 2018-10-21 21:08:52.180188+09
  6 | contenttypes | 0002_remove_content_type_name            | 2018-10-21 21:08:52.223051+09
  7 | auth         | 0002_alter_permission_name_max_length    | 2018-10-21 21:08:52.229096+09
  8 | auth         | 0003_alter_user_email_max_length         | 2018-10-21 21:08:52.239269+09
  9 | auth         | 0004_alter_user_username_opts            | 2018-10-21 21:08:52.248465+09
 10 | auth         | 0005_alter_user_last_login_null          | 2018-10-21 21:08:52.25856+09
 11 | auth         | 0006_require_contenttypes_0002           | 2018-10-21 21:08:52.260297+09
 12 | auth         | 0007_alter_validators_add_error_messages | 2018-10-21 21:08:52.271062+09
 13 | auth         | 0008_alter_user_username_max_length      | 2018-10-21 21:08:52.28448+09
 14 | auth         | 0009_alter_user_last_name_max_length     | 2018-10-21 21:08:52.294218+09
 15 | sessions     | 0001_initial                             | 2018-10-21 21:08:52.305047+09
(15 行)

```

DB ごとのサイズ確認

```
blog=# SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;
  datname   | pg_size_pretty
------------+----------------
 postgres   | 7947 kB
 template1  | 7947 kB
 template0  | 7947 kB
 blog       | 8611 kB
 tenn25blog | 7947 kB
(5 行)

```

テーブルごとの件数を確認

```
blog=# select relname, n_live_tup from pg_stat_user_tables where schemaname='public';
          relname           | n_live_tup
----------------------------+------------
 django_session             |          1
 auth_group                 |          0
 auth_group_permissions     |          0
 django_content_type        |          6
 django_admin_log           |          0
 auth_user_user_permissions |          0
 auth_user                  |          1
 auth_user_groups           |          0
 auth_permission            |         24
 django_migrations          |         15
(10 行)

```

---

### 気になったこと ① シーケンス

ちょっと気になって調べた。  
\dt だとテーブル一覧、\ds でシーケンス一覧が見れる

```
blog=# \ds
                          リレーション一覧
 スキーマ |               名前                |     型     | 所有者
----------+-----------------------------------+------------+--------
 public   | auth_group_id_seq                 | シーケンス | tenn25
 public   | auth_group_permissions_id_seq     | シーケンス | tenn25
 public   | auth_permission_id_seq            | シーケンス | tenn25
 public   | auth_user_groups_id_seq           | シーケンス | tenn25
 public   | auth_user_id_seq                  | シーケンス | tenn25
 public   | auth_user_user_permissions_id_seq | シーケンス | tenn25
 public   | django_admin_log_id_seq           | シーケンス | tenn25
 public   | django_content_type_id_seq        | シーケンス | tenn25
 public   | django_migrations_id_seq          | シーケンス | tenn25
(9 行)

```

シーケンスってのは、名前のとおり、自動採番するための仕組み。  
[http://sql55.com/query/how-to-use-sequence.php](http://sql55.com/query/how-to-use-sequence.php)  
単純なインクリメントではないものにも対応できそう。  
学科ごとに接頭辞付けて学籍番号にするとか？
(他の RDBMS にもあるっぽいけど知らなかった。)

---

### ログアウト

\q でお k。おつかれさまでした

```
blog=# \q
[tenn25@ip-10-0-0-51 ~]$
```
