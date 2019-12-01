---
title: Azure B2C の FIDO2 サンプルを動かす
date: 2019-12-01 15:29:00
tags:
  - Azure
  - OAuth
  - FIDO2
---

この記事は[認証認可アドベントカレンダー](https://qiita.com/advent-calendar/2019/identity) の6日目の記事です。

やっぱ OIDC ネタと FIDO ネタが多いから、どっちも絡めたやつを書けばめっちゃウケるのでは？と思い、 OIDC も FIDO も絡んだネタとして Azure AD B2C と FIDO2 によるパスワードレス サインインをつなぐサンプルがあったことを思い出した。

結論からいうと、くっそニッチな記事になってしまった。最近 Azure しか触ってないから、Azure ネタなんや… すまんやで。

## Azure AD B2C

さて Azure AD B2C は、Twitter や Facebook, その他の OpenID Provider を統合し、Azure AD B2C 独自の Id Token, Access Token を発行することが出来る。要は Auth0 的なサービス。(本ブログ二度目)

組み込みポリシーと呼ばれる既定のプロファイルで、複数の IdP と接続して、サインインフローを作れる。
OIDC のプロバイダーを接続するときのクセが強かったりするのだが、カスタム プロバイダーを追加することで、外部の OP を接続できる。

のだが、複雑なビジネスロジックを組み込もうとすると、カスタム ポリシーを弄ることになる。

## 注意

あらかじめ注意をしておくと、カスタム ポリシーを弄るのはかなりつらい作業で、メンテナンスも大変なのでできることなら組み込みのポリシーを利用することを **強くオススメします**。

B2C のカスタム ポリシーはマジでなんでも出来てしまうので、中身がわかってないとなぜ動かないのか全くわからなくなる。

[公式ドキュメント](https://docs.microsoft.com/ja-jp/azure/active-directory-b2c/active-directory-b2c-overview-custom) にも、こう書いてある。

> ID のプロフェッショナル、システム インテグレータ、コンサルタント、社内の ID チーム。 彼らは OpenID Connect のフローに慣れており、ID プロバイダーや要求ベースの認証を理解しています。

> 注: Azure Active Directory B2C で、カスタム ポリシーは、主に、複雑なシナリオに取り組む用途向けに設計されています。
> ほとんどのシナリオで、組み込みユーザー フローを使用することをお勧めします。

個人的な意見を追加するなら、ID だけでなく XML のプロフェッショナルである必要があると思う。

## カスタム ポリシー

カスタムポリシーに限った話ではないが、ポリシー (ユーザーフロー) はユーザーの入力をもとにクレームを構築し、最終的にトークンを払い出す。

ユーザーの入力は、ID/パスワードであったり、他の OP から返却される ID トークンかもしれない。
それらの入力から claim を取り出し、変換したり、外部 API で Validation したりして、最終的にトークンを作成し B2C の秘密鍵で署名する。

claim の変換規則や、保存先、ユーザーの入力フォーム、それらのすべては **カスタム ポリシーと呼ばれる XML に保存されている。**

そう…… **XML** に保存されているのだ。

## 今回動かすサンプル

今回動かすサンプルはこちら。

Sign-in with FIDO authenticator
<https://github.com/azure-ad-b2c/samples/tree/master/policies/fido2>

ID/Password でサインインするユーザーに、FIDO2 の Authenticator でサインインするフローを追加するもの。

最終的な動きはこんな感じ。

![](https://github.com/azure-ad-b2c/samples/blob/master/policies/fido2/media/registration-user-flow.png)

## 事前準備

残念ながら、このポリシー、これだけでは動かない。

まずはカスタム ポリシーの starterpack を構成する必要がある。

<https://github.com/Azure-Samples/active-directory-b2c-custom-policy-starterpack>

幸いカスタム ポリシーの導入はドキュメントがあるので、その通りに構成すればサインインフローができるはず。

カスタム ポリシーの概要 - Azure Active Directory B2C | Microsoft Docs
<https://docs.microsoft.com/ja-jp/azure/active-directory-b2c/active-directory-b2c-get-started-custom?tabs=applications>

たいていの人はここで XML を見て昇天する。心を強く持ってほしい。

## FIDO2 サーバー部分

さて、事前準備を突破してしまったら、早速 FIDO2 サーバーのサンプルを動かそう。
このサンプルでは、FIDO2 のサーバー部分は以下のサンプルを流用している。

<https://github.com/MicrosoftEdge/webauthnsample>

もともとは HTML も含めたサインアップ/サインインのサンプルだが、ウェブの画面は利用せずに、API だけ利用する。

ホントは Azure Function とかに載せようとしたけど使い方わからなくて断念。
Azure AppService とかも使ったことないので、now.sh にデプロイした。

注意点としては、最終的に WebAuthn が動くのは B2C のログイン画面、つまり `https://yourtenant.b2clogin.com` 上なので、rpId も `yourtenant.b2clogin.com` とする。


- fido.js 内

```js
// const hostname = process.env.HOSTNAME || "localhost";
const hostname = "yourtenant.b2clogin.com";
```

now.sh にデプロイするために、`now.json` を以下のように作成する。

<script src="https://gist.github.com/watahani/1169bdea01979e888dbe1e18b8c35982.js"></script>

後は、`npm install -g now` して `now` でデプロイ完了。

{% asset_img .bmp nowsh.png %}

`https://source-code.username.now.sh` とかでデプロイされるので `https://source-code.username.now.sh/challenge` にブラウザでアクセスしてチャレンジが返れば OK。

URL は後で使うのでメモっておく。

## 静的ファイルのホスト

WebAuthn のカスタム サインインページのための静的 HTML をアップロードする。

Azure B2C では外部の HTML テンプレートを JavaScript でフェッチして、必要なフォームを埋め込んで表示する。

今回は、カスタム HTML 上で Authenticator からのレスポンスをフォームに詰めて、次のフローに流す。

{% asset_img .bmp b2chtml.png %}

適当に gist でも GitHub のリポジトリでも CORS が許可されている場所であればどこでも適当にアップロードしてください。

## アプリの登録

サンプルでは WebAuthn の公開鍵や RawId などを保存するアプリを作成している。まあ DB でもいいんだろうけど、Azure AD にデータを寄せるならこういうやり方もいいのかもしれない。

