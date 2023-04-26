---
title: Microsoft Graph API のトークンを検証しないでください
date: 2023-04-26 17:04
tags:
    - OAuth
    - Azure
---

Microsoft Graph API に対するトークンは JWT のように見えるが、JWT ではないので、**決して署名を検証しようとしてはいけない。**

<!-- more -->

「アクセス トークンの署名を検証できません」という話を聞いて、詳しく話を聞いてみると検証しようとしているトークンが Microsoft Graph API に対するトークンだったというオチがある。

Azure AD から発行されるアクセス トークンは、発行された対象 (audience) で消費されるべきであり、Microsoft Graph API に対するトークンは Microsoft Graph API だけが検証してよい。
特に Microsoft の First Party に対して発行されるアクセス トークンについては、公開情報でも jwt 形式とは限らないと注意書きがある。

[https://learn.microsoft.com/ja-jp/azure/active-directory/develop/v2-oauth2-auth-code-flow]

> この例のトークンを含めて、自分が所有していないすべての API について、トークンの検証や読み取りを行わないでください。 Microsoft サービスのトークンには、JWT として検証されない特殊な形式を使用できます。また、コンシューマー (Microsoft アカウント) ユーザーに対して暗号化される場合もあります。 トークンの読み取りは便利なデバッグおよび学習ツールですが、コード内でこれに対する依存関係を取得したり、自分で制御する API 用ではないトークンについての詳細を想定したりしないでください。

詳しい話は会社のチームブログ [Azure AD に登録できる 「アプリ」と「リソース」、「API 権限」を理解する | Japan Azure Identity Support Blog](https://jpazureid.github.io/blog/azure-active-directory/oauth2-application-resource-and-api-permissions/) に詳しく書いたのでそちらを参照のこと。

要望があれば続きを書くかも。

## 実際に検証してみた

ということで、前置きはこの辺にして実際に Microsoft Graph API に発行されたトークンを検証してみた。(は？) 

詳細は以下の GitHub Issue にある通り。

[Cannot validate signature. · Issue #609 · AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet](https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/issues/609#issuecomment-437471108)

Microsoft Graph API に発行されたトークンの形式は、ある突然不透明なランダム文字列になる可能性もある。また、JWT のままだがこの検証方法が突然使えなくなることもあるし、ただの興味本位で実装しただけなので注意。

**もしどこかからこのコードを見つけてきて参考に実装しようとしているなら、アタマを冷やして上記スレッドを理解できるまで読み込むことをおススメする。**

<script src="https://gist.github.com/watahani/6ddd7f1cbd8197c30e4adad9d09a6c12.js"></script>
