---
date: 2019-02-15T00:39:13.420Z
title: AWS Athenaでログ集計
category: others
tags:
  - AWS
banner: ''
---

### Athena について

Presto という分散 SQL で書くことができる。  
Presto は標準 SQL 準拠なので、基本的な書き方は馴染みがある。  
[https://prestodb.github.io/docs/0.172/sql.html](https://prestodb.github.io/docs/0.172/sql.html)

### クエリ例

ALB のログを時間ごとに区切って件数を集計  
ALB のログの date は timestamp 型のフォーマットに合っていないので以下の関数を使う  
date_trunc によって足切りをして集計する。

```
SELECT time,request_verb,request_url, count(time) AS count
  FROM (
   SELECT date_trunc('hour',from_iso8601_timestamp(time) AT TIME ZONE 'Asia/Tokyo') AS time,request_verb,request_url
   FROM "db"."alb_logs"
   WHERE  DATE_PARSE(time, '%Y-%m-%dT%H:%i:%S.%fZ') >= DATE_PARSE('2019-02-14 12:50:00', '%Y-%m-%d %H:%i:%S')
    AND DATE_PARSE(time, '%Y-%m-%dT%H:%i:%S.%fZ') < DATE_PARSE('2019-02-14 13:00:00', '%Y-%m-%d %H:%i:%S')
  )
  GROUP BY time,request_verb,request_url
  ORDER BY time,request_verb,request_url
```

画像や js,css ファイルが邪魔な場合は not like とかで除こう

```
  WHERE request_url not like '%.css%'
  and request_url not like '%.js%'
  and request_url not like '%.png%'
  and request_url not like '%.jpeg%'
  and request_url not like '%.jpg%'
  and request_url not like '%.ico%'
```
