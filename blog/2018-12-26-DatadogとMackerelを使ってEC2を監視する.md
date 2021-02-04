---
date: 2018-12-26T00:26:12.420Z
title: DatadogとMackerelを使ってEC2を監視する
category: others
tags:
  - AWS
  - システム監視
banner: ''
---

Datadog と Mackerel をまとめてインストールして  
EC2 の監視設定をしてみる。  
次回は Azure の IaaS、PaaS の監視をしたい。

## 1.登録

どちらも無料期間あり。  
メールアドレスの登録や名前、Datadog は会社名の登録

Datadog は英語、Mackerel は日本語で分かりやすい。

---

## 2.EC2 へ Agent をインストール

どちらも説明にしたがって進める。  
OS ごとに丁寧に説明してあってどちらも分かりやすい。

### Datadog

CentOS/Redhat 7 以降

```
DD_API_KEY=ac504******************** bash -c "$(curl -L https://raw.githubusercontent.com/DataDog/datadog-agent/master/cmd/agent/install_script.sh)"
DD_UPGRADE=true bash -c "$(curl -L https://raw.githubusercontent.com/DataDog/datadog-agent/master/cmd/agent/install_script.sh)"


[tenn25@ip-10-0-0-51 ~]$ sudo systemctl status datadog-agent
● datadog-agent.service - "Datadog Agent"
   Loaded: loaded (/usr/lib/systemd/system/datadog-agent.service; enabled; vendor preset: disabled)
   Active: active (running) since 火 2018-12-25 22:57:07 JST; 32s ago
 Main PID: 3446 (agent)
   CGroup: /system.slice/datadog-agent.service
           └─3446 /opt/datadog-agent/bin/agent/agent run -p /opt/datadog-agent/run/agent.pid

12月 25 22:57:35 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:35 JST | INFO |...e
12月 25 22:57:35 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:35 JST | INFO |...e
12月 25 22:57:36 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:36 JST | INFO |...k
12月 25 22:57:36 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:36 JST | INFO |...k
12月 25 22:57:37 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:37 JST | INFO |...d
12月 25 22:57:37 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:37 JST | INFO |...d
12月 25 22:57:38 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:38 JST | INFO |...e
12月 25 22:57:38 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:38 JST | INFO |...e
12月 25 22:57:39 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:39 JST | INFO |...u
12月 25 22:57:39 ip-10-0-0-51.ap-northeast-1.compute.internal agent[3446]: 2018-12-25 22:57:39 JST | INFO |...u
Hint: Some lines were ellipsized, use -l to show in full.

```

### Mackerel

CentOS/Redhat 7 以降

```
sudo su -
curl -fsSL https://mackerel.io/file/script/setup-all-yum-v2.sh | MACKEREL_APIKEY='4q1Wq*********************************************' sh



[root@ip-10-0-0-51 tenn25]# systemctl status mackerel-agent
● mackerel-agent.service - mackerel.io agent
   Loaded: loaded (/usr/lib/systemd/system/mackerel-agent.service; enabled; vendor preset: disabled)
   Active: active (running) since Tue 2018-12-25 23:00:27 JST; 1min 42s ago
     Docs: https://mackerel.io/
  Process: 4523 ExecStartPre=/usr/bin/mkdir -m 777 -p $MACKEREL_PLUGIN_WORKDIR (code=exited, status=0/SUCCESS)
 Main PID: 4524 (mackerel-agent)
   CGroup: /system.slice/mackerel-agent.service
           ├─4524 /usr/bin/mackerel-agent supervise --root /var/lib/mackerel-agent
           └─4533 /usr/bin/mackerel-agent --root /var/lib/mackerel-agent -child

Dec 25 23:00:27 ip-10-0-0-51.ap-northeast-1.compute.internal systemd[1]: Starting mackerel.io agent...
Dec 25 23:00:27 ip-10-0-0-51.ap-northeast-1.compute.internal systemd[1]: Started mackerel.io agent.
Dec 25 23:00:27 ip-10-0-0-51.ap-northeast-1.compute.internal mackerel-agent[4524]: 2018/12/25 23:00:27 INFO <...
Dec 25 23:00:27 ip-10-0-0-51.ap-northeast-1.compute.internal mackerel-agent[4524]: 2018/12/25 23:00:27 INFO <...
Dec 25 23:00:29 ip-10-0-0-51.ap-northeast-1.compute.internal mackerel-agent[4524]: 2018/12/25 23:00:29 INFO <...
Dec 25 23:00:31 ip-10-0-0-51.ap-northeast-1.compute.internal mackerel-agent[4524]: 2018/12/25 23:00:31 INFO <...
Dec 25 23:00:31 ip-10-0-0-51.ap-northeast-1.compute.internal mackerel-agent[4524]: 2018/12/25 23:00:31 INFO <...
Hint: Some lines were ellipsized, use -l to show in full.
```

