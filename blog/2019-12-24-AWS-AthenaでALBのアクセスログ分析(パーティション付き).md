---
date: 2019-12-24T17:08:41.420Z
title: AWS AthenaでALBのアクセスログ分析(パーティション付き)
category: others
tags:
  - Others
banner: ''
---

ALB のアクセスログを Athena で分析したい。  
かなりはまったのでメモ

ポイントとしては

- ELB のフォーマットが変わったので古いドキュメントを参考にスキーマ設定すると取り込めない
- カラムを使ったパーティションと、ファイルの Prefix を使ったカラム無しパーティションがある
- ALB アクセスログの場合、デフォルトで YYYY/MM/DD となってしまうのでカラムありパーティションにする必要がある
- 今回はテーブル作成時に PARTITIONED BY で year,month,day を指定（★int 型で）
- テーブル作成後に、別途パーティションを作成する必要がある。(仮想的なカラムが作られる)

```
CREATE EXTERNAL TABLE `test_alb_accesslog`(
  `type` string COMMENT '',
  `request_timestamp` string COMMENT '',
  `elb_name` string COMMENT '',
  `client_addrport` string COMMENT '',
  `client_ip` string COMMENT '',
  `client_port` int COMMENT '',
  `target_addrport` string COMMENT '',
  `target_ip` string COMMENT '',
  `target_port` int COMMENT '',
  `request_processing_time` decimal(8,6) COMMENT '',
  `target_processing_time` decimal(8,6) COMMENT '',
  `response_processing_time` decimal(8,6) COMMENT '',
  `elb_status_code` string COMMENT '',
  `target_status_code` string COMMENT '',
  `received_bytes` int COMMENT '',
  `sent_bytes` int COMMENT '',
  `request` string COMMENT '',
  `user_agent` string COMMENT '',
  `ssl_cipher` string COMMENT '',
  `ssl_protocol` string COMMENT '',
  `target_group_arn` string COMMENT '',
  `trace_id` string COMMENT '',
  `domain_name` string COMMENT '',
  `chosen_cert_arn` string COMMENT '',
  `matched_rule_priority` string COMMENT '',
  `request_creation_time` string COMMENT '',
  `actions_executed` string COMMENT '',
  `redirect_url` string COMMENT '')
PARTITIONED BY (
  year int,
  month int,
  day int)
ROW FORMAT SERDE
  'org.apache.hadoop.hive.serde2.RegexSerDe'
WITH SERDEPROPERTIES (
  'input.regex'='([^ ]*) ([^ ]*) ([^ ]*) (([^ ]*):([^ ]*)|-) (([^ ]*):([^ ]*)|-) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) ([^ ]*) \"([^\\\"]*)\" \"([^\\\"]*)\" ([^ ]*) ([^ ]*) ([^ ]*) \"([^\\\"]*)[ ]*\" \"([^ ]*)\" \"([^ ]*)\" ([^ ]*) ([^ ]*) \"([^ ]*)\" \"([^\\\"]*)\".*$')
STORED AS INPUTFORMAT
  'org.apache.hadoop.mapred.TextInputFormat'
OUTPUTFORMAT
  'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
LOCATION
  's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/'
TBLPROPERTIES (
  'has_encrypted_data'='false',
  'transient_lastDdlTime'='1577166285')
```

成功

```
Query successful. If your table has partitions, you need to load these partitions to be able to query data. You can either load all partitions or load them individually. If you use the load all partitions (MSCK REPAIR TABLE) command, partitions must be in a format understood by Hive. Learn more.
```

---

```
SELECT * FROM "s3"."test_alb_accesslog"
WHERE year = 2019 AND month = 12 AND day = 9
```

まだ検索できない

```
Zero records returned.
```

---

```
ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=9)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/09/'
```

Query successful.

---

検索してみる

```
SELECT * FROM "s3"."test_alb_accesslog"
WHERE year = 2019 AND month = 12 AND day = 10
```

(Run time: 8.61 seconds, Data scanned: 10.51 MB)

成功！！

---

別の日はまだ検索できない

```
SELECT * FROM "s3"."test_alb_accesslog"
WHERE year = 2019 AND month = 12 AND day = 10
```

Zero records returned.

---

同様に日ごとにパーティションを追加する必要がある…面倒

```
ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=10)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/10/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=11)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/11/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=12)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/12/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=13)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/13/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=14)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/14/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=15)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/15/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=16)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/16/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=17)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/17/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=18)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/18/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=19)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/19/'

ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=20)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/20/'


ALTER TABLE test_alb_accesslog
ADD IF NOT EXISTS PARTITION (year=2019,month=12,day=21)
location 's3://[Your Backet Name]/ELB/[Your ALB Name]/AWSLogs/XXXXXXXXXXXX/elasticloadbalancing/ap-northeast-1/2019/12/21/'

```

先の日付まで先に作成しておけば良いがかなり面倒…  
そのため、Athena で分析したいデータは  
S3 のファイル Prefix を year=2019/month=12/day=22 のように格納しておくと便利。
