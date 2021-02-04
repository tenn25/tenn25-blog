---
date: 2019-01-18T23:44:10.420Z
title: AWS-RunCommandでカスタムメトリクスを設定する
category: others
tags:
  - AWS
  - システム監視
banner: ''
---

Windows サーバの EC2 に対してカスタムメトリクスの取得設定をした。

### 参考サイト

[https://dev.classmethod.jp/cloud/aws/windows-server-runcommand-custom-metrics/](https://dev.classmethod.jp/cloud/aws/windows-server-runcommand-custom-metrics/)

### 手順

- IAM ロール作成
  - [AmazonEC2RoleforSSM]というロールを付与
- 対象の EC2 に割り当て
  - 即時反映されます
- runcommand から json 実行
  - RunCommand からは様々なことができる -今回は[AWS-ConfigureCloudWatch]を選択
  - IAM ロールの反映には数分かかるが、反映されたら一覧に出てくるので対象サーバを選択

```
{
    "EngineConfiguration": {
        "PollInterval": "00:00:15",
        "Components": [
            {
                "Id": "MemoryAvailableMegabytes",
                "FullName": "AWS.EC2.Windows.CloudWatch.PerformanceCounterComponent.PerformanceCounterInputComponent,AWS.EC2.Windows.CloudWatch",
                "Parameters": {
                    "CategoryName": "Memory",
                    "CounterName": "Available MBytes",
                    "InstanceName": "",
                    "MetricName": "MemoryAvailable",
                    "Unit": "Megabytes",
                    "DimensionName": "InstanceId",
                    "DimensionValue": "{instance_id}"
                }
            },
            {
                "Id": "MemoryUtilization",
                "FullName": "AWS.EC2.Windows.CloudWatch.PerformanceCounterComponent.PerformanceCounterInputComponent,AWS.EC2.Windows.CloudWatch",
                "Parameters": {
                    "CategoryName": "Memory",
                    "CounterName": "% Committed Bytes in Use",
                    "InstanceName": "",
                    "MetricName": "MemoryUtilization",
                    "Unit": "Percent",
                    "DimensionName": "InstanceId",
                    "DimensionValue": "{instance_id}"
                }
            },
            {
                "Id": "MonitoringFreeSpaceC",
                "FullName": "AWS.EC2.Windows.CloudWatch.PerformanceCounterComponent.PerformanceCounterInputComponent,AWS.EC2.Windows.CloudWatch",
                "Parameters": {
                    "CategoryName": "LogicalDisk",
                    "CounterName": "% Free Space",
                    "InstanceName": "C:",
                    "MetricName": "DiskFreeC",
                    "Unit": "Percent",
                    "DimensionName": "InstanceId",
                    "DimensionValue": "{instance_id}"
                }
            },
            {
                "Id": "CloudWatchLogs",
                "FullName": "AWS.EC2.Windows.CloudWatch.CloudWatchLogsOutput,AWS.EC2.Windows.CloudWatch",
                "Parameters": {
                    "AccessKey": "",
                    "SecretKey": "",
                    "Region": "us-east-1",
                    "LogGroup": "Default-Log-Group",
                    "LogStream": "{instance_id}"
                }
            },
            {
                "Id": "CloudWatch",
                "FullName": "AWS.EC2.Windows.CloudWatch.CloudWatch.CloudWatchOutputComponent,AWS.EC2.Windows.CloudWatch",
                "Parameters":
                {
                    "AccessKey": "",
                    "SecretKey": "",
                    "Region": "ap-northeast-1",
                    "NameSpace": "★★★カスタムメトリクス名を入れる★★★"
                }
            }
        ],
        "Flows": {
            "Flows":
            [
                "(MonitoringFreeSpaceC,MemoryAvailableMegabytes,MemoryUtilization),CloudWatch"
            ]
        }
    }
}

```

- IAM ロールで権限付与してるので、key 設定とかは不要
- 注意として、カスタムメトリクスは削除ができない。
  - 間違った名前空間名で設定しないように(やってしまった)
- エラー調査ができるようにログを S3 に出力するように設定できる

以上です。
