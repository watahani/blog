---
title: Edge が WebAuthN をサポートしたらしいので色々試してみた(Insider Preview)
date: 2018-06-17 20:43:25
tags:
    - YubiKey
    - WebAuthn
    - CTAP2
    - FIDO
    - FIDO2
---

> update 2018-06-25 userHandle に関して追記
> 2018-10-20　この記事より詳細な記事書きました [webauthn における ResidentKey について](/2018/10/19/webauthn-residentkey/)

## とりあえず動画をみれば大体わかる

<!--more -->

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">Single Factor Login using Security Key by Yubico <a href="https://twitter.com/hashtag/yubikey?src=hash&amp;ref_src=twsrc%5Etfw">#yubikey</a> <a href="https://twitter.com/hashtag/webauthn?src=hash&amp;ref_src=twsrc%5Etfw">#webauthn</a><a href="https://t.co/7rUjkoUmdK">https://t.co/7rUjkoUmdK</a></p>&mdash; 82@FIDO2勉強会？ (@watahani) <a href="https://twitter.com/watahani/status/1008280543933263872?ref_src=twsrc%5Etfw">2018年6月17日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

どうも、先日DMM英会話の退会を忘れていて、4万円ほど失った [@watahani](https://twitter.com/watahani) です。かなしい。

さて、先日 `Insider Preview Build 17682` で WebAuthN のサポートがされたと聞いて、とりあえずは [webauthn.org](https://webauthn.org) で使えることまでは試しました。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">試してみた（url張り間違えた)<a href="https://t.co/c3SzRaqHsA">https://t.co/c3SzRaqHsA</a><a href="https://t.co/UpTAmRJZ4l">https://t.co/UpTAmRJZ4l</a> <a href="https://t.co/TLMYH8E5c2">https://t.co/TLMYH8E5c2</a></p>&mdash; 82@FIDO2勉強会？ (@watahani) <a href="https://twitter.com/watahani/status/1007628354067951616?ref_src=twsrc%5Etfw">2018年6月15日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

WebAuthN自体動くことは分かったけど、

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">Edge support resident key?</p>&mdash; 82@FIDO2勉強会？ (@watahani) <a href="https://twitter.com/watahani/status/1007627182817009664?ref_src=twsrc%5Etfw">2018年6月15日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Resident Key のサポートとかいろいろ気になるよね…？

ということで調べてみました。

## Resident Key とは？

FIDO2.0 から新しく追加された機能で、要はキーの中にユーザ情報を保存できる。

細かく言うと、 [PublicKeyCredentialUserEntity](https://www.w3.org/TR/webauthn/#dictdef-publickeycredentialuserentity) と[ Credential ID](https://www.w3.org/TR/webauthn/#credential-id) を保存しておいて、次回以降のログインに利用することができる。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">Edge show Credentials in residentKey <a href="https://t.co/SYNq6menui">pic.twitter.com/SYNq6menui</a></p>&mdash; 82@FIDO2勉強会？ (@watahani) <a href="https://twitter.com/watahani/status/1008219871396548609?ref_src=twsrc%5Etfw">2018年6月17日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

こんな感じ。

キーの中に Challenge へのサインに必要な情報をキャッシュしておくことで、次回以降のログインに User 情報を入力する必要なくログインができる。

[![](https://developers.yubico.com/FIDO2/index__2.png)](https://developers.yubico.com/FIDO2/)


今回は、 Security Key by Yubico を利用しました。

<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=82p-22&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B07BYSB7FK&linkId=8a19153a421eb5ce6735b868823cdfbe"></iframe>

## U2F と FIDO2 の違い

ゼロからコードを書くスキルは無いので、<https://github.com/fido-alliance/webauthn-demo> をベースに改造を加えてみる。

### 認証部分

> 2018-06-19 Attestation を認証部分と書いてしまっていたので修正

認証部分に関して、Yubico の Security Key は `fido-u2f` ではなく `packed` で動くので認証部分を追加する。

UV も検証したほうがいいかもだけど、ほかのブラウザがどういう方針で行くのか不明なのでとりあえずそのまま

```js
    }else if(authr.fmt === 'packed') { //別にこれ fido-u2f と分ける必要ない、というか attestation ない場合もあるので...
        let authrDataStruct  = parseGetAssertAuthData(authenticatorData);

        if(!(authrDataStruct.flags & U2F_USER_PRESENTED)) //FIDO2 の場合は UP に加え、UV をチェックすべき(0x05)
            throw new Error('User was NOT presented durring authentication!');

        let clientDataHash   = hash(base64url.toBuffer(webAuthnResponse.response.clientDataJSON))
        let signatureBase    = Buffer.concat(
            [
                authrDataStruct.rpIdHash, 
                authrDataStruct.flagsBuf, 
                authrDataStruct.counterBuf,
                clientDataHash
            ]
        );

        let publicKey = ASN1toPEM(base64url.toBuffer(authr.publicKey));
        let signature = base64url.toBuffer(webAuthnResponse.response.signature);

        response.verified = verifySignature(signature, signatureBase, publicKey)

        if(response.verified) {
            if(response.counter <= authr.counter)
                throw new Error('Authr counter did not increase!');

            authr.counter = authrDataStruct.counter
        }
    }
```

Attestation Data の検証に関しては、Extension がない場合、

* RP ID Hash
* Flags
* Counter
* aaguid,
* Credential ID Length
* Credential ID
* Public Key(CBOR)
* Client Data Hash

に対して行う。あとは U2F と一緒っぽい。


```js
+ (ctapMakeCredResp.fmt === 'packed'){
+        let authrDataStruct = parseMakeCredAuthData(ctapMakeCredResp.authData);
+
+        if(!(authrDataStruct.flags & U2F_USER_PRESENTED))
+            throw new Error('User was NOT presented durring authentication!');
+
+        let clientDataHash  = hash(base64url.toBuffer(webAuthnResponse.response.clientDataJSON))
+        let reservedByte    = Buffer.from([0x00]);
+        let publicKey       = COSEECDHAtoPKCS(authrDataStruct.COSEPublicKey)
+        let signatureBase   = Buffer.concat(
+            [
+                authrDataStruct.rpIdHash, 
+                authrDataStruct.flagsBuf, 
+                authrDataStruct.counterBuf, 
+                authrDataStruct.aaguid,
+                authrDataStruct.credIDLenBuf, 
+                authrDataStruct.credID, 
+                authrDataStruct.COSEPublicKey,
+                clientDataHash
+            ]);
+
+        let PEMCertificate = ASN1toPEM(ctapMakeCredResp.attStmt.x5c[0]);
+        let signature      = ctapMakeCredResp.attStmt.sig;
+
+        response.verified = verifySignature(signature, signatureBase, PEMCertificate)
+
+        if(response.verified) {
+            response.authrInfo = {
+                fmt: 'packed',
+                publicKey: base64url.encode(publicKey),
+                counter: authrDataStruct.counter,
+                credID: base64url.encode(authrDataStruct.credID)
+            }
+        }
     }
```

### WebAuthN 部分

WebAuthN 部分については、まず登録時に Resident Key が登録できるように `authenticatorSelection` に `requiredResidentKey`  `true` をセットするだけ。まあそんな難しくない。

```js
    getMakeCredentialsChallenge({username, name})
        .then((response) => {
            let publicKey = {
                'challenge' : challenge,
                'user': {
                    'id': 'xxxxxxxxxxxxxxxxxx',
                    'displayName': 'Hoge Fuga',
                    'user': 'hoge'
                }
            };
            if(residentKey){
                publicKey.authenticatorSelection = {
                    'requireResidentKey': true
                } 
            }
            return navigator.credentials.create({ publicKey })
        })
    ...
 ```

ただ、このままだと無限にキーを登録し続けられてしまう。実際には aaguid などから、キーがすでに登録済みか調べて除外するなどする必要があると思う。

> と思ったけど、 aaguid を `excludeCredentials` には追加できない ので、ユーザが重複登録してしまわないようにするにはサーバーに送ってから登録情報を見て登録済みならはじくとかかなあ…。
>それだとキー自体に登録してしまってから送っちゃうしだめか…

次に認証時だけど、これも簡単で credentials.get オプションに渡す allowCredentials を空にすればいい。

```js
let publicKey = {
    'challenge': challenge
}
return navigator.credentials.get({publicKey});
```

当然 CredentialID 等はいらないのでこれでOK。

U2F では Challenge と ユーザを紐づけて管理していたが、FIDO2 の One Factor Authentication の場合、セッションなどと紐づけて保存しておかなくてはならなくなった。

また、サーバー側には CredentialID のみが送られるため、どのユーザがログインしようとしているかは CredentialID から逆引きする機構が必要になる。

> 2018-06-25 
> Edgeの実装を確認していると getAssertion のレスポンス内に含まれる `user handle` 内に、 `user id` が含まれていた。
> スペックでは nullable なので、使えたら使う？ってスタンスでよいのかなあ…。要調査。

```js
+let getUsernameFromCredentialID = function(credentialId){
+    let matchedUsername;
+    Object.keys(database).forEach((username) => {
+        var authenticators = database[username].authenticators
+        authenticators.forEach((authenticator) => {
+            if(authenticator.credID === credentialId){
+                matchedUsername = username;
+            }
+        })
+    })
+    return matchedUsername;
+}
```

うーん…。

## 実際の動作

実際に Edge で動作確認をしてみる。

### Resister

まずは、登録作業。

{% asset_img lena.bmp 01_pin.png %}

どうも Edge では User Verify (PINの入力) は必須らしく、PIN 設定していないキーでも関らず PIN の設定をしろと言われてしまう。

> 追記： User Verification はデフォルトで "preffered" です。
> UV が不要であれば "discourage" オプションの指定が必要です。
> 詳しくは は [webauthn における ResidentKey について](/2018/10/19/webauthn-residentkey/)


One Factor Authentication するには PIN なり、指紋なりで保護しないとだめなのはわかる。けど、認証レベルによってタップでログインして、重要な情報を変更するときのみ PIN の入力する…みたいな使い方は出来なさそう。

{% asset_img lena.bmp 02_touch.png %}

User Verification の後は User Presence のためにタッチする。

多分、生体認証などのキーでは User Verification は User Presence な動作を必要とするまず。つまりもう一度タッチしなくていいのかと思うけど、実機が無いのでわからない。誰か試してみてほしい。

{% asset_img lena.bmp 03_loggedin.png %}

ともあれ、タッチまでして登録完了。


### Assertion

次にログインの場合。先ほども言った通り、`Credential ID` 等はキーに保存できるため `allowCredentials` を空にして、`getAssertion` を呼べばよい。

PIN を入力すると、キーが与えられた `challenge` に対し、保存している Credentials すべてに対応する `attestationResponse` を Edge に返す。

{% asset_img lena.bmp 04_pin.png %}

Edge は Credential が一つしかない場合、自動でログインするらしい。
正直どのユーザでログインしようとしているかは表示してほしい。

{% asset_img lena.bmp 05_loggedin.png %}

Credential が複数ある場合はユーザリストが表示される。

{% asset_img lena.bmp 06_credentials.png %}

ちなみに 25 ユーザほど登録した時点で、キーの登録容量が足りなくなった。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">FIDO2 の residentKey 試してたらもう入らんくなった <a href="https://t.co/xNLZxnO2nc">pic.twitter.com/xNLZxnO2nc</a></p>&mdash; 82@FIDO2勉強会？ (@watahani) <a href="https://twitter.com/watahani/status/1008228775723560960?ref_src=twsrc%5Etfw">2018年6月17日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


## 雑感

ソースはここに置いておいた。

<https://github.com/HWataru/webauthn-demo/tree/fido2-support>

キーの登録自体は動画の通りうまく動いたけども、実際の運用には重複登録への対策や、他のブラウザごとの実装などがどうなるかなど、検討しないといけないことは色々あると感じた。

正直キーだけで Web認証のすべてを行うのは難しいと思う。実際には PC や スマホの platform Authenticator を利用したり、何かしらの IdP にのみキーを登録して、フェデレーションなどを利用していく必要があるだろう。

何より DMM 英会話で失った 4万円が重くボディーブローのように響いてきてつらたん。

記事がためになったらだれかご飯おごってください。

<iframe style="width:120px;height:240px;" marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="//rcm-fe.amazon-adsystem.com/e/cm?lt1=_blank&bc1=000000&IS2=1&bg1=FFFFFF&fc1=000000&lc1=0000FF&t=82p-22&o=9&p=8&l=as4&m=amazon&f=ifr&ref=as_ss_li_til&asins=B07BYSB7FK&linkId=8a19153a421eb5ce6735b868823cdfbe"></iframe>