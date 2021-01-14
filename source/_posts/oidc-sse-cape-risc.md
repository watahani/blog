---
title: OpenID Connect の Shared Signals and Events
date: 2020-12-09 19:38:29
tags:
  - OpenID Connect
  - OAuth
---

本記事は [Digital Identity技術勉強会 #iddance Advent Calendar 2020](https://qiita.com/advent-calendar/2020/iddance) 9日めの記事です。
最近プレビューとして実装された Azure AD の CAE という機能がある。

- [ポリシーとセキュリティのリアル タイムな適用に向けて | Japan Azure Identity Support Blog](https://jpazureid.github.io/blog/azure-active-directory/moving-towards-real-time-policy-and-security-enforcement/)

## 何のための機能か

もともと Azure AD で発行されるアクセス トークンは内包型トークンで、Azure AD の秘密鍵で署名されている。そのため RP はユーザーが提示したトークンについて、Azure AD に通信を行うことなく署名とクレームを検証することで正当性を確認できる。これは逆に言うとクライアントがトークンを一度取得すれば有効期限切れ (既定では 1 時間) まではリソースにアクセスし続けられる。

多くの場合この設計で問題となることは少ないが、以下のようなケースで問題となることがある。

<!-- more -->

- A. ユーザ状態の変化
  1. ある時点で有効なユーザーが、アクセス トークンを取得する。
  2. 次の時点で何らかの要因でユーザーが無効化されたが、発行されたトークンは無効化されないため RP へのアクセスが行える。

- B. 条件付きアクセスの判定
  1. 条件付きアクセス (IdP 側のアクセス制御) で課せられた IP アドレス制御やデバイス状態の制御を突破する。
  2. アクセス トークンの有効期限内であれば上記条件下以外の場所から、RP にアクセスできる。 

> その他にアクセス トークンが奪取されるシチュエーションなどもあるが、その場合 "それどころではない" パターンが多かろうなので特に考慮しない

今までは Azure AD の仕組み上この動作を完全に防ぐことはできず、たとえ IdP 側で IP 制御をしていたとしても「認証済みのトークン」を機器ごと持ちだすことによる、外部ネットワークからのアクセスを許容するしかなかった。

**そもそも論として IP ベースのアクセスのみにすべてを任しており、社内アクセスが絶対に安全であるという境界ネットワークをベースとしたセキュリティを構成していることが問題** でありデバイス ベースのアクセス許可や AIP (Azure Identity Protection) によるリスクベースのアクセスを構成すべきであるという話もある。

また、結局 RP への通知などが即時に行われるかというと技術的にも難しいし、**完全に即時判定されるようになるかというとそうではないと思われる。**

**とはいえリスクを判断する材料/頻度が多いに越したことはなく、** 継続的に RP 側でもアクセスを評価しよう、というのが Continuous Access Evaluation という機能である。

## CAE の動作

現状、Azure AD に実装されている A, B の機能はおよそ以下のとおりである。

- [Continuous access evaluation in Azure AD | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/concept-continuous-access-evaluation)

### A. ユーザ状態の変化

![](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/media/concept-continuous-access-evaluation/user-revocation-event-flow.png)

1. CAE に対応したクライアントがリフレッシュトークンを提示しアクセス トークンの取得を試みる。
2. Azure AD はリフレッシュトークンの有効性を検証し、アクセス トークンを発行する。
3. 管理者がユーザーのセッションとリフレッシュトークンを無効化すると、その情報がイベントとして RP に配信される。
4. その後ユーザーは アクセス トークンを RP に提示する。
5. RP はイベントを基にトークンの有効性を検証し、リジェクトする。

こちらのケースではユーザーの状態 (現時点では以下) が RP に配信される。

- ユーザー アカウントが削除または無効化される
- ユーザーのパスワードが変更またはリセットされる
- ユーザーの MFA が有効になる
- 管理者がユーザーのすべてのリフレッシュ トークンを明示的に無効にする
- Azure AD Identity Protection によってユーザー リスクの上昇が検知される

### B. 条件付きアクセスの判定

![](https://docs.microsoft.com/en-us/azure/active-directory/conditional-access/media/concept-continuous-access-evaluation/user-condition-change-flow.png)

1. CAE に対応したクライアントがリフレッシュトークンを提示し、アクセストークンを取得する。
2. Azure AD では条件付きアクセスの判定を行い、ブロックされなければアクセス トークンを発行する。
3. ユーザーは条件付きアクセスでブロックされるべき場所に移動する。この際アクセストークンの有効期限は切れていない。
4. クライアントは条件付きアクセスで許可されていない場所から、アクセストークンを RP に提示する。
5. RP はアクセストークンの有効性を検証し、さらに Azure AD から通知された条件付きアクセス アクセスで許可される IP アドレスからの通信かを判定する。この場合、条件付きアクセスでブロックされるべき場所からのアクセスなのでアクセストークンはリジェクトされる。

こちらのケースでは、条件付きアクセスで対象の RP が許可される/ブロックされる IP アドレスとユーザーの組み合わせが配信されるものと考えられる。


## Shared Signal and Events Working Group

ブログからはこれらの機能が [Shared Signal and Events Working Group](https://openid.net/wg/sse/) で CAEP (Continuous Access Evaluation Protocol) として標準化を進めていると公表されている。

B は明らかに独自の仕様っぽいが、標準化の範囲なのだろうか。残念ながら公開されている情報からはよくわからなかった。
というのも Azure AD の CAE は対応 RP が Exchange Online や SharePoint Online などの 1st Party 製アプリに限られており、IdP と RP がどのようなプロトコルで会話をしているかについては、外から見えないためだ。

### RISC

同様の機能として Mitigating Catastrophic Account Compromise (RISC) というのも提案されており、内容的には全く同じような感じで RP が IdP からのユーザーが Compromise されたなどの情報をサブスクライブして、通知された情報を基に RP 側のセッションを切断するなどのアクションが行える。

どうやら Google の実装がすでにあるようで、[Cross-Account Protection](https://developers.google.com/identity/protocols/risc) に詳細なドキュメントがある。

通知は jwt の形で送信され、以下のように RP に対してアクセスしているユーザーの sub が通知されるようだ。

```json
{
  "iss": "https://accounts.google.com/",
  "aud": "123456789-abcedfgh.apps.googleusercontent.com",
  "iat": 1508184845,
  "jti": "756E69717565206964656E746966696572",
  "events": {
    "https://schemas.openid.net/secevent/risc/event-type/account-disabled": {
      "subject": {
        "subject_type": "iss-sub",
        "iss": "https://accounts.google.com/",
        "sub": "7375626A656374"
      },
      "reason": "hijacking"
    }
  }
}
```

え、CAEP (A のパターン) と全く同じやん… とも思ったが、[RISC のほうがドラフトも出ており](https://openid.net/2018/07/09/three-risc-implementers-drafts-approved/) なんとなく進んでいるような感じ。

events のタイプも[ドラフト](https://openid.net/specs/openid-risc-event-types-1_0-ID1.htm) が出ており、以下のようなイベントが規定されている。

- 2.1. Account Credential Change Required
- 2.2. Account Purged
- 2.3. Account Disabled
- 2.4. Account Enabled
- 2.5. Identifier Changed
- 2.6. Identifier Recycled
- 2.7. Opt Out
  - 2.7.1. Opt In
  - 2.7.2. Opt Out Initiated
  - 2.7.3. Opt Out Cancelled
  - 2.7.4. Opt Out Effective
- 2.8. Recovery Activated
- 2.9. Recovery Information Changed
- 2.10. Sessions Revoked

このうち Google では、以下の events types に対応しているようであった。

- sessions-revoked
- tokens-revoked
- account-disabled
- account-enabled
- account-purged
- account-credential-change-required
- verification //RP との疎通確認用?

それぞれのイベントの受信時に RP がとるべき [アクションについてもまとめられている。](https://developers.google.com/identity/protocols/risc#supported_event_types)

### RISC と CAEP の違い

ドラフトなどを眺めてみるとどちらかというと RISC は id_token によるユーザー認証の結果発行される RP のセッションを主眼に置いているように見える。
一方 CAEP はドラフトなどはないので Microsoft のドキュメントからの判断になるが RP のリソースへのアクセス (access_token) を主眼においているように書かれているように見える。

また、CAEP は名前の通り、継続的なアクセス評価で RISC は侵害された資格情報を利用した横方向の侵害の連鎖の阻止を主目的としているようだ。
目的が違うのはその通りなのだが、ユーザーの無効化、トークンの破棄、リスクイベントなどは、CAEP と RISC どちらも共通のような気がしておりなんで分かれているのかはイマイチ理解できなかった。

B の機能も CAEP に含むのであればずいぶん話が変わってくるが、公開されている情報からは CAEP の標準化活動については追うことができず、引き続きウォッチしていきたい。このあたり詳しい人いたら Twitter で教えてください。

細かい動作はそのうち試したらまたまとめようと思います。

