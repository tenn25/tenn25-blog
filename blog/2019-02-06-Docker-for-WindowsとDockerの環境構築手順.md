---
date: 2019-02-06T22:33:59.420Z
title: Docker-for-WindowsとDockerの環境構築手順
category: others
tags:
  - Linux
  - 開発環境
banner: ''
---

### Windows10 の WSL をセットアップ手順

---

1.Hyper-V 有効化  
※Windows 10 Home エディションは使えません  
コントロールパネル＞プログラム＞プログラムと機能  
＞ Windows の機能の有効化または無効化

2.WSL 有効化  
＞ Windows SubSystem for Linux にチェック

3.Docker for Mac のインストール

4.DockerHub アカウント取得

5.再起動
スタートボタンを右クリック  
＞設定＞更新とセキュリティ＞(画面左メニュー)開発者向け  
開発者モードに変更(リモート展開と WindowsDevicePortal はインストールされてない)というエラー

6.古い WSL 環境を削除

```
lxrun /uninstall
```

7.Hyper-V 確認

8.MobyLinuxVM 上で Docker が動く

9.ネットワークを確認  
コントロール パネル\ネットワークとインターネット\ネットワーク接続  
vEthernet(DockerNAT)から Docker ホストにつながってること。

Docker 右クリック＞ Settings ＞ General
Expose daemon on tcp://localhost:2375 withiout TLS にチェック

(https://nabinno.github.io/f/2017/12/10/wsl-windows_subsystem_for_linux-%E3%81%A7docker%E3%82%92%E3%81%A4%E3%81%8B%E3%81%86.html)[https://nabinno.github.io/f/2017/12/10/wsl-windows_subsystem_for_linux-%E3%81%A7docker%E3%82%92%E3%81%A4%E3%81%8B%E3%81%86.html]

Ubuntu の/の実態パス
C:\Users\***\***\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState\rootfs
