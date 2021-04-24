---
title: Azure AD のトークンを PowerShell で取得する
date: 2021-04-24 16:33:00
tags:
  - Azure
  - OAuth
---

## First Of All

業務等で使うなら素直に [MSAL.PS](https://github.com/AzureAD/MSAL.PS/) や、[Microsoft Graph PowerShell SDK](https://github.com/microsoftgraph/msgraph-sdk-powershell) を利用してトークン取得しましょう。
自分で実装しても勉強以外の役にはたぶん立たないです。

Windows 入ってたらとりあえず動くので、勉強会用にそれぞれのフローのコードを書いてみたのだが、勉強会する暇なくて腐ってたので供養。

<!-- more -->

### クライアント資格情報フロー

<https://docs.microsoft.com/ja-jp/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow>

めちゃ簡単。

<script src="https://gist.github.com/watahani/546d21ce1f0368bb90c6ab517843134e.js"></script>

証明書でやるパターンは全然わからんし、めっちゃ .Net のクラス呼んでるので多分 C# で書いたほうが勉強になる。

<script src="https://gist.github.com/watahani/d5b6def478b9f6a1fcb815123f537c53.js"></script>

### 認可コード付与 (Authorization Code Grant)

<https://docs.microsoft.com/ja-jp/azure/active-directory/develop/v2-oauth2-auth-code-flow>

ドキュメントは認証コードなのは無視だ！リフレッシュ トークンの検証をした時期があって、その辺のコードも残ってる。
PowerShell のローカルサーバーはよく止まってしまうんだけど、エラーハンドリングのやり方がわからない。

無駄に PKCE にも対応しているぞ。

<script src="https://gist.github.com/watahani/383f2aff2480e579e27127821897682a.js"></script>

### デバイス許可付与 (Device Authorization Grant)

<https://docs.microsoft.com/ja-jp/azure/active-directory/develop/v2-oauth2-device-code>

これも特に変なことはしてない。

<script src="https://gist.github.com/watahani/f53468b819ab1e35bcc5f4d0d1cb3ee2.js"></script>

## おわり

On-Behalf-Of とか消えつつある SAML Bearer Assertion フローは気が向けば書くかも。
