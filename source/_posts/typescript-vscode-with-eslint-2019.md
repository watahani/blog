---
title: VS Code で TypeScript with eslint 2019
date: 2019-06-15 21:56:53
tags:
  - TypeScript
  - Node
  - eslint
---

フロントエンドの技術トレンドの移り替わりは早い。普段あまりプログラムを書かないので、久々に Node.js なんかを触ると全く分からなくなる。

特に TypeScript 関連の環境構築は正直煩雑で、ハマって肝心のプログラミングができないこともある。
あんまり毎回ググるので、自分用のメモとして残しておく。こういう記事は世の中に山ほどあるけど、結局は自分用にまとめたほうが良いんだよね。

<!-- more -->

## 環境

- Windows 10
- Node 11 ぐらい
- TypeScript 3.x ぐらい

## TypeScript と ts-node

ひとまず TypeScript を入れる。ts のまま動かすために ts-node も入れる。

```cmd
> npm install -D typescript ts-node
```

npm でインストールしたバイナリ動かすのも、前はいろいろハマったけど、今は npx があるのでちゃんと使う。いちいちグローバルにインストールする必要はない。

```cmd
> npx tsc -v
Version 3.5.1
```

`tsc` で `tsconfig.json` を作る。

```cmd
> npx tsc --init
```

まあわからんよね。SourceMap の設定はしなくても ts-node 動くし問題なさそう?

```json
{
  "compilerOptions": {
    /* Basic Options */
    "target": "es5",                          /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019' or 'ESNEXT'. */
    "module": "commonjs",                     /* Specify module code generation: 'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or 'ESNext'. */
    "strict": true,                           /* Enable all strict type-checking options. */
    "esModuleInterop": true,                   /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
  }
}
```

index.ts を npm start で動かせるように `package.json` に追加

```json
  "scripts": {
    "start": "npx ts-node ./src/index.ts"
  },
```

## VS Code のデバッグ環境

VS Code でデバッグしたいので `.vscode/launch.json` を書く。これは [GitHub の issue](https://github.com/TypeStrong/ts-node/issues/46#issuecomment-437758378) からコピペ。

```json
{
    // IntelliSense を使用して利用可能な属性を学べます。
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Run index.ts",
            "type": "node",
            "request": "launch",
            "args": ["${workspaceRoot}/src/index.ts"],
            "runtimeArgs": ["--nolazy", "-r", "ts-node/register"],
            "sourceMaps": true,
            "cwd": "${workspaceRoot}",
            "protocol": "inspector",
        }
    ]
}
```

## コードの自動整形

初心者たるものコードの整形は機械任せにすべき、かどうかはわからんけど面倒なので機械任せにしとく。以前は tslint を使っていたように思うが、最近は eslint 使っとけばいいらしい。
このあたりの設定は [VSCodeでESLint+@typescript-eslint+Prettierを導入する - Qiita](https://qiita.com/madono/items/a134e904e891c5cb1d20) から。

```cmd
> npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

自動整形のため prettier も入れる。

```cmd
> npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

```json
  "devDependencies": {
    "eslint": "^5.16.0",
    "eslint-config-prettier": "^4.3.0",
    "eslint-plugin-prettier": "^3.1.0",
    "prettier": "^1.18.2",
    "ts-node": "^8.2.0",
    "typescript": "^3.5.1"
  }
```

`.eslintrc` も必要だけど、マジでなんもわからん。コピペ。

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint"
  ],
  "plugins": [
    "@typescript-eslint"
  ],
  "parser": "@typescript-eslint/parser",
  "env": { "browser": true, "node": true, "es6": true },
  "parserOptions": {
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
  }
}
```

自動整形と警告表示ができるように、VS Code に eslint のプラグインを入れて、VS Code の `settings.json` に `eslint.validate` の設定を追加する。

```json
    "eslint.enable": true,
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        {"language": "typescript", "autoFix": true },
        {"language": "typescriptreact", "autoFix": true }
    ],
```

最近 VS Code の設定ファイルを開こうとすると、GUI で開いちゃって json で開けないなーと思ってたけど、このボタンで json 形式で開けた。

{% asset_img lena.bmp vscode-settings-json.png %}

あとは、`scr/index.ts` 書いて、保存すれば整形、 F5 押せばデバッグ始まる。

{% asset_img lena.bmp vscode-debug.png %}

- https://github.com/watahani/authlete-handson
