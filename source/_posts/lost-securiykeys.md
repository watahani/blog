---
title: セキュリティキーをなくしたのでリカバリ方法を実践してみる
date: 2019-09-09 20:40:44
tags:
  - YubiKey
  - Account Recovery
---

普段使いのバッグをなくした。たぶん置き引き。

中には検証&普段使いに利用していた YubiKey もあった。てか山ほど Authenticator 入ってた。

まさか、置き引き野郎も、カバン開けたら金は一切入ってなくて、意味わからん USB 機器が山ほどはいってるとは思うまい。

<!-- more -->

![](https://blog.haniyama.com/2019/02/04/job-change/keys.jpg)
> これ

## あらすじ

土曜日の午前中に病院に行き、薬局で薬を出してもらって、家に帰った。

その時どうやらバッグを調剤薬局に忘れたらしい。
嫁には、小学校にランドセルしょって忘れてくるやつおるか？とあきれられたが、まさにそれをやってのけた私である。仕方がない。

さて、やっと次の日になって、カバンがないことに気づき、薬局に電話したが見つからず。
これを置き引きと呼んでよいかはよくわからないが、中に入ってたもろもろをロストしてしまった。

で、大量のセキュリティキーもなくしたので、各社のセキュリティキーの無効化手段について確認しておこうというのが本日の企画。

## Google

https://myaccount.google.com/ から、`セキュリティ` > `二段階認証` に移動。

サインインは信頼されたブラウザーからはパスワードだけで OK だった。
この辺は組織アカウントかどうかとかで動作が違うと思われる。

{% asset_img lena.bmp google-securitykeys.png %}

信頼されたブラウザーって結構色々できるので気を付けたほうがいいなとコナミ。

ちゃんと最終使用日があるため、不正ログインされていないか確認可能だった。また、おおよその最終仕様場所もわかる。
編集ボタンから Revoke して完了。

## Microsoft Account

https://account.microsoft.com から、`セキュリティ` に移動。

追加の認証はスマホへの通知にて。

{% asset_img lena.bmp msa-mfa.png %}

 `2 段階認証 (追加のセキュリティ オプション)` に移動して `Windows Hello とセキュリティキー` > `サインイン方法の管理` にて一覧を確認可能。
MS って個人アカウントは MFA じゃなくて2段階認証やねんな。

{% asset_img lena.bmp ms-securitykeys.png %}

最終利用日が分かる。削除ボタン押して revoke 完了。

## GitHub

https://github.com/settings/ から `Security` > `Two-factor authentication` > `Security keys` にアクセス。

{% asset_img lena.bmp github-settings.png %}

家にある YubiKey を登録してあったので、サインイン セッション + 追加の認証 YubiKey タッチでアクセスできた。
セキュリティキーまったくない場合は Authenticator アプリかリカバリコードでサインインかな。

もしかすると信頼された端末からはパスワードだけで入れるかもしれないけど未確認。

{% asset_img lena.bmp github-securitykeys.png %}

ゴミ箱アイコンで削除…した後の画面です。
というのも、他のアカウントに比べてサインインした際の通知が来ないイメージだったので、なんとなく一番不安に感じたから、GitHub のキーを真っ先にめに無効化したんです。

## Facebook

https://www.facebook.com/settings から、`セキュリティとログイン` > `二段階認証を使用`

追加の確認はパスワードだった。これも信頼されたブラウザーとして保存しているからかな。

{% asset_img lena.bmp facebook-confirm.png %}

`セキュリティキー` から登録しているキーを削除…と思ったけど、いつ登録したかわからんやーつしかなかったので全部削除して手元のキーを登録しておく。

{% asset_img lena.bmp facebook-securitykeys.png %}

## Twitter

https://twitter.com/settings/account にアクセス。

ログインは Authenticator アプリで。Chrome でプロファイル切り替えて使ってると、なぜか Twitter の認証が切れてしまうので最近はずっと Authenticator アプリ使ってた。

`Security` > `Two-factor authentication` から Security Key のチェックを外すだけ。

{% asset_img lena.bmp twitter-securitykey.png %}

ついでに手元のキーを登録しておくけど、相変わらず一本しか登録できないし名前も付けれないのできっとまた忘れる。

## まとめ

と、いうことで、限られたサンプルではあるがセキュリティキーをなくした場合のリカバリ手順でした。

Google と Facebook は信頼された端末からの設定であればパスワードのみでリカバリ可能だけど、Microsoft アカウントは、Authenticator アプリでの追加認証が必要だった。Twitter は最近常にセッション切れてるのでよくわからず。

もしかすると Microsoft アカウントについても信頼された端末にしてれば動作違うかもなのであくまで参考程度に。

で、やっぱ最終使用日時と、サインイン時の通知が来るのは機能として良い。

一番の問題は、なくしたキーを買うための予算が通るかである。あと、尼で買うと、前職にこいつキーなくしたなってバレる可能性があるのがつらい。
