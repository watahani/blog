---
title: OneNote から Markdown に変換メモ
date: 2020-10-09 22:05:24
tags:
  - 雑記
---

OneNote から Markdown に変換する必要があったので手順をメモ。

もともとは @azu さんの [OneNoteのデータを画像付きのMarkdownにexportする | Web Scratch](https://efcl.info/2020/05/23/onenote-to-markdown/) を試そうと思ったけど、企業の OneNote では上手く動かなかったので、以下の gist を参考に pandoc で変換した。

参考: https://gist.github.com/heardk/ded40b72056cee33abb18f3724e0a580

数ページを変換するだけだったので、これで済んだけど、大量にするときは、別の方法のほうがいいかもしれない。

<!-- more -->

1. OneNote 2016 で、OneNote のページから Word に変換する。 (Store 版でどうやるかは知らない)
2. pandoc をインストール

```sh
scoop install pandoc
```

3. 以下コマンドで変換

```sh
pandoc.exe -f docx -t markdown_strict -i word.docx -o "word.md" --wrap=none --atx-headers
```

4. Word ファイルから画像ファイルを取り出し

```ps1
7z x .\seo.docx -otmp
mv tmp\word\media .\media
rm -Recurse -Force .\tmp
```

5. 画像タグを変換

`<img src="media/(.+?)" .+? />` => `![$1](./media/$1)`

後は体裁を整えて完了。