---
title: React-Redux と TypeScript に入門
date: 2018-04-26 22:07:11
tags: 
 - React
 - javascript
 - TypeScript
---

仕事では フロントエンド をがっつり触るわけではないのですが、最近関東に越してきてフロントエンド系のイベントに参加して面白そうと思ったので入門がてら connpass ですぐに行けるもくもく会に参加申請したのが先週の金曜日。で、次の日の土曜日にもくもく会でガッツリ 10:00 ~ 17:30 まで React-Redux (+TypeScript) を学んできたのでアウトプットしたいと思う。

ちなみに私のスペックはというと

* npm install 位はわかる
* webpack デフォ設定ぐらいなら動かせる
* React は1年前に、React のチュートリアル（マルバツゲーム）をやった程度

## 目的

* React-Redux のキホンを学ぶ
* Material-ui を使う
* TypeScript の型を学ぶ

## Reactプロジェクトの作成

最近は `create-react-app` という素敵なライブラリががあるそうで、typescript込みのテンプレートも公開されている。

<https://github.com/Microsoft/TypeScript-React-Starter>

サンプルを動かすには、以下のようにするだけでもろもろ込みで動く。すごい。

```js

> npm install -g crate-react-app
+ create-react-app@1.5.2
> create-react-app mokumoku --scripts-version=react-scripts-ts
> cd mokumoku/
> npm install
> npm start

```

初めのうちは npm start にコケて、[`esnext.asynciterable` を `tsconfig.json` に追加しないと動かなかった](https://github.com/Microsoft/TypeScript-React-Starter/issues/142) けど今はそうでもない。イマイチ原因が分かってない。こわい。

## Material-ui の導入

今回は Material-ui を触ってみるのも一つの目的なので入れる。

```js
> npm install -S @material-ui/core
> npm install -S @material-ui/icons
```

## シンプルなリストの作成

なぜか TODO リストではなくて、単なるリストを作る。
表示するだけなら State はいらないので、SFC(Stateless Functional Component) で作ればよかったのかな…？

空のリストが TSLint に怒られるので any で良いのか、そのあたりはよくわからない。

```js

//空のインターフェイスは TSLint に怒られる
interface IState {
    nothing?: string;
}
//Simple Props for List
interface ISimpleListProps {
    list: Item[]
    name: string
}

//Simple list
class SimpleList extends React.Component<ISimpleListProps, IState> {
  public constructor(props: ISimpleListProps) {
    super(props);
  }
  public render() {
    return (
      <div>
        <List component="nav">
          {this.props.items.map((item, index) => {
            return (
              <ListItem button={true} key={index}>
                <ListItemText primary={item.name} />
                <ListItemSecondaryAction>
                      <IconButton>
                        <DeleteIcon />
                      </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </div>
    );
  }
}

```

これだけでそれっぽいリストが作られる。



## Redux の導入
