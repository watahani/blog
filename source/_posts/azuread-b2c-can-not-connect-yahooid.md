---
title: Azure AD B2C に Yahoo! ID を連携しようとして失敗した話
date: 2019-09-23 20:28:11
tags:
  - OIDC
  - Azure
---

今日は Azure AD B2C を OIDC な IdP である Yahoo! ID とつなげてみよう、というお話。

## Azure AD B2C とは

Microsoft が提供する Auth0 みたいなサービス。

<!-- more -->

アプリケーションへの認証を Google や Facebook, Twitter といったソーシャル アカウントで行うために、Azure AD B2C というテナントに、複数の IdP を連携させることができる。

具体的には B2C 側が、連携する IdP から id_token やら userinfo を引っ張ってきて、良しなにユーザーを登録・認証してくれるって感じ。
様々な IdP に対応していて、アプリケーション側は、Azure AD B2C から発行されるトークンだけ見てればいいので色々楽ですよ、というやつですね。タブンネ。

## だめでしたー

タイトルにある通り、結論から言うと連携できなかった。
失敗した理由としては Yahoo! ID が response_mode=query のパラメータを読み込んでくれなかった (※ B2C が response_mode を省略してくれなかった) からなのだけど、いろいろ手順も残しておきたいのでブログにまとめようと思う。

> 追記: カスタム ポリシーで OAuth プロファイルで作成すればいけた。

## 失敗手順

細かい手順は省略しているので、各自ドキュメント等よんで調べてください。

### B2C テナントを作る

略。

### Yahoo! ID を利用するアプリの登録

