---
id: ADR-006
title: TypeScript strict mode の採用
status: Accepted
date: 2026-04-05
superseded_by:
supersedes:
---

## コンテキスト

TypeScript のコンパイラオプションとして、strict mode の有効/無効、または部分的な有効化が選択肢となった。

## 決定

`tsconfig.json` で `strict: true` を有効にする。

## 理由

- **AIエージェントによる `any` の使用を制限する**: strict mode では暗黙の `any` がコンパイルエラーになるため、AIがコード生成時に型を曖昧にすることを機械的に防止できる
- **実行時エラーの未然防止**: `strictNullChecks` により `null` / `undefined` の安全性が保証され、型推論の厳密化でバグを早期に検出できる

部分的な有効化（`strictNullChecks` のみ等）も検討したが、設定が中途半端になるリスクを避け、全項目を有効にした。

## 結果

- 型定義の記述量が増えるが、コードの安全性と可読性の向上で相殺される
- 外部ライブラリの型定義が不十分な場合、明示的な型アサーションが必要になる場合がある
