---
title: Azure ポータルの言語をワンクリックで切り替える
date: 2021-11-05 12:23:00
tags:
  - Azure
  - 雑記
---

検証の時に英語にしたり、日本語にしたり面倒だったのでブックマーク レートにした。備忘録のためにメモっておく。

以下のリンクをブックマーク バーにでもドラッグアンドドロップしておけばよい。

<a href="javascript:l%3Dnew%20URL(location.href)%3Bif(l.host%3D%3D%3D'learn.microsoft.com')%7Bwindow.location.href%3Dl.origin%20%2B%20l.pathname.replace(%2F%5E%5C%2F.*%3F%5C%2F%2F%2C%22%2Fja-jp%2F%22)%3B%7Delse%7Bl.searchParams.set(%22l%22%2C%22ja.ja-jp%22)%3Bwindow.location.href%3Dl.toString()%3B%7Dvoid(0);">日本語</a>

<a href="javascript:l%3Dnew%20URL(location.href)%3Bif(l.host%3D%3D%3D'learn.microsoft.com')%7Bwindow.location.href%3Dl.origin%20%2B%20l.pathname.replace(%2F%5E%5C%2F.*%3F%5C%2F%2F%2C%22%2Fen-us%2F%22)%3B%7Delse%7Bl.searchParams.set(%22l%22%2C%22en.en-us%22)%3Bwindow.location.href%3Dl.toString()%3B%7Dvoid(0);">英語</a>

<!-- more -->

中身はこれ。URL に l=en.en-us のクエリを追加するだけ。

```javascript
l = new URL(location.href);
l.searchParams.set("l", "en.en-us");
window.location.href = l.toString();
```

めんどいので URL チェックなどはやってない。ブックマーク レートの作成は、ググって以下のサイトを利用した。

- [Bookmarklet スクリプト変換](https://ytyng.github.io/bookmarklet-script-compress/)

Docs の変換も面倒なので追記。en-us を雑に変換してもいいんだけど一応ちゃんとパスの狙ったとこだけ

```javascript
l = new URL(location.href);
if (l.host === 'learn.microsoft.com') {
    window.location.href = l.origin + l.pathname.replace(/^\/.*?\//, "/ja-jp/");
} else {
    l.searchParams.set("l", "ja.ja-jp");
    window.location.href = l.toString();
}
```
