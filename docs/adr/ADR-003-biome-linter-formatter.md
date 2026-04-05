---
id: ADR-003
title: Biome をリンター/フォーマッターとして採用
status: Accepted
date: 2026-04-05
superseded_by:
supersedes:
---

## コンテキスト

コードの品質維持と一貫したフォーマットのため、リンター/フォーマッターの選定が必要だった。ESLint + Prettier、Biome、oxlint が候補となった。

## 決定

Biome を採用する。

## 理由

- **リンターとフォーマッターが一体**: ESLint + Prettier のように2ツールの設定や競合を管理する必要がなく、`biome.json` 1ファイルで完結する
- **Rustベースで高速**: JSベースの ESLint + Prettier と比較して実行速度が速い

oxlint も Rust ベースで高速だが、フォーマッター機能を持たないため一体型の Biome を選択した。

## 結果

- ESLint の豊富なプラグインエコシステムは利用できない
- 今後プロジェクトが成長し、ESLint 固有のプラグインが必要になった場合は再検討が必要