---

## 3.初期設定

### Datadog

Agent 入れたサーバが EC2 だと自動で判断したのか、  
次のステップに進んだら AWS Integration をインストールしろと言われた。  
Datadog は CloudWatch API を使用して 10 分ごとに AWS リソースを監視する。

アクセスコントロールポリシードキュメント(信頼関係)

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::AWSアカウントID:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "DataDog側の発行されたID"
        }
      }
    }
  ]
}

```

IAM ポリシー(前にネットで拾ったやつ適当に。たぶん参照系もろもろ)

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "autoscaling:Describe*",
                "budgets:ViewBudget",
                "cloudfront:GetDistributionConfig",
                "cloudfront:ListDistributions",
                "cloudtrail:DescribeTrails",
                "cloudtrail:GetTrailStatus",
                "cloudwatch:Describe*",
                "cloudwatch:Get*",
                "cloudwatch:List*",
                "codedeploy:List*",
                "codedeploy:BatchGet*",
                "directconnect:Describe*",
                "dynamodb:List*",
                "dynamodb:Describe*",
                "ec2:Describe*",
                "ecs:Describe*",
                "ecs:List*",
                "elasticache:Describe*",
                "elasticache:List*",
                "elasticfilesystem:DescribeFileSystems",
                "elasticfilesystem:DescribeTags",
                "elasticloadbalancing:Describe*",
                "elasticmapreduce:List*",
                "elasticmapreduce:Describe*",
                "es:ListTags",
                "es:ListDomainNames",
                "es:DescribeElasticsearchDomains",
                "health:DescribeEvents",
                "health:DescribeEventDetails",
                "health:DescribeAffectedEntities",
                "kinesis:List*",
                "kinesis:Describe*",
                "lambda:AddPermission",
                "lambda:GetPolicy",
                "lambda:List*",
                "lambda:RemovePermission",
                "logs:Get*",
                "logs:Describe*",
                "logs:FilterLogEvents",
                "logs:TestMetricFilter",
                "rds:Describe*",
                "rds:List*",
                "redshift:DescribeClusters",
                "redshift:DescribeLoggingStatus",
                "route53:List*",
                "s3:GetBucketLogging",
                "s3:GetBucketLocation",
                "s3:GetBucketNotification",
                "s3:GetBucketTagging",
                "s3:ListAllMyBuckets",
                "s3:PutBucketNotification",
                "ses:Get*",
                "sns:List*",
                "sns:Publish",
                "sqs:ListQueues",
                "support:*",
                "tag:getResources",
                "tag:getTagKeys",
                "tag:getTagValues"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ]
}
```

AWS 側に IAM ロールを作成

### Mackerel

Mackerel では、協調してはたらくホスト群をまとめる『サービス』と、  
サービス内の役割である『ロール』を使ってホストを管理します

サービスは最初に作ったので新規ロール(Web)を作成

統合した EC2 に新規作成した Web ロールを設定

これで監視スタート

---

## 4.アラート設定

### Datadog

Monitor から作成。

- Alert threshold:
- Warning threshold:
- Alert recovery threshold:
- Warning recovery threshold:

という閾値を設定する。ちょっと細かい印象

アラート先も指定。Team という表現なのでグループ設定できるっぽいが、  
デフォルトの自分個人を設定

### Mackerel

こちらも Monitor から監視アラート設定をする  
Warning と Critica の 2 段階で設定可能

アラートの宛先設定が見当たらなかったけど、最初から自分のメールに飛ぶようになってた。より親切。  
別途、Alerts からアラートグループの作成とサービス、ロールへの割り当てが可能っぽい。

---

## 5.EC2 に負荷をかけてアラートを飛ばす

コンソール複数画面立ち上げて

```
yes > /dev/null
```

このやりかた初めて知った w  
みるみる CPU が上がって無事アラートが飛びました ◎
