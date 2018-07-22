---
title: WebAuthn もくもく会を開催しました
date: 2018-07-23 02:04:23
tags:
  - FIDO
  - WebAuthn
  - 勉強会
  - CTAP
---

# WebAuthn もくもく会

実は土曜日に [WebAuthnもくもく会](https://fido2-workshop.connpass.com/event/95298/)　というものを企画して、来ていただいた2人と議論したり、各自もくもくしたりしてました。
<!--more -->

当日なんだかんだで色々とお話ができたので、忘れないうちに話したことをまとめようとこのブログを書き始めました。

---

<!-- toc -->

---

## なんで突発的にもくもく会企画したのか

最近仕事で FIDOまわりをさわる時間がなかったこと、いろいろと**フラストレーション**がたまってたこと。**なんかやってやるぞという気持ちになった**ことなど…

よくわからないことが重なり、一人でもいいからと思いつつ、コッソリ connpass にイベント張ってみたところ、なんと参加してくださった人がいて、圧倒的感謝以外ありえない。

先に言いたいことを言っておくと、 FIDO 周りの技術的な議論って足りていないと思っていて、例えば

- [既存サービスへののデプロイの方法](https://builderscon.io/tokyo/2018/session/9f0ac19c-0367-4307-a3d4-e5431d80267e)だとか
- Authenticator ロストしたときの復旧方法だとか
- Federation サービスとの連携だとか（FAPIでは議論されてるけど、IDサービス系とかEnterpriseだとかの標準とか）

みたいなこと。そんなことを話せるようになればいいなあと思っています。

今回は  **もくもく会** ですので、作業中心でしたけれども、雑談交じりにいろいろと議論できたこともあったのでまとめてみます。

## FIDO 関連で、今なにが動くか的なこと

[YubiKey Android に刺したらU2Fは動くよ](https://qiita.com/82p/items/37eb6ab387d216003829)って話をさせてもらった。意外と知られてなかったので少し悲しい。

代わりに @shiroica さんに Android Chrome の WebAuthn 先々週動いてたのに動かんくなってることを教えてもらった。

<blockquote class="twitter-tweet" data-partner="tweetdeck"><p lang="en" dir="ltr"><a href="https://twitter.com/apowers313?ref_src=twsrc%5Etfw">@apowers313</a> Chrome Canary support webauthn! <a href="https://t.co/Yiu1qrRR3w">pic.twitter.com/Yiu1qrRR3w</a></p>&mdash; 82@BLE LE (@watahani) <a href="https://twitter.com/watahani/status/1017321764722900993?ref_src=twsrc%5Etfw">July 12, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

>先々週は動いてた図


試してみると、ほんとに動かんくなってました。なんか問題があったんだろうか。

ところでそもそも `Android SafteyNet Attestation` ってなんだっけ？

## Attestation チェックしなければマジ簡単

Attestation の話になったとき、WebAuthn って Attestation チェックしなければマジ簡単に実装出来るよねという話に。

Extensions も無視すれば、マジで簡単なので今度のもくもく会では Most Simple WebAuthn Server を立てるのをしてみようかな～と、思いました。

で、実際今から WebAuthn 学び始める人は、最初 Attestation 無視してサーバー立ててみるのがいいんじゃないかーみたいな話をしてました。

順番的には多分以下の順で理解していくと、全体像がつかみやすいと思います。

1. Public Key の登録と認証(MUST)
1. Attestation チェック(MAY)
1. Extensions (MAY)

## Extensions について

これはイマイチ私が分かってなかったので教えてもらいました。

大前提として Extensions は今のところ、以下の種類があること（たぶん）。

- FIDO AppID Extension (appid)
- Simple Transaction Authorization Extension (txAuthSimple)
- Generic Transaction Authorization Extension (txAuthGeneric)
- Authenticator Selection Extension (authnSel)
- Supported Extensions Extension (exts)
- User Verification Index Extension (uvi)
- Location Extension (loc)
- User Verification Method Extension (uvm)
- Biometric Authenticator Performance Bounds Extension (biometricPerfBounds)

Authenticator が返す Extensions は Authenticator の署名がつくが、Client が返す Extensions は署名が付かず、`credentials.create()` や `credentials.get()` の戻り値で `getClientExtensionResults` で取得できること。

ほとんどの Extensions は Authenticator 側でも Client 側でも実装して良さそうだとこと。

ということは location Extensions なんかは Authenticator が返してもいいし、 Client が返しても良い。その場合は、署名が付いてる Authenticator 側のを優先するのかなぁ？

で、そんな話をしていると Location Extension を Authenticator が返すときってあるんですかね？という話になって

スマホがAuthenticatorになるときとかじゃないですか？ って話になりました。

## スマホがCTAP対応した Authenticator になる事について

まずは CTAP 実装するのは大変だよねという話になりました。

まぁ、BLE や NFC の Low Level な実装をしなければならないので、そりゃ大変だろうね。

スマホが CTAP 対応して PC や他のスマホの Registration できるようになるのが理想だよね、ってのは大体みんな同意していたように思います。

つまりは、 PC ログインするときに スマホが FIDO 対応の Authenticator になって、CTAP で PC と通信（BLE or NFC）して、 YubiKey みたいな外部 Authenticator として動けばいいよねって話。

ただ、実際のユースケース次第では UAF で十分だとも思ったり、UAF としても 外部 Authenticator としても動くような Client 作れないかなあ（Google 先生が作ってくれないかなあ）みたいな、夢の話もしてました。

## Server Requirements and Transport Binding Profile なる文書について

<blockquote class="twitter-tweet" data-partner="tweetdeck"><p lang="ja" dir="ltr">冒頭 &quot;These authenticators are expected to communicate to servers that will validate registration and authentication requests.&quot; って書いてあるけど、serverがvalidateするのはresponseじゃないのか？ <a href="https://t.co/gunRPjk2b6">https://t.co/gunRPjk2b6</a></p>&mdash; nov matake (@nov) <a href="https://twitter.com/nov/status/1020162149665058816?ref_src=twsrc%5Etfw">July 20, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

>金曜に @nov さんが読んでいた文書

これ、普通に WebAuthn のスペックの話だと思ったら、[Server Requirements and Transport Binding Profile](https://fidoalliance.org/specs/fido-v2.0-rd-20180702/fido-server-v2.0-rd-20180702.html) なる謎の文章でした。

タイポが多いこともさることながら、 Attestation のチェックが MUST だったり、

> [[!WebAuthn#sctn-attestation-types]] defines multiple Attestation Types. A server MUST support one of the attestation formats.
> Servers MUST support basic attestation
> 
> Servers MUST support self attestation
> 
> Servers MAY support Privacy CA attestation
> 
> Servers MAY support Elliptic Curve Direct Anonymous Attestation (ECDAA)

!??

えらい具体的なレスポンスメッセージがあったり

> [7.3.2. Examples](https://fidoalliance.org/specs/fido-v2.0-rd-20180702/fido-server-v2.0-rd-20180702.html#examples)
> ...略
> Success Response:
> 
> HTTP Status Code: 200 OK
>
> Body: application/json formatted ServerPublicKeyCredentialCreationOptionsResponse

```js
    {
        "status": "ok",
        "errorMessage": "",
        "rp": {
            "name": "Example Corporation"
        },
        "user": {
            "id": "S3932ee31vKEC0JtJMIQ",
            "name": "johndoe@example.com",
            "displayName": "John Doe"
        },

        "challenge": "uhUjPNlZfvn7onwuhNdsLPkkE5Fv-lUN",
        "pubKeyCredParams": [
            {
                "type": "public-key",
                "alg": -7
            }
        ],
        "timeout": 10000,
        "excludeCredentials": [
            {
                "type": "public-key",
                "id": "opQf1WmYAa5aupUKJIQp"
            }
        ],
        "authenticatorSelection": {
            "residentKey": false,
            "authenticatorAttachment": "cross-platform",
            "userVerification": "preferred"
        },
        "attestation": "direct"
    }
```

皆でナナメ読みした結果

> This document contains a non-normative, proposed REST API for FIDO2 servers. While this interface is not required, it is the interface that is used for the FIDO2 conformance test tools so that servers can receive and send messages in a standard way for those messages to be validated by the conformance test tools.

`that is used for the FIDO2 conformance test tools` って書いてあるんで、来たる [FIDO2 の Interoperability Testing](https://fidoalliance.org/certification/interoperability-testing/) に向けた文書っぽいねって話でまとまりました。

タブンネ

## もくもく会でやったこと

私以外の2人は KeyCloak の WebAuthn プラグインを作ったり U2F プラグインを試したりしていました。

<blockquote class="twitter-tweet" data-partner="tweetdeck"><p lang="ja" dir="ltr">とりあえずKeycloakのRequiredActionからyubikeyのLチカをWebAuthnで出来たので今日は良しとしよう。</p>&mdash; shiroica (@shiroica) <a href="https://twitter.com/shiroica/status/1020593961960812544?ref_src=twsrc%5Etfw">July 21, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" data-partner="tweetdeck"><p lang="ja" dir="ltr">https対応していないとU2fBadConfigrationExceptionが投げられるっぽいな...<br>週末にやるか...<a href="https://t.co/rttjyn4VGA">https://t.co/rttjyn4VGA</a></p>&mdash; 56 (@kg0r0) <a href="https://twitter.com/kg0r0/status/1019976870727593984?ref_src=twsrc%5Etfw">July 19, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


私はというと、流されて KeyCloak をインストールして動かしてみたり、Yubico の ツールを [scoop bucket](/2018/03/12/scoop-bucket/) に追加しようとしたり、 **人生相談** をしたり…と

<blockquote class="twitter-tweet" data-partner="tweetdeck"><p lang="ja" dir="ltr">人生相談会からの keycloak会 <a href="https://twitter.com/hashtag/webauthn%E3%82%82%E3%81%8F%E3%82%82%E3%81%8F%E4%BC%9A?src=hash&amp;ref_src=twsrc%5Etfw">#webauthnもくもく会</a></p>&mdash; 82@BLE LE (@watahani) <a href="https://twitter.com/watahani/status/1020556292941680641?ref_src=twsrc%5Etfw">July 21, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


WebAuthn 周りのことは [Server Requirements and Transport Binding Profile](https://fidoalliance.org/specs/fido-v2.0-rd-20180702/fido-server-v2.0-rd-20180702.html) をパラパラナナメ読みするだけで終わって、作業自体はあまり進みませんでした。

## 所感

もくもく作業が進まなかったのは反省ですが、先に書いた通り色々な意見交換や議論ができたことで、全体的には大満足でした。

冒頭に書いた

- [既存サービスへののデプロイの方法](https://builderscon.io/tokyo/2018/session/9f0ac19c-0367-4307-a3d4-e5431d80267e)だとか
- Authenticator ロストしたときの復旧方法だとか
- Federation サービスとの連携だとか（FAPIでは議論されてるけど、IDサービス系とかEnterpriseだとかの標準とか）

といった話だとか

- FIDO2 と U2F, UAF の関係
- Resident Key の扱い方法（急に出てきたな）

みたいな話も今後、議論できるようにしていきたいですね。

ところで、今回の勉強会は、**Yahoo! JAPAN オフィスの [LODGE](https://lodge.yahoo.co.jp)** という 7/20 現在フリーで使えるコワーキングスペースで行ったのですが、~~隣の席と後ろの席とで、怪しいセミナーや振り込みが必要な塾生への勧誘が行われていたこと以外は~~ とても素晴らしい場所でした。

また利用しようと思います！（なくならないでくれー）

## 最後に

今週末は色々充実した二日間でした。

日曜日、朝からカラオケに行き、[横浜のボードゲームカフェ](https://jellyjellycafe.com/shoplist/yokohama)に行った後に、[YELLOW SUBMARINE](http://www.yellowsubmarine.co.jp/shop/shop-006.htm) で [気になったボドゲ](https://twitter.com/watahani/status/1021022101937926144) 買って、友人宅で遊ぶというコンボを決めて、夜中11時前、終電間際の電車に乗りながらこのブログを書いてます。

**かなり酔っ払って**書いてるので何か不備やマチガイがある可能性があります。ご了承ください。
