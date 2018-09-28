---
title: 雑感 Microsoft Ignite What's new for Windows Hello for Business
date: 2018-09-28 01:08:17
tags:
 - YubiKey
 - FIDO2
 - WebAuthn
 - Windows Hello
---

9/24~28（現地時間）、まさに今開催中の Microsoft Ignite 2018 だが、仕事やらなんやらで全然追えていない。

が、せめて仕事とも関連するセッションでこれだけは聞こうと思っていた2セッションの雑感をば

<!-- more -->

## Getting to a world without passwords

<https://myignite.techcommunity.microsoft.com/sessions/64557>
<iframe width="560" height="315" src="https://www.youtube.com/embed/Au7spkRcDFU" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

一つ目は、Windows Hello, モバイルアプリの Microsoft Authenticator, FIDO2 Security Key でパスワードレスログインができるようになったという発表。

モバイルアプリの Microsoft Authenticator に関してはパスワードレスログインがすでに個人向けにはできるようになっていたので、まあ知ってたって話だった。

FIOD2 Security Key に関しては、FIDO2 の Security Key つかったユーザネームレス・パスワードレスのログインデモをしてた。

{% asset_img lena.bmp cap1.png %}

とりあえずロードマップとしては 10月のアップデートから Microsoft Account で使えるようにってことなので、来月のアップデートからパーソナルアカウントでは試せるようになるらしい。楽しみ。

## Microsoft Ignite What's new for Windows Hello for Business
<https://myignite.techcommunity.microsoft.com/sessions/64572#ignite-html-anchor>

<iframe width="560" height="315" src="https://www.youtube.com/embed/FxDx2yk05Nw" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

二つ目は、 Windows Hello for Business で、Windows Hello の PIN/生体認証,もしくは FIDO2 Security Key で Azure AD に参加した Windows 10 マシンにログインできるようになったという話。

Enterprise 向けに `Security Key` がやたら強調されていた。完全にスマートカードの Azure AD 版だよね、コレ。

デモでは Yubico の YubiKey 5 NFC と Feitian の指紋認証のUSB Authenticator が登場していた。
Feitian のキーの指紋認証も動くようになっていて、PIN 入れるのだるい勢としてはかなり気になった。

{% asset_img lena.bmp cap_keys.png %}

以前早期体験プログラムがあるらしいと聞いたことがあったが、 "Getting to a world without passwords" のセッション同様、Emirates 航空なんかがユーザーとして試していたらしい。Emirates のでっけえ飛行機乗りたい。

{% asset_img lena.bmp cap_users.png %}

ロードマップとしては来年頭(Q1) にパブリックプレビューで使えるようになるらしい。ここら辺も前評判通りだな。

ハイブリット環境下、ローカルリソースにも使えるぞ。Virtual Smart Card は Deprecate だ乗り換えろ

{% asset_img lena.bmp cap2.png %}

って話が印象的だった。

## WIP

今いる会社では Windowsログインに2段階認証を追加するサードパーティーアプリを作っていて、まあ、わかってたことなんだけど Windows Hello for Business はそれの完全に上位互換だった。

この未来をみて、ワイが食ってくためにどこのジャンルで戦っていけばいいんだろうか…。技術書典の原稿が全然進んでないんだけど大丈夫なんだろうか…。

あんま深く考えると寝れなくなるので、細かい感想はまた今度。

ねる。