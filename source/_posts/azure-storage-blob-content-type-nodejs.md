---
title: Azure Storage Blob に Content-Type 付きでアップロードする
date: 2020-04-30 22:15:38
tags:
  - Azure
  - javascript
---

半年に 1 回ぐらい Azure Storage Blob を触るんだけど、毎回 Content-Type をセットするのを忘れてハマっている。
今回は nodejs で書いたので、忘れないようにメモ。

パッケージとして `@azure/storage-blob` を使う。あとファイル検索のために `glob` もつかう。

<!-- more -->

```js
npm install -S @azure/storage-blob glob
```

とりあえずファイルをアップロードするサンプル。

```js
const mime = require("mime");
const { BlobServiceClient } = require("@azure/storage-blob");

const AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=xxxx;AccountKey=xxxxx;EndpointSuffix=core.windows.net";
const fileName = "./file.html";
const containerName = "$web";

async function uploadToBlob(fileName) {
  const blobServiceClient = await BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );

  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );

  const blockBlobClient = containerClient.getBlockBlobClient("file.html");
  const data = fs.readFileSync(fileName);
  const contentType = mime.getType(fileName);
  const options = {
    blobHTTPHeaders: {
      blobContentType: contentType,
    },
  };

  return await blockBlobClient.upload(data, data.length, options);
}
```

ポイントは mime で Content-Type を判別して、blobContentType に突っ込む、ってこれ普通に node やってる人からしたあたりまえなのかな。公式サンプル無いのなんでなんだろ… すごい悩んだ。

まとめてアップロードする時は glob 使ってこんな感じ。

```js
async function uploadFolderToBlob() {
  const blobServiceClient = await BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );

  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );

  return Promise.all(
    glob("./public/**/*.*", { nodir: true, sync: true }).map(async (fileName) => {
      console.log(fileName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      const data = fs.readFileSync(fileName);
      const contentType = mime.getType(fileName);
      const options = {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
      };
      return await blockBlobClient.upload(data, data.length, options);
    })
  );
}
```

`Promise.all()` で Promise のリストを包んでやるのがポイント。相変わらず同期処理の書き方が分かってないので、いつもググりながら書いてる。
fileName が `./path/to/file` みたくなっても、いい感じにアップロードしてくれるらしい。
(上記の例だと `$web/path/to/file` にアップロードされる)

今年も 1/3 が終わってしまった。そろそろ Azure AD B2C のカスタム ポリシーのまとめネタを書きたいけど、相変わらず全然わからんのでちょいネタでブログ更新。
