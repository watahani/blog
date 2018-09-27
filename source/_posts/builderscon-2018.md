---
title: builderscon2018 に参加してきました
date: 2018-09-12 09:03:20
tags: builderscon イベント
---

# builderscon 2018 行ってきました！

テーマの "Discover Something New" 「知らなかった、を聞く」というテーマに背中を押されて知らなかったセッションをいろいろ聞けて良かった。ほんとに充実した2日間でした。

初めに失敗したなぁと思ったことを書いておくと、1人でお昼ご飯のお店どこに行けばいいかわからなかったこと。

チェックしてなかったんだけども、Builderscon Blog には [会場近くのおすすめランチ情報](https://blog.builderscon.io/entry/2018/08/08/090000) まで載っていたので来年はちゃんとチェックして臨みたいと思った。

あと、関係ないけどポケットに突っ込んでた1万円札なくした。悲しい。

参加費と合わせて実質スポンサー枠である。

<!-- more -->

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">いちまんえん落とした…　<a href="https://twitter.com/hashtag/builderscon?src=hash&amp;ref_src=twsrc%5Etfw">#builderscon</a></p>&mdash; 82 (@watahani) <a href="https://twitter.com/watahani/status/1037987516152856576?ref_src=twsrc%5Etfw">2018年9月7日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


さて、気を取り直して聞いたセッションはこんな感じ

## Day 1

{% asset_img lena.bmp day1.png %}

## Day 2

{% asset_img lena.bmp day2.png %}

タイムテーブルはこのぐらい詰まってたほうが見やすいよね。[issue](https://github.com/builderscon/conf.builderscon.io/issues) に上げておきたい。けど英語で上げるの面倒だなあ。

半分は自分の興味があるもの、残り半分の半分は、よくわからないけど話を聞いてみたい人、残りは新しいものに飛び込んでみようと行ったセッション。

## 自分のこと

Builderscon の報告を書くにあたって、自分のスペックを書いておきたい。

これは Builderscon が 「知らなかった、を聞く」というテーマで、登壇者がかなりターゲットを意識して発表を作り上げていると感じて、フィードバックも感想を抱いた人がどんなレベルの人かわかったほうがいいと思ったから。

- 工学部卒
- 元本屋さんの現職エンジニア 3年目
- 普段はあんまコードを書かずにサポート・セールス・研究開発なんかしている
- Java, javascript, python を触ってる
- Linux は 基本的なコマンドはわかるし使えはする
- C とか 低レイヤーな話になるとかなり怪しい
- 技術書は1年に10冊ぐらい

まあ、プログラマーとしてはへっぽこですね。

では、自己紹介はこれぐらいにして、各セッションの所感を書いていきたいと思います。

##  Electronによるアプリケーション開発事情2018

<https://builderscon.io/builderscon/tokyo/2018/session/9ffb1fb0-9667-47ec-bb03-a0f9a9736612>

Electron + Vue で mastodon クライアントを作った話とあって、ラズパイの話と迷った結果こちらに。

@h3poteto さんは普段は、自社プロダクトの terraform職人をしているとのことで、フロントエンド開発は完全に趣味で行っているとのこと。素直にすごいなぁと思って聞いていた。

内容も面白かったが、「知らなかったー」ってなったのは GitHub の Issue template

https://github.com/h3poteto/whalebird-desktop/tree/master/.github/ISSUE_TEMPLATE

`.github/ISSUE_TEMPLATE/` に Markdown のファイルを置いておけば、 issue 立てるときにテンプレートが読み込まれるらしい。

{% asset_img lena.bmp issue_template.png %}

普段使いしている Gitlab でも同様に `.gitlab/issue_templates/` に Markdown のファイルを置いておけばテンプレートを使えるようなので早速試してみたい。知らなかったー。

あとは Electron の基礎（main プロセスと render プロセス）の話と、render に気を使わないとメモリ爆食いするよって話。

## パスワードレスなユーザー認証時代を迎えるためにサービス開発者がしなければならないこと @ritou

<https://builderscon.io/builderscon/tokyo/2018/session/9f0ac19c-0367-4307-a3d4-e5431d80267e>

前回の idcon でも Web Authentication API 関連で CBOR のお話をされていた @ritou さんのセッション。その時もすごいけど変な人だなあと思って聞いていたけど、やっぱり変な人だった。


なにより **パスワードの問題を「人間のスペック不足」と表現するところだとかが面白かった。**


FIDO2 = U2F + UAF って書いてあって、よっしゃマサカリ投げるぞ！と思ったけど、勇気が出ずに黙っていた。大衆の前で、質問はできるんだけど、マサカリ投げるって行為には思ったより勇気がいることを知らなかった。Builderscon 最大の失敗。

## 知らなかった、時に困るWebサービスのセキュリティ対策

<https://builderscon.io/tokyo/2018/session/d16eb388-2916-421c-85d6-47faf23238e2>

GMOペパボ の @tnmt さん。1月に実際にあったペパボのインシデントに対して、情報セキュリティの基本にのっとって正しく対応したところと、うまくいかなかったところを惜しげもなく発表していただいた。ありがたみ。

基本的な情報セキュリティ関連の書籍を読んだ人であるならば、常識的な内容なので非常にわかりやすかった。

しかし、その常識的な内容を、ここまで現場に反映できる実行力がすごい。

情報資産・リスクの洗い出し、リスクの評価、対応策の検討をして、組織として構築するのは並大抵のことではないのだろうと思う。頑張ろう…。

そして、[GMOペパボガーディアン](https://www.gmo.jp/news/article/6139/) とかいうセキュリティ関連事業を行う新会社を設立するという、タダでは起きない感がすごい。

いや、たまたまかもしれないけれども。

あとWAF使おう。

## 実録！ある担当者がみた「謎ガジェット」開発１年史

<https://builderscon.io/tokyo/2018/session/442f46cc-c888-4cc6-8e66-0f17144ea5fb>

PCの電源が不安になってきたところ…

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">メインホール、椅子に電源ついてるの最高だな。<a href="https://twitter.com/hashtag/builderscon?src=hash&amp;ref_src=twsrc%5Etfw">#builderscon</a></p>&mdash; P山 (@pyama86) <a href="https://twitter.com/pyama86/status/1037871232849391616?ref_src=twsrc%5Etfw">2018年9月7日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

控えめに言っても最高だな。

ってことで、謎ガジェットの制作秘話を聞きに行くことに。

すごくおもしろかった。モノづくりの苦労と面白さがビシバシ伝わってきた。

人を動かすパワーを感じた。

**人を動かすパワーを感じた。**

## JavaCardの世界

<https://builderscon.io/builderscon/tokyo/2018/session/c9420e29-489d-4abe-b8d7-96d1e4d61b47>

YubiKey の U2F ホストライブラリとか、スマートカードとかを最近触っていて、その裏側で動いている（ことが多い）Java Card が気になっていた。ということで、今年のベストスピーカー賞の @moznio さんの講演。

Java のクラスは [CompletetableFuture](https://docs.oracle.com/javase/jp/8/docs/api/java/util/concurrent/CompletableFuture.html) らしい。すぐにググったら concurrent パッケージ内のクラスで Promise 的な動きをするらしい。へー。

Java Card 自体は、スマートカードを調べる際にある程度独学で調査していたけれども、やはり本職の方が説明する内容は勉強になった。

ただ、Java Card に通常どのような機能が実装されるか（要はSIMカードが何をしているか）の説明が初めにあったほうが分かりやすかったのかなあと感じた。

BCAS カード() とか、何故かわからないけど JDK1.6 が安定して動作するwwww とか闇も面白かった。

## lld − 開発ツールの主要コンポーネントの1つをスクラッチから作成した話

<https://builderscon.io/tokyo/2018/session/a5d70539-6cb2-4d9c-a472-3e48f2eb3183>

会社の先輩が、ruiさんじゃん、聞きに行くの？と言われて、聞きに行った。

まずリンカがわからん（予習不足である）

空のプログラムを既存のリンカでバイナリ作って、プリンタで16進数に直して印刷、自分なりに仕組みを理解して1バイトずつ別の書き方で動かしてみる、とか意味わからんことをサラッと語っちゃうあたりパネェとしか…。

ただ話としては、

- 良いプログラムはない、よいデータ設計があるだけだ。
- 問題解決するとは何か、見極めろ。問題解決のために問題を生み出していないか。
- 勇気（と責任）をもって実行しろ。

ということを言っていたように思う。とにかく格好良くて圧倒された。

# Day 2


## 全てのエンジニアに知ってもらいたいOSの中身について

https://speakerdeck.com/ariaki/os-that-we-should-know

https://speakerdeck.com/ariaki/os-that-we-should-know?slide=81

二日目は @rui314 さんのセッションに感化されて、低レイヤーの話を聞きに行くことに。

OSってわかんなくね？、でもOSを知るとちょっと幸せになる。って導入からスタート。

で、のんきしてたら 16bit CPU の話が始まって、いきなり置いて行かれそうになる。

なんとなーく、CPU のしくみとかは基本情報技術者の教本レベルで見たことはあったので、なんとなくわかったような気で、Intel 8086 の名前が x86 の期限とか、HMAはもともとバグだったとか、 トリビアを混ぜながらリングプロテクションのお話を聞いた。

最終的に SYSCALL をたたけるのは OS の UserLand ってところで、そっから先は OS が各 CPU によって、切り分けをしているという話

write() ---> Kernel[ system_call ] --> 実際にメモリ上に展開

まあ大体わかんなかったな！

でも何とか質問をしたら、終わった後に登壇者から話しかけていただいた。みんなが知らない分野の話を、実際の細かい話をせずに発表するのは難しいですよね～って話をして、ほんそれってなっていた。

## 高集積コンテナホスティングにおけるボトルネックとその解法

色々迷ったけど @pyama86 さんの話を聞きに行くことに。めっちゃ並んでた。

紹介分からして、低レイヤーの話になるんだろうなと思ったらやっぱ低レイヤーだった。（最終的にメモリアロケーターの話とかしてた）

ペパボで運用しているコンテナホスティングについて。内容はめっちゃ濃いのでスライドとブログを読んだほうがいいと思う。

とりあえず、 @ten_forward さんの LXCで学ぶコンテナ入門がおすすめ だそうなので、それを見よう。

肝心のコンテナ起動速度に関しては、起動の瞬間のメモリをダンプしておいて ms で起動することも検討しているそうで、「よくわからんけどすごい」

ここから電源がなくなりメモがない。

## なぜエンジニアはパフォーマンス計測しないのか

題名は真面目だが、中身はかなりはっちゃけてる。とはいえ、半年ぐらいガチで自分の体のログをとって、グラフ表示したり統計を取ったりしていた。

ちなみに、スライドで紹介されていたタバタトレーニングは、たった4分でできるので、**忙しいエンジニアでも継続可能** って触れ込みだったが、
正確には

**運動不足のエンジニアでは1分持たない**

トレーニングだった。つらい。

## Using Chrome Developer Tools to hack your way into concerts 

https://builderscon.io/tokyo/2018/session/a9e04c66-219e-4d33-9315-f597b8f97829


エンジニアたるもの英語を話せないといけない。ってことで1つぐらい英語のセッションを聞こうと思って参加。
スライドに日本語をつけているところに努力の跡を感じた。

英語は聞こえなかったけど、Chrome Dev Tools の知らない機能が聞けて良かった。

XHR のリクエスト時にブレークポイントを張る機能と XHR リクエストを保存しておいてリトライする機能は初めて知った。

特に特定の HTTP リクエスト時に、止める機能はいろんな画面で役立ちそうだなあと感じた。

## RDB THE Right Way ~壮大なるRDBリファクタリング物語~ 
<https://builderscon.io/tokyo/2018/session/ddba9bd5-819e-489e-9123-04d2291d506e>

普段あんま意識しないRDBのお話。まあプログラム書いてないからね。当たり前なんだけど。

とりあえず[達人に学ぶDB設計 徹底指南書](https://www.amazon.co.jp/%E9%81%94%E4%BA%BA%E3%81%AB%E5%AD%A6%E3%81%B6DB%E8%A8%AD%E8%A8%88-%E5%BE%B9%E5%BA%95%E6%8C%87%E5%8D%97%E6%9B%B8-%E5%88%9D%E7%B4%9A%E8%80%85%E3%81%A7%E7%B5%82%E3%82%8F%E3%82%8A%E3%81%9F%E3%81%8F%E3%81%AA%E3%81%84%E3%81%82%E3%81%AA%E3%81%9F%E3%81%B8-%E3%83%9F%E3%83%83%E3%82%AF/dp/4798124702)の方を買いました。

## 最後に

テーマの "Discover Something New" 「知らなかった、を聞く」というテーマどおり、知らなかったことをたくさん見つけた2日間だった。

色々と思うことはあるが、皆さんめっちゃコード書いてるなーってかなり焦りを感じた。

コードを大量に書いたひとが偉いとは言わないが、いいプログラムを書くには地道にコードを書いていくしかない。

そして、できない理由を並べているよりは、文章もコードもどんどん書いたほうがうまくなるに決まっている。当然闇雲に書くのが良いとは言えないが、インプットだけしてるやつより、クソでもアウトプットしてるやつのが偉い。

ということで、もっと偉くなるぞ！アウトプットするぞ！って気にさせられた。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">Builderscon から帰って、彼女にステッカーいっぱいもらったし、うまい棒も食い放題だったって説明したら、「子供のイベントなの？」って言われた。確かにな。 <a href="https://twitter.com/hashtag/builderscon?src=hash&amp;ref_src=twsrc%5Etfw">#builderscon</a></p>&mdash; 82 (@watahani) <a href="https://twitter.com/watahani/status/1038414466273107968?ref_src=twsrc%5Etfw">2018年9月8日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

本当に充実した2日間だった。スピーカーの皆さんに本当に感謝。実現してくれたスタッフの皆さんにも感謝。

また来年、今度はスピーカーとして参加たい。