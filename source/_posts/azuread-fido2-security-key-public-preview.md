---
title: Azure AD の FIDO2 Security Key 対応のパブリックプレビューが来たー
date: 2019-07-15 02:20:43
tags:
  - Azure
  - YubiKey
  - FIDO2
---

## 近況

日本時間 2019-07-10 に [Azure AD の FIDO2 Security Key 対応が来た](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Announcing-the-public-preview-of-Azure-AD-support-for-FIDO2/ba-p/746362)、ということで、早速試してみたので、簡単に手順と検証経過をまとめておく。

<!-- more -->

実は先週末に結婚式をしてから、そのまま夏休みを取り沖縄旅行に行っていた。
界隈では 7pay の不正利用が盛り上がってたが、沖縄ではセブンイレブン初進出で盛り上がっており、オープン翌日も入店待ちができるほどのお祭り状態で、沖縄は平和だなあと。

<blockquote class="twitter-tweet" data-lang="en"><p lang="ja" dir="ltr">海 <a href="https://t.co/DGlPGKSHvN">pic.twitter.com/DGlPGKSHvN</a></p>&mdash; 82@はに (@watahani) <a href="https://twitter.com/watahani/status/1149842125380411394?ref_src=twsrc%5Etfw">July 13, 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

ちなみに、旅先でサクッと構築できるやろーと思って、沖縄からこんばんは、とブログの下書きを書いていたけど、環境構築に思ったより時間がかかって、帰ってきて今ブログを書いている。

## 概要

昨年の Ignite で 2019年の頭にはパブリックプレビューが来るといわれていた Azure AD 向けの　FIDO2 Security 対応がやっと来たらしい。

今回のアップデートで Azure AD のユーザーが Office 365 などに、セキュリティキーを利用してパスワードレスサインインが可能となる。

と、同時に Azure AD Joined な 1809 以降 の Windows 10 マシン (1903 以降推奨) にセキュリティキーを利用してサインインが可能になる。

公開ドキュメントは以下

- [Configure Azure Active Directory passwordless sign in (preview) | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-enable)

ブログとかはこのあたり

