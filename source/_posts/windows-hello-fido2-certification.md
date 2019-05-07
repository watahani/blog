---
title: Windows Hello が FIDO2 Certificate を取得
date: 2019-05-07 17:29:48
tags:
- FIDO2
- WebAuthn
- Microsoft
---

## Windows Hello FIDO2 certification gets you closer to passwordless

https://techcommunity.microsoft.com/t5/Windows-IT-Pro-Blog/Windows-Hello-FIDO2-certification-gets-you-closer-to/ba-p/534592

Windows 10 version 1903 から、Windows Hello が、正式に FIDO2 Certified になるとのこと。やったぜ。

<!-- more -->

Windows 10 向けの [Firefoxでの WebAuthn 対応](https://forest.watch.impress.co.jp/docs/news/1175608.html) はすでに発表されていたが、Chrome ベースブラウザ (Edge も含む) もすぐに対応予定とのこと。

> (なお、2月に Public Preview と噂されていた Azure AD の WebAuthn 対応はまだ音沙汰無しの模様)
> まあ、このあたりは Chromium のコミュニティーベースの開発になるのかな？よく知らんけど、その辺の issue 追ってけば開発状況もわかる筈…。

## Microsoft Build

おまけで、ちょうど 5/6 (現地時間) にやっていた Microsoft Build でも、認証関連のセッションがあったのでご紹介

- Simplifying your app’s user sign-in and authentication using the Microsoft identity platform
  - https://mybuild.techcommunity.microsoft.com/sessions/77028

{% asset_img lena.bmp aad-quicstart.png %}

MSAL ライブラリ使った OIDC のサンプル作成だけど、公式ドキュメントがわかり辛いのに、Quickstart のドキュメントはすごいわかりやすそうで草。

Device Code Flow って以前からサポートされてたんですねー。知らんかった。
`az login` とかに実装されていて `az login --use-device-code` で試せるし、MSAL のライブラリにも実装されているので、自分で作ったアプリでも、スマホで Azure AD にサインインしてれば QR コードでサインイン みたいなのもサクッと作れる…はず。

- [How Device Code Flow works in Azure AD](https://joonasw.net/view/device-code-flow)
