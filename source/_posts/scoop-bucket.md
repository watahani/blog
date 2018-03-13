---
title: scoop bucket を作成する
date: 2018-03-12 20:12:44
tags: 
  - "scoop"
  - "YubiKey"
---

# scoop bucket を作成する

以前、 [scoop](http://scoop.sh/) という Windows 用のパッケージ管理ソフトを知り、SDK などのインストールは scoop で完結させようとしてきました。しかし scoop の[デフォルト Bucket](https://github.com/lukesampson/scoop/tree/master/bucket) や [extras Bucket](https://github.com/lukesampson/scoop-extras) に存在しないソフトウェアはインストールはできません。

そこで今回はオレオレ scoop bucket を作成してみようと思います。

何事も同じですが、 [公式ドキュメント](https://github.com/lukesampson/scoop/wiki/App-Manifests) が参考になります。

## お品書き

* bucket の作成
* manifest.json
* auto update

### bucket の作成

bucket は scoop のアプリケーションリストで、実態は Git リポジトリと manifest file です。とりあえず、最もシンプルな bucket を作成して、使用感を確かめてみます。

```ps1
> mkdir my-bucket
> cd my-bucket
> git init
> echo "# README" | Out-File -Encoding utf8 README.md
> git add .
> git commit -m "initial commit"
```

これで bucket は出来上がりです。早速、 scoop に追加してみましょう。

```ps1
> scoop bucket add my-bucket .
Checking repo... ok
The my-bucket bucket was added successfully.
> scoop bucket list
extras
my-bucket #added
versions
```

ちなみに `scoop bucket rm my-bucket` で削除できます。

### manifest

このままだと何の役にも立たないので、 bucket に manifest file を追加します。

試しに YubiKey の personailazion tools をインストールしてみます。


yubikey-personailation-tool.json

```json
{
    "homepage": "https://www.yubico.com/support/knowledge-base/categories/articles/yubikey-personalization-tools/",
    "version": "1.18.0",
    "license": " Copyright (c) 2014-2016 Yubico AB",
    "architecture": {
        "64bit": {
            "url": "https://developers.yubico.com/yubikey-personalization/Releases/ykpers-1.18.0-win64.zip"
        },
        "32bit": {
            "url": "https://developers.yubico.com/yubikey-personalization/Releases/ykpers-1.18.0-win32.zip"
        }
    },
    "bin": [
        "bin\\modhex.exe",
        "bin\\ykchalresp.exe",
        "bin\\ykgenerate.exe",
        "bin\\ykinfo.exe",
        "bin\\ykparse.exe",
        "bin\\ykpersonalize.exe"
    ]
}
```

コミット＾＾～

```ps1
> git add .
> git commit -m "add yubikey-personalizaion-tool"
```

scoop 側からは、

```ps1
> scoop update
> scoop search yubikey
'my-bucket' bucket:
    yubikey-personalization-tool (1.18.0)
> scoop install yubikey-personalization-tool
> ykpersonalize -h
Usage: ykpersonalize [options]
...
```

使えますね。

### auto update

scoop には bucket の manifest を自動更新する機能があります。
アップデートを手動でするのは面倒なので、さっそく設定しましょう。

先ほど作成した manifest にバージョンチェックを追加します。

* バージョンチェック

`url` にはバージョンチェックする URL を、 `re` には正規表現でバージョンを抜き出す regex を記述します。

```json
 "checkver": {
        "url": "https://www.yubico.com/support/knowledge-base/categories/articles/yubikey-personalization-tools/",
        "re": "ykpers-(\\d+?\\.\\d+?\\.\\d+?)-win64\\.zip"
    },
```

* アップデートURL

`url` に `checkver` で検索した $version を変数としてダウンロードURLを記述します。
checkver の `re` に `(?<variable-name> regex)` のように記述することで、 `$variable-name` のような変数を利用することも可能です。

```json
    "autoupdate": {
        "architecture": {
            "64bit": {
                "url": "https://developers.yubico.com/yubikey-personalization/Releases/ykpers-$version-win64.zip"
            },
            "32bit": {
                "url": "https://developers.yubico.com/yubikey-personalization/Releases/ykpers-$version-win32.zip"
            }
        }
    }
```

あとは自動アップデートの際に hash 計算もしてくれるのですが、 `architecture` に `hash` プロパティがないとエラーになってしまうので、とりあえず空でもよいので追加しておきます。

```json
    "architecture": {
        "64bit": {
            "url": "https://developers.yubico.com/yubikey-personalization/Releases/ykpers-1.18.0-win64.zip",
            "hash": ""
        },
        "32bit": {
            "url": "https://developers.yubico.com/yubikey-personalization/Releases/ykpers-1.18.0-win32.zip",
            "hash": ""
        }
    },
```

こんな感じで manifest を更新したところで、自動アップデートをしてみます。
自動アップデート事態は [scoop 本家](https://github.com/lukesampson/scoop.git) のスクリプトを利用します。

```ps1
> git submodule add https://github.com/lukesampson/scoop.git scooop
> .\scooop\bin\checkver.ps1 * -dir . -u

yubikey-personalization-tool: 1.18.1 (scoop version is 1.18.0) autoupdate available
Autoupdating yubikey-personalization-tool
Downloading ykpers-1.18.1-win32.zip to compute hashes!
Loading ykpers-1.18.1-win32.zip from cache
Computed hash: a886c3b7f5581ce4a5a94de0af473e67d79a0958d82ec69500993e932d2ff136
Downloading ykpers-1.18.1-win64.zip to compute hashes!
ykpers-1.18.1-win64.zip (817.2 KB) [===========================================================================================================================================================] 100%
Computed hash: a5f54b80f2ac0815f2747943e521f7c8b8d0627cf311b2114b64a9c74c818322
Writing updated yubikey-personalization-tool manifest
```

こんな感じで、自動アップデートもコマンド一発でできます。いい感じ。
あとは github にでもリポジトリを作って、チームメンバーで共有すればOKですね。

ということで、最近仕事で使っていた yubikey 関連のツールをインストールする scoop bucket を作りました。

[82p/scoop-yubico-bucket: scoop bucket of yubico tools](https://github.com/82p/scoop-yubico-bucket)

こんな感じで使えます。

```ps1
> scoop bucket add yubico-tool https://github.com/82p/scoop-yubico-bucket.git
> scoop install yubikey-personalization-tool
> ykinfo -s
serial: xxxxxxx
```
