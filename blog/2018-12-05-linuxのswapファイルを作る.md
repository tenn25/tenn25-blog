---
date: 2018-12-05T00:36:15.420Z
title: linuxのswapファイルを作る
category: others
tags:
  - Linux
banner: ''
---

Linux コマンドはちょこちょこ触ってメモしていきたい。

AWS の t3.micro(CentOS7)を使用

## Swap ファイルを作る

メモリ使用量を確認  
そもそも Swap がない！！

```
[tenn25@ip-10-0-0-51 /]$ free -m
              total        used        free      shared  buff/cache   available
Mem:            963         301          99          65         562         402
Swap:             0           0           0


```

dd コマンドは、ファイルをブロック単位で読み込み  
指定通り変換して標準出力をファイルに吐くことができる。

- HDD のパーティションをコピー
- USB メモリや CD-ROM のバックアップを取る
- サイズを指定して任意のサイズのファイルを作る
  などに使うらしい。

bs は M だと*1024 らしいので count は 1000 で良かった模様(1.1GB になってしまった)  
1MB だと count*1000 の計算になったっぽい。

```
[tenn25@ip-10-0-0-51 /]$ sudo dd if=/dev/zero of=/swap bs=1M count=1024
1024+0 レコード入力
1024+0 レコード出力
1073741824 バイト (1.1 GB) コピーされました、 4.46212 秒、 241 MB/秒
```

作成したファイルをスワップ領域として使用できるようにする

```
[tenn25@ip-10-0-0-51 /]$ sudo mkswap /swap
スワップ空間バージョン1を設定します、サイズ = 1048572 KiB
ラベルはありません, UUID=3a114cfa-ea19-4f46-8be3-e64ef1327de5
```

スワップ領域を有効にする

```
[tenn25@ip-10-0-0-51 /]$ sudo swapon /swap
swapon: /swap: 安全でない権限 0644 を持ちます。 0600 がお勧めです。

[tenn25@ip-10-0-0-51 /]$ sudo chmod 600 /swap


```

再度確認

```
[tenn25@ip-10-0-0-51 /]$ free -m
              total        used        free      shared  buff/cache   available
Mem:            963         274          79          65         609         458
Swap:          1023           0        1023

```

起動時に自動でスワップを有効にする設定を行う。  
一番下に１行追加

```
#
# /etc/fstab
# Created by anaconda on Tue Jun  5 14:06:12 2018
#
# Accessible filesystems, by reference, are maintained under '/dev/disk'
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info
#
UUID=8c1540fa-e2b4-407d-bcd1-59848a73e463 /                       xfs     defaults        0 0

/swapfile none swap sw 0 0

```

おわり。