- [New Azure Active Directory capabilities help you eliminate passwords at work](https://www.microsoft.com/en-us/microsoft-365/blog/2019/07/10/new-azure-active-directory-capabilities-eliminate-passwords/)
- [Announcing the public preview of Azure AD support for FIDO2-based passwordless sign-in - Microsoft Tech Community - 746362](https://techcommunity.microsoft.com/t5/Azure-Active-Directory-Identity/Announcing-the-public-preview-of-Azure-AD-support-for-FIDO2/ba-p/746362)

## 環境

- Windows 10 Pro 1903
- YubiKey 5 NFC

いつの間にかアマゾンでも買えますね。

<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=82p-22&language=ja_JP&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B07HBD71HL&linkId=9c1355e56ae96249c8d4c62155850112"></iframe>

## セットアップ

ステップとしてはこんな感じ

- Azure AD 側の設定
- Windows 10 マシンの設定 (Intune 利用)
- ユーザーによるセキュリティキーの登録&利用

### Feature Preview の有効化

2019-07-14 時点で FIDO2 Security Key の Public Preview を利用するには、Azure AD の Feature Preview に関する設定変更が必要。

管理者で Azure Portal にサインインして以下の設定を変更する。

`Azure Active Directory` > `ユーザー設定` > `Manage feature preview settings`

{% asset_img lena.bmp user-feature-preview.png %}

ひとまず All User で設定したが、管理者 + 対象ユーザーのみ指定すればよい気がする。

{% asset_img lena.bmp user-feature-target.png %}

最大のつまずきポイントは、この設定の反映に丸一日以上かかることがある、ということ。スキューバダイビングなどをしながらゆっくり待とう。

<blockquote class="twitter-tweet" data-lang="en"><p lang="ja" dir="ltr">&gt; Enable new passwordless authentication methods<br>で詰まってるんですけど、 each methods が出ない...<a href="https://t.co/SJdXtPP9Xb">https://t.co/SJdXtPP9Xb</a> <a href="https://t.co/UNUqMTxuIN">pic.twitter.com/UNUqMTxuIN</a></p>&mdash; 82@はに (@watahani) <a href="https://twitter.com/watahani/status/1149649631539691520?ref_src=twsrc%5Etfw">July 12, 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" data-conversation="none" data-lang="en"><p lang="ja" dir="ltr">Preview featureをEnableにして、しばらく待たないとダメですね。ほっとくといつの間にか出ます</p>&mdash; Naohiro Fujie (@phr_eidentity) <a href="https://twitter.com/phr_eidentity/status/1149830688041869312?ref_src=twsrc%5Etfw">July 12, 2019</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

### Authentication Methods

丸一日ぐらい待てば、 `Azure Active Directory` > `認証方法` > `認証方法ポリシー (プレビュー)` に FIDO2 セキュリティキーが表示される。

{% asset_img lena.bmp authentication-methods.png %}

有効化して、対象ユーザーを適当に設定して完了。

オプションで `Key RESTRICTION POLICY` が設定できる。セキュリティキーの aaguid を指定してホワイトリストおよびブラックリスト方式で制限できる模様。動くかは未確認。

...って、Attestation 使わへんのかーい！

### Windows 10 デバイスでセキュリティキーでのサインインを有効化

Security Key でのサインインを有効化するためのポリシーを設定する
多分、設定方法としては 3 通り

1. Intune の Windows Hello for Business の設定でテナント全体に適用
1. Intune のプロファイルを作成し、グループ or ユーザーに適用
1. Windows Configuration Designer でマシンごとに適用

ひとまず、1 と 2 は試して動いた。 

1 のテナント全体の設定は、`Intune` > `デバイスの登録` > `Windows の登録` > `Windows Hello for Business` > `プロパティ` > `設定` で、`サインインのセキュリティ キーを使用` を有効に

{% asset_img lena.bmp enable-securitykey-in-intune.png %}

2 のポリシーでグループに適用するには、 `Intune` > `デバイスの構成` > `プロファイル` で新しいプロファイルを作成。

プラットフォームは `Windows 10 以降`、プロファイルの種類は `カスタム` で以下の値を設定する。

- OMA-URI: ./Device/Vendor/MSFT/PassportForWork/SecurityKey/UseSecurityKeyForSignin
- Data Type: Integer
- Value: 1

なお、Intune のプロファイル降ってくるのに 1 時間ぐらいかかった。

{% asset_img lena.bmp enable-securitykey-in-intune-profile.png %}

レジストリは多分 `HKEY_LOCAL_MACHINE\Software\Microsoft\Policies\PassportForWork\SecurityKey` の `"UseSecurityKeyForSignin"=dword00000001` あたりを設定してるっぽいけど細かくは調べてないし、余計な事せずマニュアル通りにやろうということで。

~~3 はだれか試してちょ。~~ [試している記事があった](https://qiita.com/murasamelabo/items/8a1bd6f04d71e550c6cf#%E6%96%B9%E6%B3%952--windows-%E6%A7%8B%E6%88%90%E3%83%87%E3%82%B6%E3%82%A4%E3%83%8A%E3%83%BC%E3%81%A7%E3%81%AE%E8%A8%AD%E5%AE%9A)

## クライアント側の設定

前提として Windows 10 マシンで Azure AD Join する必要がある。

~~Intune のポリシーが当たっていれば、MFA と Hello for Business の PIN の設定も走るはず。(Intune を利用しない場合に Hello for Business セットアップする方法はよく知らない)~~

Hello for Business の有効化は必須ではないとのこと。

その後、<https://myprofile.microsoft.com> に Edge でアクセスしてセキュリティキーを登録するの ~~だが、http からリダイレクト設定が行われていないらしく、ちゃんとスキーマまで入力しないとアクセスできなかったりするので注意。(直接 <https://mysignins.microsoft.com/security-info> に飛んだほうが良いかも。)~~

> 2019-07-16 現在、myprofile.microsoft.com にアクセスで特に問題なさげ

Authentication Methods の設定が反映されていればセキュリティ設定で Security Key を追加すれば完了。

{% asset_img lena.bmp add-securitykey.png %}

サインインするときは、Security Key を選択して YubiKey の場合は PIN 入れてタッチ。

{% asset_img lena.bmp securitykey-cp.png %}

セキュリティキーに複数の Credential が入っていても、最後に登録された (というより、多分レスポンスの中の一つ目の、かな。) ユーザーでしかサインインできないようであった。

Web のサインインももちろんできる。

- [Azure AD で FIDO キーでサインインする1 (設定有効化～ブラウザ サインイン) - Qiita](https://qiita.com/murasamelabo/items/0799be7bb9d20ae7b53b)

その時は複数ユーザーが入っていた場合、もちろん選択可能であった。

{% asset_img lena.bmp cred-selector.png %}

## ちょっと分析

ひとまずログを確認してみる。

CTAP のログはイベントビューア `アプリケーションとサービスログ` > `Microsoft` > `Windows` > `WebAuthnN` で確認できる。N が大文字名なのが歴史を感じる。

どうやら CTAP コマンドの送信は 210x 番台、生データが入ってんのは 110x 番台っぽい。
ということで、210x 番台のログで GetAssertion か MakeCredential を探して、そのあとの 110x 番台のログ見れば、中身が見える。

たとえば GetAssertion のレスポンスは 1104 なので、こんな感じでログがある。

{% asset_img lena.bmp event-1104.png %}

CBOR の中身はこんな感じ

```json
{
  1: {"id": h'0141834C8AA4AD3C0E11773B864B53A2', "type": "public-key"}, 
  2: h'356C9ED4A09321B9695F1EAF918203F1B55F689DA61FBC96184C157DDA680C818500000008A16B686D61632D7365637265745820FED320F6DC18C59778C259423A8F8F06CA7383230EA664A5BF62A1111C549465', 
  3: h'304402201AF81349C0605F78FE6ECB8E91C456591DC813451F172E70972FA1E91740728A022075981315DE6C3B8BBCCC3C7BD453B65F3C4CFA3E939E3A8F48BE7B84A1D2A0F2', 
  4: {"id": h'4F463AC35FE08EE86A544087239BE152D78A08C6A6D779420C3C992AC4B36DCA11B30E63354C3A5812E3748D2232871B927812'}
}
```

rpId hash は `356C9ED4A09321B9695F1EAF918203F1B55F689DA61FBC96184C157DDA680C81`、`login.microsoft.com` の SHA256。MSA アカウントと同じ rpId になってる。

OAuth やパスワードベースのサインインに使う `login.microsoftonline.com` のエンドポイントとはどういう風に共存していくのだろうかとか少し気になる。

Flag は 0x85 なので 10000101 ってことは…、えーっと UP, UV, ED が True か。Extensions は 多分 HMAC Secret かな。オフラインでの認証には HMAC Secret 使うって去年の FIDO セミナーで MS の人が言ってたはず…。

正直 ResidentKey 利用時の CTAP2 の動きがわかっておらず、細かいところはログ見てもよくわからん。

> 初回は credential id 空で送ってて、そのあとどっかから取得した credential id を指定して再度リクエスト投げてるっぽい。CTAP2 詳しいマン、誰か解説してくれると嬉しい。

## 所感

細かいところはともかく、とにかく Public Preview がきてくれてうれしい。

最近発表された[Windows 10 のパスワード無効化](https://blogs.windows.com/windowsexperience/2019/07/10/announcing-windows-10-insider-preview-build-18936/)と組み合わせることで、デバイスセットアップさえ済んでしまえば、ユーザーがパスワードを利用するシーンを根絶できる…カモネ。

設定も (Azure AD の反映に時間がかかることを除いては) 簡単で、セットアップも特に引っかかるところはなかったが、いくつか気になることがあったのでざっとまとめておく。

#### キーの無効化

無効化は今のところユーザーによる無効化しかないっぽくて、Azure AD のユーザー情報からリセットするといったことはできなさそうだった。これは Known Issue にはっきり書いてあった。

#### 複数クレデンシャルを一つのキーに登録したときの動作

複数クレデンシャルを一つのセキュリティキーに登録した場合の動作についてだが、YubiKey 1 台に複数のユーザー情報入れても Windows 10 へのサインインには最後に登録したユーザー情報しか使えなさそうだった。もちろん Web の場合は Credential の選択が出てくるので、これは Credential Provider の制約だろう。
まあ基本的には 1 ユーザー 1 デバイス (当たり前っちゃ当たり前だけど) のはずなので、困ることはないとは思うけども。

> Feitian 等の Biometrics でユーザー識別できるキーとかだと、複数ユーザー入れても特定の Credential ID で返せるはずなので、違う動きするかも。

#### Attestation

キーの制限をするのに今のところ aaguid を登録する、という手法なのだけど、Attestation どうしたん?
まあ、Attestation まで必要になるケースってそんなない気もするけど、エンタープライズ用途で Attestation 使わなかったら使いどころがないので何とか対応してほしいところ。

しかし、メタデータの取り扱いとかめんどくさそうではある...。

#### エンドポイント

通常 Azure AD へのサインインには `login.microosftonline.com` が利用されるが、セキュリティキーを利用したサインインの場合には `login.microsoft.com` のエンドポイントを利用する。
まあ、rpId が `micorosft.com` のドメインを利用したいってのはわかるけど、二つエンドポイントがるのは単純にトラブりそうだなーという所感。そもそも `login.micorosftonline.com` がどこから出てきたのか、教えて [@juntakata](https://twitter.com/juntakata)さん。

## 最後に

ちなみに、はじめは自分で CTAP2 のコマンド叩いて登録完了したセキュリティキーに、何が入っているか分析しようと思ってたけれど、Resident Key の CTAP2 まわりの動きが忘れている & あんま分かってないこともあって断念した。ただイベントログを覗いたところ、十二分にログが出ていたので、どんなことしてるかは大体追えた。ログがちゃんとあるって素敵。

CTAP のお勉強したい人は Windows のイベントログを見て、CBOR と戯れよう。