[ご利用ガイド - Yahoo!デベロッパーネットワーク](https://developer.yahoo.co.jp/start/) に、step by step で手順があるので、その通りにアプリを登録する。

Authorize Code Flow を動かすので、アプリケーションは "サーバーサイド（Yahoo! ID連携 v2）" を選んで、あとは適当に入力する。

![](./azuread-b2c-can-not-connect-yahooid/callback.png)

コールバック URL には、後述するが以下の 2 つを追加しておく。

- https://yourdomain.b2clogin.com/yourdomain.onmicrosoft.com/oauth2/authresp
- https://yourdomain.b2clogin.com/yourdomain.onmicrosoft.com/b2c_1a_trustframeworkbaseyahoo/oauth2/authresp

あとは、検証用に jwt.io とか jwt.ms とか localhost とか必要であれば追加しておく。

### カスタム OIDC プロバイダーとして Yahoo! ID を追加する

組み込みポリシーを利用して B2C に OIDC の IdP を追加するには、`Azure AD B2C` > `ID プロバイダー` > `新しい OpenID Connect プロバイダー` を選択する。

OIDC の場合メタデータ URL を指定すればほぼ完了。Yahoo! ID の場合は以下の URLとなる。

- https://auth.login.yahoo.co.jp/yconnect/v2/.well-known/openid-configuration

クライアント ID とクライアント シークレットは、アプリを作ったときに払い出されたものを。スコープは`openid profile email`、
応答の種類は `code`、応答モードは `query`、ドメインのヒントは、アプリケーションが B2C に対して認証リクエスト投げるときに利用するものだと思うので適当で OK。

あとはクレームのマッピングを [Yahoo! ID の UserInfo API のドキュメント](https://developer.yahoo.co.jp/yconnect/v2/userinfo.html) をみて適当に決める。

![](./azuread-b2c-can-not-connect-yahooid/custom-oidc-provider.png)

手順はこれだけで OK。

### ユーザーフローの作成

`ユーザー フロー` > `新しいユーザー フロー` > `サインアップとサインイン` から、新しいサインアップとサインインフローを作成し、IdP として先ほど登録した OIDC プロバイダー (Yahoo!) を選ぶ。クレームの要求は適当に設定して保存する。

### アプリの登録

Azure AD B2C を IdP として利用するアプリの登録。略。

### 作成したユーザー フローのテスト

作成したユーザー フローを選択し、`今すぐ実行` を選択する。

![](./azuread-b2c-can-not-connect-yahooid/run-flow.png)

### 結果

'Error: invalid_request,Error Description: response_mode is invalid.'

![](./azuread-b2c-can-not-connect-yahooid/result.png)

初めに書いた通り、結論から言うと動かなかった。なぜうまく動かないのか、もう少し詳細にみてみる。

Chrome の [Redirect Path](https://chrome.google.com/webstore/detail/redirect-path/aomidfkchockcldhbkggjokdkkebmdll) という拡張を利用して、サインイン時のリダイレクトの動きを見てみた。

B2C のサインイン ページから Yahoo! へは以下のリクエストが送られていた。

```http
https://auth.login.yahoo.co.jp/yconnect/v2/authorization?
  client_id=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx&
  redirect_uri=https%3a%2f%2fyourdomain.b2clogin.com%2fyourdomain.onmicrosoft.com%2foauth2%2fauthresp&
  response_type=code&
  scope=openid+profile+email&
  response_mode=query&
  nonce=CpKTVRSC%2fgtFG0FSaQEpIg%3d%3d&
  ui_locales=en-US&
  state=StateProperties%3deyJ....
```

で、Yahoo! ID はこのリクエストに対し、以下のエラーを返していた。

```http
https://yourdomain.b2clogin.com/yourdomain.onmicrosoft.com/oauth2/authresp?
  error=invalid_request&
  error_description=response_mode+is+invalid.&
  error_code=1227&
  state=StateProperties%3DeyJ...
```

B2C のエンドポイントは、エラーを受け取ったらそのままアプリに返すらしく、登録していた jwt.ms に以下のようにエラーを返していた。

```http
https://jwt.ms/#
  error=server_error&
  error_description=AADB2C90273%3a+An+invalid+response+was+received+%3a+%27Error%3a+invalid_request%2cError+Description%3a+response_mode+is+invalid.%27%0d%0aCorrelation+ID%3a+b300b4fb-c1ab-491d-86f1-4d1dc129892f%0d%0aTimestamp%3a+2019-09-23+09%3a39%3a54Z%0d%0a
```

ということで、B2C がリクエストに投げる response_mode を指定している部分が悪そうだというのが分かる。実際、Yahoo! ID に投げる Authorize Request から response_mode を消してやるとうまく動く。

respones_mode 自体は OAuth の[OAuth 2.0 Multiple Response Type Encoding Practices](https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html) で、AuthZ レスポンスをどこに返すかを指定するパラメータらしい。
@TakahikoKawasaki さんの [OAuth & OpenID Connect 関連仕様まとめ - Qiita](https://qiita.com/TakahikoKawasaki/items/185d34814eb9f7ac7ef3#13-%E5%BF%9C%E7%AD%94%E3%83%A2%E3%83%BC%E3%83%89-response_mode) が非常にわかりやすかった。

とはいえ、必須のパラメータではないので B2C のパラメータとしては消せてもいい気がするけど…。

### カスタムポリシーで試す

Azure B2C が response_mode を絶対入れてリクエストを送るのがダメなので、色々できるカスタムポリシーで試してみる。

まずは、Client Secret を ポリシー キー に `B2C_1A_YahooAppSecret` として登録する。
その後[B2C Custom Policy Starterpack](https://github.com/Azure-Samples/active-directory-b2c-custom-policy-starterpack) の SocialandLocalAccounts の TrustFrameworkBase.xml の Facebook 部分を以下に入れ替える。

```xml
      <ClaimsProvider>
      <!-- The following Domain element allows this profile to be used if the request comes with domain_hint 
           query string parameter, e.g. domain_hint=facebook.com  -->
      <Domain>yahoo.co.jp</Domain>
      <DisplayName>Yahoo! Japan</DisplayName>
      <TechnicalProfiles>
        <TechnicalProfile Id="Yahoo-OIDCv2">
          <!-- The text in the following DisplayName element is shown to the user on the claims provider 
               selection screen. -->
          <DisplayName>Yahoo!</DisplayName>
          <Protocol Name="OpenIdConnect" />
          <Metadata>
            <Item Key="ProviderName">yahoo</Item>
            <Item Key="METADATA">https://auth.login.yahoo.co.jp/yconnect/v2/.well-known/openid-configuration</Item>
            <Item Key="response_types">code</Item>
            <Item Key="scope">openid profile email</Item>
            <!-- 消す <Item Key="response_mode">query</Item> -->
            <Item Key="HttpBinding">GET</Item>
            <Item Key="client_id">xxxxxxxxx</Item>
          </Metadata>
          <CryptographicKeys>
            <Key Id="client_secret" StorageReferenceId="B2C_1A_YahooAppSecret" />
          </CryptographicKeys>
          <InputClaims />
          <OutputClaims>
            <OutputClaim ClaimTypeReferenceId="identityProvider" DefaultValue="yahoo.co.jp" />
            <OutputClaim ClaimTypeReferenceId="authenticationSource" DefaultValue="socialIdpAuthentication" />
            <OutputClaim ClaimTypeReferenceId="issuerUserId" PartnerClaimType="sub" />
            <OutputClaim ClaimTypeReferenceId="displayName" PartnerClaimType="name" />
            <OutputClaim ClaimTypeReferenceId="email" />
          </OutputClaims>
          <OutputClaimsTransformations>
            <OutputClaimsTransformation ReferenceId="CreateRandomUPNUserName" />
            <OutputClaimsTransformation ReferenceId="CreateUserPrincipalName" />
            <OutputClaimsTransformation ReferenceId="CreateAlternativeSecurityId" />
            <OutputClaimsTransformation ReferenceId="CreateSubjectClaimFromAlternativeSecurityId" />
          </OutputClaimsTransformations>
          <UseTechnicalProfileForSessionManagement ReferenceId="SM-SocialLogin" />
        </TechnicalProfile>
      </TechnicalProfiles>
    </ClaimsProvider>
```

あと、PolicyId は `B2C_1A_TrustFrameworkBaseYahoo` に変えておく (参照してる xml も直しておく)。
できたら `TrustFrameworkBase.xml`, `TrustFrameworkExtensions.xml`, `SignUpOrSignIn.xml` の 3 ファイルを `Identity Experience Framework` にアップロードする。

ClaimsProvider を記述した PolicyId が、callback URL になるらしく、PolicyId が `trustframeworkbaseyahoo` だったら、以下の URL となる。

- https://yourdomain.b2clogin.com/yourdomain.onmicrosoft.com/b2c_1a_trustframeworkbaseyahoo/oauth2/authresp

> ※なんか [ドキュメント](https://docs.microsoft.com/ja-jp/azure/active-directory-b2c/openid-connect-technical-profile) には <https://yourtenant.b2clogin.com/your-tenant.onmicrosoft.com/oauth2/authresp> 使うってかいてあって実際の動作と違う…。なんだこれ？

で、response_mode を消したり、空で設定してみたり…

```xml
<Item Key="response_mode"></Item>
```

しかし B2C からの AuthZ リクエストから response_mode が消えることはなかった…。かなしい。
なお、response_mode を消したり、値を空にすると、デフォルトの `form_post` になる。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">MSさんJS苦手 &amp; SAML脳らしくて、id_token直で返して欲しいくせにfragmentは使いたくないとか言いおってな、出してきおったんや、form_postを。そんな経緯で出来たパラメーターやから、MSさんには必須かもしれん。</p>&mdash; nov matake (@nov) <a href="https://twitter.com/nov/status/1176051340339843072?ref_src=twsrc%5Etfw">September 23, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

なるほど？

ということで、現在のところ Yahoo! ID を Azure B2C と連携することは ~~できないようです。まる。~~ 

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Azure AD B2CのProtocol設定とパラメータの受付が若干クセが強いからOAuth2指定でもscopeにopenidを指定すればOpenID Connectとして動いてくれる&amp;response_mode問題も解決する</p>&mdash; Naohiro Fujie (@phr_eidentity) <a href="https://twitter.com/phr_eidentity/status/1176194980886396928?ref_src=twsrc%5Etfw">September 23, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

ということで、カスタム ポリシーならいけました。

<script src="https://gist.github.com/watahani/6ee0ffff0f4879b760ba5ab171df7430.js"></script>

## 参考

- [Yahoo! ID連携:v2 - Yahoo!デベロッパーネットワーク](https://developer.yahoo.co.jp/yconnect/v2/)
- [Microsoft アカウントでのサインアップおよびサインインを設定する - Azure Active Directory B2C | Microsoft Docs](https://docs.microsoft.com/ja-jp/azure/active-directory-b2c/active-directory-b2c-setup-msa-app)
- [Azure Active Directory B2C 内のカスタム ポリシーで OpenID Connect 技術プロファイルを定義する | Microsoft Docs](https://docs.microsoft.com/ja-jp/azure/active-directory-b2c/openid-connect-technical-profile)
