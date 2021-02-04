---
date: 2019-02-07T00:42:10.420Z
title: Ansibleでsarとtopによる監視を仕込む
category: others
tags:
  - Ansible
  - Linux
banner: ''
---

### 作業する Linux 環境を立てる

今回は WSL(ubuntu)で実施。  
Python3.6 Ansible2.7.6 とかです。

ansible は pip で入れました。  
確か pip がすぐ入らなくて苦戦したけど ↓ で入れた。

```
$ sudo apt-get install python3.6 python3.6-dev
$ wget https://bootstrap.pypa.io/get-pip.py
$ sudo python3.6 get-pip.py
$ pip install ansible

```

hosts に実行対象のサーバ情報を記載
今回は踏み台サーバ経由だったので、ポートフォワードの設定を Teraterm でした後、localhost:1000\*として設定する

```
ServerName1 ansible_host=localhost ansible_port=10001 ansible_user=centos ansible_ssh_private_key_file=../key/*******.pem

***台数分設定***

```

Ansible の Playbook を作成

- 状態を定義するものである
- 冪等性を意識して書く
- name に日本語は良くないって聞いたけど大丈夫そう

```
---
- name: sarとtopによるリソース監視
  hosts: all
  become: true
  tasks:

    - name: sysstatがインストールされている
      yum:
        name: sysstat
        state: present

    - name: sysstatが起動している
      service:
        name: sysstat
        state: started
        enabled: true

    - name: cronが起動している
      become: true
      command: '/etc/init.d/crond start'

    - name: 既存のcron設定はコメントアウト
      lineinfile:
        dest: /etc/cron.d/sysstat
        regexp: '/usr/lib64/sa/sa1 1 1'
        line: '# */10 * * * * root /usr/lib64/sa/sa1 1 1'

    - name: 既存のcron設定はコメントアウト
      lineinfile:
        dest: /etc/cron.d/sysstat
        regexp: '/usr/lib64/sa/sa2 -A'
        line: '# 53 23 * * * root /usr/lib64/sa/sa2 -A'

    - name: 情報取得のcronが設定されている
      become: true
      cron:
        name: Run system activity accounting tool every 1 minutes
        minute: "*/1"
        user: root
        job: '/usr/lib64/sa/sa1 1 1'
        state: present
        cron_file: sysstat

    - name: ログ整理のcronが設定されている
      become: true
      cron:
        name: Generate a daily summary of process accounting at 23:55
        minute: 55
        hour: 23
        user: root
        job: '/usr/lib64/sa/sa2 -A'
        state: present
        cron_file: sysstat
```

playbook 実行

```
ansible-playbook -i hosts Atleta_SurveyMemory.yml

```
