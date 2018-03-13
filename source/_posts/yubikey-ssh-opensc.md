---
title: Putty CAC で SSH に YubiKey を使う(OpenSC編)
date: 2018-02-02 21:44:28
tags: YubiKey
---

# Putty CAC で SSH に YubiKey を使う(OpenSC編)

## 概要

YubiKey 4 の PIV 機能を利用して SSH 接続を試してみる。
YubiKey には PIV(Smart Card) 機能があり、 OpenSC などで実装される PKCS#11 と、 Windows の CAPI で利用できる minidriver 経由の API アクセスの2つの機能が利用できる。

Windows 環境で PKCS#11 と CAPI を利用できる Putty CAC を利用して SSH 接続を試してみる。今回は OpenSC のほうを試す。

Linux, Mac 環境については [Yubico 公式サイト](https://developers.yubico.com/PIV/Guides/SSH_with_PIV_and_PKCS11.html)に解説があるのでそちらを参照

CAPI を利用して SSH もできるので、時間があればまた次回。

## 環境

* Windows 10 ver1709
* YubiKey 4
* Yubico PIV Manager
* Putty CAC
* Debian

## お品書き

* 各種ツールのインストール
* キーペア(証明書)の作成
* OpenSC を利用して SSH
* 注意

## 下ごしらえ

### Putty CAC のインストール

以前は [Putty CAC](https://risacher.org/putty-cac/) からダウンロードしていたが、最新版は [Bryan Berns の git リポジトリ](https://github.com/NoMoreFood/putty-cac/releases) にあるようだ。

MSI Installers を落としてきてインストールする。

### YubiKey PIV Manager のインストール

Yubico の PIV Manager [Releases ページ](https://developers.yubico.com/yubikey-piv-manager/Releases/) インストーラを取得してインストールする。

YubiKey PIV Tool という CUI のツールもあるのだが、PIV Manager に含まれているし、私の環境ではキーペアの生成がうまくいかなかった（多分PUKがロックされているため）ので GUI で操作する。

### OpenSC

OpenSC は OSS の PKCS#11 の実装らしい。
今回は Putty CAC を利用するので dll ファイルだけあればいい。
GitHub の[リリースページ](https://github.com/OpenSC/OpenSC/releases/tag/0.17.0)からダウンロードしてインストールする。

インストール終了後 `%SystemRoot%\System32\opensc-pkcs11.dll` が作成されていればOK

## 調理

### キーペアの生成

Yubico PIV Manager を起動する。
未使用の YubiKey を指した場合、PIN の変更を促されるので、適当に設定する。
忘れた場合どうしようもないので忘れないように。

{% asset_img lena.bmp 2018-02-01_08h54_48.png %}

[Management key](https://developers.yubico.com/yubikey-piv-manager/PIN_and_Management_Key.html) は一般的な利用では Use PIN as key でいいと思う。

PIN の設定が終われば `certificates` をクリックして証明書一覧を開く。

{% asset_img lena.bmp 2018-02-02_20h33_31.png %}

スロットが 9a, 9c, 9d, 9e とあり、それぞれ [Authentication, Sign, Key Management, Card Authentication ように 割り振られている](https://developers.yubico.com/PIV/Introduction/Certificate_slots.html) らしいが、SSH接続用にキーペアを使う分にはどのスロットを使っても同じ。

とりあえず、 9a スロットと 9c スロットに SSH 用のキーを作成してみる。
まずは `Authentication` タブで `Generate new key` を選択する。

{% asset_img lena.bmp 2018-02-02_21h14_17.png %}

`self-signed certificate` を選択
SSH 接続に利用するだけなので、サブジェクト名などは不要ですが
まあ、ユーザ名やサーバー名でも付けときましょう。

あとは PIN 入力して OK を押せば YubiKey 内でキーペアの生成が行われる。

{% asset_img lena.bmp 2018-02-02_21h14_32.png %}

生成された証明書はこんな感じで表示される。

{% asset_img lena.bmp 2018-02-02_21h14_39.png %}

Digital Signiture のタブでも同様に行う。

終了すれば、 `yubico-piv-tool.exe` で 以下のコマンドを叩けば 2 つの証明書が入っていることが確認できる。
(`yubico-piv-tool.exe` は PIV Manager のインストールフォルダにある)

```sh
>yubico-piv-tool.exe -a status

CHUID:  3019d4e739da739ced39ce739d836858210842108421384210c3f5341072734954600b79360e9ac8846ccfa77d350832303330303130313e00fe00
CCC:    f015a000000116ff02e21fa0f562302776846ac64ad39ff10121f20121f300f40100f50110f600f700fa00fb00fc00fd00fe00
Slot 9a:
        Algorithm:      ECCP256
        Subject DN:     CN=user1 sever1
        Issuer DN:      CN=user1 sever1
        Fingerprint:    47f0d58bd734747f2d9f0a073fcb70c8cb5eec2413baeaca200e5de4199546c0
        Not Before:     Feb  2 12:14:30 2018 GMT
        Not After:      Feb  2 12:14:30 2019 GMT
Slot 9c:
        Algorithm:      ECCP256
        Subject DN:     CN=user2 server2
        Issuer DN:      CN=user2 server2
        Fingerprint:    30c9009adb4b96330ac033d03d5b23154430f51e8e4684499c4b5611b993ee88
        Not Before:     Feb  2 12:13:50 2018 GMT
        Not After:      Feb  2 12:13:50 2019 GMT
PIN tries left: 3
```

あとは Export certificate で証明書を export できるので、そこから公開鍵を作成して openssh 形式に変換すればいいのだが、ssh-keygen コマンドが Windows 環境だとうまく動かなかった。Linux 上ではうまくいったので手順だけメモっておく。

> 2018-02-09 追記
> Windows 環境でも pkcs15-tool で、証明書が RSA ならうまくいった。
> OpenSC のインストールフォルダにある toolsフォルダ以下にある pkcs15-tool を利用して
> pkcs15-tool.exe --read-ssh-key 1
> 今回は証明書をECDSA(楕円曲線署名)で作ってみたので↑はうまくいかなかった…。

今回は後述する putty CAC の機能で変換する。

```sh
# 証明書から公開鍵を切り出し
>  openssl x509 -pubkey -noout -in cert.pem > pubkey.pem

# openssh 形式に変換
> ssh-keygen -f pub1key.pem -i >> ~/.ssh/authorized_keys
```

### putty で OpenSC を利用して公開鍵を取得する

putty CAC を起動する。[Putty CAC](https://risacher.org/putty-cac/) のページにもあるが、左の `Connection` > `Certificate`  を選択し `Set PKCS Cert` で dll を選択するダイアログが出たら `%SystemRoot%\System32\opensc-pkcs11.dll` を選択する。

{% asset_img lena.bmp 2018-02-02_21h07_55.png %}

すると Windows のよく見る証明書選択ダイアログが出てくる。
デフォルトで 9a スロットの証明書が表示されるが、その他をクリックすると YubiKey に入っている証明書すべてが表示される。サブジェクト名をつけないとここで判別に困る。

{% asset_img lena.bmp 2018-02-02_21h27_34.png %}

使いたい証明書を選択して OK を押す。

{% asset_img lena.bmp 2018-02-02_21h29_42.png %}

証明書が読み込まれるので `Copy To Clipboard` を選択する。
コピペされた内容は以下のような感じ

```ssh
ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBDwrrmmyS/tvPdZ/i9oe6HT7+Z7h+/+FuLqQFDVq+5+Yj3lo6mkK35R3sYLvCHWIKVnL/gv5pEX3YCmzikPUZJc= PKCS:2f05561a3cde0620a7ba6edfddae6b73a757d12e=C:\Windows\System32\opensc-pkcs11.dll2f05561a3cde0620a7ba6edfddae6b73a757d12e CN=user1 sever1
```

このように openssh 形式の公開鍵が出力されるので サーバーの authorized_keys に追加する。

```sh
> echo "ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbm..." >> ~./ssh/authorized_keys
```

## 実食

あとは putty に戻って接続できるかテストする。

{% asset_img lena.bmp 2018-02-02_21h37_11.png %}

ユーザ名入れて…

{% asset_img lena.bmp 2018-02-02_21h37_37.png %}

PIN 入れて…

{% asset_img lena.bmp 2018-02-02_21h37_43.png %}

ログイン完了！


### 注意

Yubico PIV Tool で作成した証明書が入った YubiKey を利用して
CAPI 経由で証明書を発行すると、警告なしに上書きされる。
minidriver とは併用しないようにしよう。
