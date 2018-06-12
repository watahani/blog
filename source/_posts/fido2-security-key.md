---
title: FIDO2 対応の Security Key ファーストインプレッション
date: 2018-04-26 22:07:11
tags: 
 - YubiKey
 - FIDO
---

## FIDO 2.0 対応のキー

届いた。 [Security Key by Yubico](https://www.yubico.com/product/security-key-by-yubico/) という名前らしい。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">FIDO2 対応の Security Key 届いた <a href="https://t.co/8taKRfWlrP">pic.twitter.com/8taKRfWlrP</a></p>&mdash; 82 (@watahani) <a href="https://twitter.com/watahani/status/989460163420569600?ref_src=twsrc%5Etfw">2018年4月26日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## FIDO 2.0 とは

FIDO U2F および UAF を拡張した認証標準で、まあ要は [WebAuthn](https://www.w3.org/TR/webauthn/) と [CTAP](https://fidoalliance.org/specs/fido-v2.0-rd-20161004/fido-client-to-authenticator-protocol-v2.0-rd-20161004.html) のこと。

さっと中身をナナメ読みすると、 FIDO U2F の sign する ClientData にもっといろいろ突っ込めるようにしたような規格（まだちゃんと読んでない…）
通信容量削減のため CBOR とかいうバイト配列のデータに、RPやチャレンジ以外のデータも色々突っ込んで ~~Token Binding やら IDの代わりにしたりできるっぽい。~~

また PIN や biometrics 要求を Authenticator に投げられるようになってることにより、 U2F が2段階認証だったのが、FIDO2 だと **PIN + デバイス** だったり、**指紋 + デバイス** だったりで本当の意味でパスワードフリーになっている。

このあたりの話については、もう少しきちんとスペックを理解してから纏めようと思うが、今日はファーストインプレッションということで。

## 見た感じ

{% asset_img lena.bmp keys.jpg %}

左から、YubiKey4、Security Key by Yubico, Security Key(U2Fのみ対応のもの)

厚さも重さもほぼ変わらず。
旧 Security Key とはキーチェーンの穴がプラか金属部分が出ているかと、謎の "2" の刻印以外はおぼ同じ。

ただし、古いキーも最近のロットはキーチェーンに金属が入っているので、実質　"2" の刻印以外は見た目は変わらない。
爪でこするぐらいじゃ消え無さそうだった(笑) さすがにレーザー刻印なのかな？

## とりあえず使ってみる (WebAuthn)

とりあえず触ってみる。

まずは、Yubico のサンプルサーバー と Firefox Nightly で WebAuthn のテスト
> WebAuthn のデモは [ここ](https://webauthn.io/) とか [ここ](http://webauthn.bin.coffee/) とかでも

<https://github.com/Yubico/python-fido2/tree/master/examples/server>

```bash
> git clone https://github.com/Yubico/python-fido2.git
> cd .\python-fido2\server\
> python -m venv .venv
> .\.venv\Scripts\Activate.ps1
> pip install -r requirement.txt
> python server.py
Example demo server to use a supported web browser to call the WebAuthn APIs
to register and use a credential.

To run (using a virtualenv is recommended):
  $ pip install -r requirements.txt
  $ python server.py

Now navigate to https://localhost:5000 in a supported web browser.

 * Restarting with stat

Example demo server to use a supported web browser to call the WebAuthn APIs
to register and use a credential.

To run (using a virtualenv is recommended):
  $ pip install -r requirements.txt
  $ python server.py

Now navigate to https://localhost:5000 in a supported web browser.

 * Debugger is active!
 * Debugger PIN: 605-258-233
 * Running on https://127.0.0.1:5000/ (Press CTRL+C to quit)
```

アクセスして register を押すと

{% asset_img lena.bmp webauthn1.png %}

WebAuthn のダイアログが出て…

{% asset_img lena.bmp webauthn2.png %}

Keyにタッチするとサーバーログに認証データが出てくる。

```py
clientData {"challenge":"szm47zk9-ueHSO1IRhGzHI1BgHYp27uueGB7mF2Z2cg","clientExtensions":{},"hashAlgorithm":"SHA-256","origin":"https://localhost:5000","type":"webauthn.create"}
AttestationObject: AttestationObject(fmt: 'fido-u2f', auth_data: AuthenticatorData(rp_id_hash: h'49960de5880e8c687434170f6476605b8fe4aeb9a28632c7995cf3ba831d9763', flags: 0x41, counter: 0, credential_data: AttestedCredentialData(aaguid: h'00000000000000000000000000000000', credential_id: h'f9c62b17c868223f619223f7f705be4b29b314b7b237073389319d922cc61ce5d913b1ec68a9da6917cb362ce9ed0623d4d5f0a3d4b7b21db661b2628b6d7e0e', public_key: {1: 2, 3: -7, -1: 1, -2: b'\xc0\x83\xe0Z\xd4t\xfd\tr\xc5\xb7\xe5g\xe3\x0cd\x81\x82{\xf7\xe6\xa8*\x92\x83\x89\xb0\xf7a\xfc@\x15', -3: b'\x1e\x18[\xb2T\x17@7\xdf\x1f\x9c\xd5\x07\xb5+Egg$;\x179\xbdB\xe3\xed\x84\x7fT\xad\xf6\xb4'}), att_statement: {'sig': b'0E\x02!\x00\x8c\xb2x\xa5\x8d\x99\xebJ\x10\xd2\xde\xd7\xaa@\xd9\x1e2S\xb1\xab\x03\xedt\x00\xe2\xe5g\x0fy\xbcN\xde\x02 S\x1d\xe9\xdb\x084\x1e\x0c\x17\x88\xb6\xc4uA\xf0\xcfD\x14\xf2U\x8e\x9c\xf0!\x03\x1c\xea\xab\xcf\xe6\x9aH', 'x5c': [b'0\x82\x02\xbe0\x82\x01\xa6\xa0\x03\x02\x01\x02\x02\x04t\x86\xfd\xc20\r\x06\t*\x86H\x86\xf7\r\x01\x01\x0b\x05\x000.1,0*\x06\x03U\x04\x03\x13#Yubico U2F Root CA Serial 4572006310 \x17\r140801000000Z\x18\x0f20500904000000Z0o1\x0b0\t\x06\x03U\x04\x06\x13\x02SE1\x120\x10\x06\x03U\x04\n\x0c\tYubico AB1"0 \x06\x03U\x04\x0b\x0c\x19Authenticator Attestation1(0&\x06\x03U\x04\x03\x0c\x1fYubico U2F EE Serial 19550038420Y0\x13\x06\x07*\x86H\xce=\x02\x01\x06\x08*\x86H\xce=\x03\x01\x07\x03B\x00\x04\x95]\xf3\xad\xf7$}1u\xef\xfd\x9c\xc4\xf3\x1aN\x87\x8e\xba\xe1\x81\tVaP\xfb8\x8b._e\'\xbfW@\x9a\xa5\x81\xa5\r\n\xc5/\x18D\\\n\x13T\x8a\x13S\xc8\xa4\xe5\x9apNR;\xc0M\xeb\xed\xa3l0j0"\x06\t+\x06\x01\x04\x01\x82\xc4\n\x02\x04\x151.3.6.1.4.1.41482.1.10\x13\x06\x0b+\x06\x01\x04\x01\x82\xe5\x1c\x02\x01\x01\x04\x04\x03\x02\x05 0!\x06\x0b+\x06\x01\x04\x01\x82\xe5\x1c\x01\x01\x04\x04\x12\x04\x10\xf8\xa0\x11\xf3\x8c\nM\x15\x80\x06\x17\x11\x1f\x9e\xdc}0\x0c\x06\x03U\x1d\x13\x01\x01\xff\x04\x020\x000\r\x06\t*\x86H\x86\xf7\r\x01\x01\x0b\x05\x00\x03\x82\x01\x01\x001\\H\x80\xe6\x9aR~8f\x89\xbdi\xfd\n\xa8oI\xeb\x9eN\x85EAUo\xaa\xd0\x0b:\x00\x8a\x1d\xdc\x01\xf9lv\xf6h6\x1a\x91\xe22\xc8\x10\xa7\x9cc\x07L\x9bnzF\xeb\x1d\xb5\xd8\\DH\x9f\x86\x8avC\xd2*\\\x86.\xc0?\x03\xe5\x84\x8b\xe3\x80}z\xcdU\xf8\xe1\xae\x1e\xe2\x13\xacs\xabK \xe3\xfb\xd5&\x8c\xb0{\x87\x80\'\x1d\x1fK\xe0\xe5\xdd\xacsM:X\x97\xbdMs\xba\x7f5~\xa2\x08\xc9\x9d\x8aM)\x02\xe6\tz\x00\\M\xc9\x04\xdc\n\x18\x12\x0e\n\xf7\xd0\x0c\xfc\x96\x9a(\x86\xe5\xb1\xb1a\xf3\xed\xcb\xc6w\xa6x\xd7\xfbS\x03\x9c\xcd\xa1\x86\xbe4\xbaS1\x95#C\x9d\x7f\xd9Jp\xf20b\x1b\x93\xc4\xceBh\xd3\x17M\x94;\xc6\xae?\xc97\xc2\xdeC\xd6\xb4N!\x15=\xf8P\x92_\x95\x90b.\xbcF\xe0\xeb\x18\xc6A\xf0\xfe~o*\t\xa9\xb2\x90w\x19\xf6.a5\xa1\x902\xa2\x13\xc0\x98\xb7(<\xee']})
REGISTERED CREDENTIAL: AttestedCredentialData(aaguid: h'00000000000000000000000000000000', credential_id: h'f9c62b17c868223f619223f7f705be4b29b314b7b237073389319d922cc61ce5d913b1ec68a9da6917cb362ce9ed0623d4d5f0a3d4b7b21db661b2628b6d7e0e', public_key: {1: 2, 3: -7, -1: 1, -2: b'\xc0\x83\xe0Z\xd4t\xfd\tr\xc5\xb7\xe5g\xe3\x0cd\x81\x82{\xf7\xe6\xa8*\x92\x83\x89\xb0\xf7a\xfc@\x15', -3: b'\x1e\x18[\xb2T\x17@7\xdf\x1f\x9c\xd5\x07\xb5+Egg$;\x179\xbdB\xe3\xed\x84\x7fT\xad\xf6\xb4'}
```

ふむふむ… あれ？

aaguid が空だし、fmtが…

`fmt: 'fido-u2f'` 

<h4>ってまだ U2F でしか動かないんかーい！</h4>

ブラウザの実装の問題なのか、サーバーのAPI呼び出し方法の問題なのか、よくわかんない。

多分前者？

## とりあえず使ってみる (CTAP)

せっかく届いたので寝る前に FIDO2 らしいことをしたい。なので、同じく Yubico の python製の FIDO Client を試してみる。
examples ディレクトリ直下の get_info.py を叩くと、 CTAP で規定されたキーで利用できる認証方法のデータが返ってくる。

```bash
>  python .\get_info.py
CONNECT: CtapHidDevice(b'\\\\?\\hid#vid_1050&pid_0120#7&1a9dc5a8&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}\x00')
DEVICE INFO: Info(versions: ['U2F_V2', 'FIDO_2_0'], extensions: ['hmac-secret'], aaguid: h'f8a011f38c0a4d15800617111f9edc7d', options: {'rk': True, 'up': True, 'plat': False, 'clientPin': False}, max_message_size: 1200, pin_protocols: [1])
WINK sent!
```

このキーは `U2F_V2` と `FIDO_2_0` に対応していて、 オプションとして、 以下が使えることがわかる。

* `rk`: True  Resident Key キー情報を保存する領域がある
* `up`: True   User presence ユーザの存在確認が必要か、要はタッチが必要か
* `plat` : False  Platform Device か。つまり機器に埋め込まれているかどうか。TPMとか利用した Authenticator は True なのかな
* `ClientPin`: False PINが設定されているか。PIN が使えない場合、オプションが存在しない。

ちなみに U2F のキーだと CBOR 送れねーぞって怒られる。

```bash
>python .\get_info.py
CONNECT: CtapHidDevice(b'\\\\?\\hid#vid_1050&pid_0407&mi_01#8&109b7fa4&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}\x00')
Device does not support CBOR
WINK sent!
```

Pythonのコード追っていくと、PINの設定やPINを使った sign などもできそうだけれど、今日はここまで。

かえって寝ないとGWが迎えられない…。

---

### 2018年4月27日 追記

Windows Hello のPCログインで使えるようになるらしい。
（ Azure AD および、個人アカウント）

[Big news in our drive to eliminate passwords: FIDO2 / WebAuthn Reaches Candidate Recommendation status! – Enterprise Mobility + Security](https://cloudblogs.microsoft.com/enterprisemobility/2018/04/12/big-news-in-our-drive-to-eliminate-passwords-fido2-webauthn-reaches-candidate-recommendation-status/)

>both personal Microsoft accounts and organizational identities based on Azure Active Directory

ただし、Insider Preview にも出ておらず、以下から申し込みをした企業向けに、試用版がとどくかもって感じらしい。

[Online Survey | Built with Qualtrics Experience Management™](https://microsoft.qualtrics.com/SE/?SID=SV_brWqzOWHstHbdGd&Q_JFE=0)

Yubico の公式動画は以下

<iframe width="854" height="480" src="https://www.youtube.com/embed/wl479T2t6eo" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>