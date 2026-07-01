# CMS連携 仕様変更設計書

## 目的

現在の静的ホームページのうち、以下の記事部分だけをクライアント側で更新できるようにします。

- 病院からのお知らせ
- 看護部長ブログ

ページ全体は静的HTMLとして維持し、デザイン・導線・既存ページ構成は大きく変更しません。

## 推奨構成

外部CMSは microCMS などのヘッドレスCMSを想定します。

```
閲覧者
  ↓
静的ホームページ index.html
  ↓ JavaScriptで取得
外部CMS API
  ↓
お知らせ・ブログ記事を表示
```

## CMS項目案

### 病院からのお知らせ

- title: タイトル
- date: 掲載日
- category: patient / medical / recruit
- categoryLabel: 表示カテゴリ名
- linkType: none / url / page
- linkUrl: 外部URL
- pageId: 既存ページID
- isPublished: 公開状態

### 看護部長ブログ

- title: 記事タイトル
- month: 2026-06 のような年月ID
- displayMonth: 2026年6月
- date: 掲載日
- volume: Vol.03
- sections: 本文ブロック配列
- imageUrl: 写真URL
- imageAlt: 写真代替テキスト
- caption: 写真キャプション
- isPublished: 公開状態

## 実装方針

- index.html に CMS連携スクリプトを読み込みます。
- cms-integration.js でCMS APIから記事を取得して、既存のお知らせ欄・ブログ欄へ描画します。
- cms-config.example.js を cms-config.js に複製し、CMS契約後に実際の接続情報を設定します。
- CMS未設定時や通信失敗時は、既存HTML内の記事をそのまま表示します。

## セキュリティ・運用上の注意

- ブラウザから直接CMS APIを読む場合、APIキーは閲覧者から見えるため、読み取り専用にし、許可ドメイン制限を必ず設定します。
- 下書き、非公開、予約投稿、承認フローが必要な場合は、CMS側で権限設計します。
- 医療広告ガイドライン、個人情報、患者写真の掲載許諾を運用ルールに含めます。
- 本番公開前に、CMS管理画面の操作マニュアルと更新責任者を決めます。

## 引き渡し時に必要なもの

- CMS管理者アカウント
- 編集者アカウント
- CMSのAPI接続情報
- 更新マニュアル
- 投稿前チェックリスト
- サーバー・ドメイン・SSL情報
- 保守範囲と障害時連絡先

## 今回の実装範囲

- CMS連携用JavaScriptを追加
- 設定ファイルのひな形を追加
- サンプルデータを追加
- index.html に連携スクリプトを追加
- CMS未設定時のフォールバックを実装
