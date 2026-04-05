---
id: ADR-007
title: テストフレームワークに Vitest を採用
status: Accepted
date: 2026-04-05
superseded_by:
supersedes:
---

## コンテキスト

プロジェクトにユニットテスト環境が未整備であり、テストフレームワークの選定が必要になった。主な候補として Jest と Vitest を検討した。

## 決定

テストフレームワークとして Vitest を採用する。

## 理由

- **Next.js / Vite エコシステムとの親和性**: Vitest は Vite ベースであり、ESM ネイティブで動作するため、Next.js の App Router や React Server Components との相性が良い
- **軽量で高速**: Jest と比較してコールドスタートが速く、HMR ライクなウォッチモードにより開発体験が優れている
- **Jest 互換 API**: `describe` / `it` / `expect` など Jest と同じ API を提供しており、学習コストが低い
- **設定のシンプルさ**: `tsconfig.json` のパスエイリアス（`@/*`）や TypeScript を追加設定なしで扱える

Jest も検討したが、ESM 対応に追加設定が必要な点、起動速度の差から Vitest を選択した。

## 結果

- `vitest` / `@vitejs/plugin-react` / `jsdom` / `@testing-library/react` / `@testing-library/jest-dom` を devDependencies に追加
- テストファイルは `src/__tests__/**/*.test.{ts,tsx}` に配置する
- `bun run test` でテスト実行、`bun run test:watch` でウォッチモード実行が可能
