---
title: YubiKey を CNG(CAPI) 経由で使う
tags: 
  - YubiKey
  - CNG
  - Cryptgraphy 
  - SmartCard
date: 2018-07-01 12:19
---


## YubiKey Minidriver

実は、Windows 10 v1803 から YubiKey Minidriver が標準で入っており、ドライバを入れずに YubiKey の PIV フル機能、

つまり

<!--more -->

- 複数の証明書の利用
- Windows標準のパスワード変更画面でのPIN変更
- PIN Block の解除?
- ADCS証明書の発行
- SmartCard 利用時の Touch Policy の設定
- Certificate Chain のインポート

などができるようになる。

ドライバは [Smart Card Drivers and Tools | Yubico](https://www.yubico.com/products/services-software/download/smart-card-drivers-tools/) からもダウンロードできるので Windows7 以降であれば利用可能。

さて、ドライバをインストールすれば、デバイスマネージャーで YubiKey SmartCard として、認識されているはず。

さっそく CNG 経由で YubiKey を触ってみる。

### PKCS#12 の証明書を作成

Windows で証明書を扱うときは、そう pkcs#12 の pfx ファイル。
いつも作り方を忘れる PKCS#12 の秘密鍵&証明書のパックを作る

ADCSを持ってる人は [Yubico のガイド](https://support.yubico.com/support/solutions/articles/15000006456-yubikey-smart-card-deployment-guide) なんかを参考にどうぞ
YubiKey の中でキージェネレーション等もできます。

今回は openssl で作成してインポートする。

```bash
# SHA256 RSA 2048bit の証明書・秘密鍵を作成
openssl req -newkey rsa:2048 -sha256 -nodes -keyout private.key -x509 -days 365 -out public.pem -subj "/C=JP/ST=Kanagawa/L=Kawasaki/O=Enjoy Struggling/CN=YOURDOMAIN.EXAMPLE"

# PKCS#12 に変換
openssl pkcs12 -export -inkey private.key -in public.pem -out pkcs12.pfx
Enter Export Password: # Keyを保護するパスワード
Verifying - Enter Export Password: # 再入力
```

### YubiKey にインポート

PKCS#12 のキーを Microsoft Base Smart Card Crypto Provider 経由でインポートする。

キーのインポートは管理者権限がいるらしく（なんでや）、管理者権限で以下のコマンドを実行する。

```sh
certutil –csp "Microsoft Base Smart Card Crypto Provider" –importpfx pkcs12.pfx
```

PINの入力画面が表示され、インポートした証明書が、Active Directory のユーザ証明書なんかであればそのまま Windows のログイン等に使える。
複数回インポートすると 9a,　9c...　と順に利用される（上書きはされない）

インポートするだけだったら、yubico-piv-tool でインポートするのと変わらない。

```sh
yubico-piv-tool -s9c -i pkcs12.pfx -KPKCS12 -a set-chuid -a import-key -a import-cert
```

この場合、Certificate を別途 Windows 証明書サービスにインストールする必要がある。

ところで、**minidriver と yubico-piv-tool を同時に使ってはいけない** 
特に、 `yubico-piv-tool` で証明書をインポートした後に、`minidriver` 経由でインポートすると、警告もなくスロットが上書きされてしまう

#### …と、昔は思ってたが、今試してみるとそんなことはなかった

### CNG経由で証明書を利用する

さて、インポートしたキーは何かしらに使える。CNG経由で利用するアプリケーションといえば、VPN や ダイアルアップの認証だが
残念ながら、証明書を使えるVPNサーバー等を持っていないので前回同様 `putty-cac` を利用する。

{% asset_img lena.bmp putty-capi.png %}

CAPI を選んで…

{% asset_img lena.bmp cng.png %}

YubiKey に格納した証明書を選んで…

copy to clipiboard で公開鍵をコピーする。

今回はこんな感じの Vagrantfile を作成してテストした。

```ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "centos/7"
  config.vm.box_check_update = false
  config.vm.provision "shell", inline: <<-SHELL
    echo "PASTE YOUR PUBLICKEY HERE" >> /home/vagrant/.ssh/authorized_keys
  SHELL
end
```

`vagrant up` とすれば、通常はVMの SSHポートが ホストの 2222 ポートにフォワーディングされるので `localhost:2222` に接続できるかを試す。

OpenSC の dll を使った場合とは異なり、Windows標準な感じのPINを入れる画面が出てくる。

{% asset_img lena.bmp credentials.png %}

これは結構素敵。