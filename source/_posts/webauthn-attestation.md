---
title: WebAuthn の Attestation
date: 2018-11-19 3:52:45
tags:
    - webauthn
    - attestation
    - FIDO
---

# Attestation

WebAuthn に関して、認証の世界で生きてこなかった私が最も取っつきづらかった概念である Attestation について改めてまとめておこうと思う。

<!-- more -->

たぶんあってると思うんだけど、なにせ認証の世界は難しい。

何か間違いや考え違いがあったら [@watahani](https://twitter.com/watahani) まで連絡をくれたらうれしい。

## はじめに

WebAuthn で利用される FIDO 認証は、シンプルにいえば単なる公開鍵を利用した認証だ。TSL や SSH で利用されるアレ。あまり詳しくない人（ワイのことな）のために概要を書くと、ユーザーが持っている秘密鍵とサーバーに保存される公開鍵（キーペア）を利用して認証をする。サーバーからはチャレンジと呼ばれるランダムな文字列が送られ、ユーザーが持っている秘密鍵で署名（暗号化）する。秘密鍵で署名したデーターはサーバーに保存された公開鍵で検証できる。つまり、暗号化されたチャレンジを公開鍵で復号化し、その結果が送ったチャレンジと等しければ正しい秘密鍵で署名されたデータだとわかるわけだ。


{% asset_img lena.bmp challengeresp.png %}


## 証明書

ところで認証の世界には証明書というものがある。例えば TLSプロトコルでは、サーバーの正当性を検証するための「サーバー証明書」や、クライアントの正当性を検証するための「クライアント証明書」がある、といった具合だ。サーバー証明書を例にすると認証されるのがサーバーで、 WebAuthn の認証とちょうど真逆になってしまうので、クライアント証明書を利用した認証を例に説明する。

例えばあなたが社内のネットワーク、あるいは銀行のWebサイト、まあなんでもよいのだが、サーバーにログインするための、クライアント証明書をもっているとする。「クライアント証明書」を持っているというのは、自身に発行された証明書と対応する秘密鍵を持っているという意味だ。

TLS層での通信では、ユーザー認証のために、証明書がサーバーに送られる。その際、Certificate Request に含まれるチャレンジに署名して送る。
サーバーは証明書に含まれる公開鍵を利用して署名の検証ができる。これでめでたくユーザー認証が完了するわけだ。

{% asset_img lena.bmp certificate.png %}

ここで、重要なこととして証明書は何かしらの CA に署名されているということだ。
証明書には、この公開鍵（と対応する秘密鍵）が「誰に対して」「いつからいつまで有効か」などといった情報が、CAの署名付きで記載されている。
署名元の CA が信頼できるならば証明書の内容も正しいと信頼できる。「誰に対して」「いつからいつまで有効な」キーペアだと信頼できる。

## FIDO の Attestation

Attestation はこの CA の署名と同じような仕組みだ。証明書では issuer や CN などの情報と、 Public Key に対して署名が行われているが、FIDO では登録のたびに新しいキーペアが作られる。そのたびに CA に Public Key を送り署名をしてもらうわけにはいかない。そこで Authenticator 内に埋め込まれた Attestation Secret Key で署名をする。 

{% asset_img lena.bmp u2f-attestation.png %}
>u2f attestation

Attestation Secret key に対応する公開鍵には、 Authenticator メーカーによる署名がされており、それが Attestation Certificate である。サーバーでは Attestation signature を Attestation Certificate に含まれる公開鍵で検証し、かつ Certificate Chain を検証することになる。

## Attestation の種類

さて、Attestation にあたる機能は FIDO 認証にかかわらず各プラットフォームに存在していた。例えば Windows Hello の [TPM Attestation](https://docs.microsoft.com/ja-jp/windows-server/identity/ad-ds/manage/component-updates/tpm-key-attestation) や、Android の [Safety-Net Attestation](https://developer.android.com/training/safetynet/attestation)などがそれにあたる。

要は、キーペアを作って、その公開鍵に署名をするっていう機構は認証の世界には昔(?)からあったわけだ。

FIDO では Yubico が主導して作っていた、U2F デバイスで作られる U2F Attestation と、 FIDO2 デバイスで作られる packed Attestation がある。

しかし、各プラットフォームは、すでにキーペアの作成と Attestation の仕組みを持っている。だとしたら、わざわざ新しい規格に追従するだろうか（いやない）。

ということで MS も Google も彼らのプラットフォームで利用していた Attestation を WebAuthn のスペックとしてねじ込んできたわけだ。当たり前だね。

ということで Attestation には

- U2F Attestation
- Packed Attestation
- TPM Attestaion
- Android Key Attestation
- Android SafetyNet Attestation
- None Attestation

の6種類があるわけだ。なので Developer は全部の検証の仕方を知っておく必要がある。

検証の仕方は [Yuriy の Blog](https://medium.com/@herrjemand/verifying-fido2-responses-4691288c8770) が本当に参考になる。

時間ができたら日本語訳でもしたい。

## Attestation のユースケース

Attestation のユースケースとしては主に2つあると思う。1つはエンタープライズ向けに、利用できる Authenticator を制限するというケース。たとえば、YubiKey のこのモデルのみ利用可能だとか、あるいは企業がカスタムして埋め込んだ Attestation を含む Authenticator のみ利用できる、といった具合だろう。

もう1つは、Authenticatorの脆弱性が発見されたときに、登録時の Attestation と照合して利用を制限するといった利用法があるだろう。

## MetaData Service

Attestation の検証に必要な Root Certificate や Authenticator ごとの検証方式などは FIDO Metadata server に登録される…はずだがあまり登録状況は芳しくないらしい。

今度もうちょっと詳しくまとめたい。

いじょ。