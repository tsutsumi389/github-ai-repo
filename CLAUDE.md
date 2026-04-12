@AGENTS.md

## パッケージマネージャー

このプロジェクトでは **bun** を使用する。`npx`、`npm run`、`yarn` は使わないこと。

- スクリプト実行: `bun run <script>`
- パッケージ実行: `bunx <package>`
- 依存追加: `bun add <package>`
- テスト実行: `bun run test` または `bunx vitest`

## ADR (Architecture Decision Records)

設計判断の記録は `docs/adr/` で管理する。

- 新機能追加やアーキテクチャ変更時は、既存ADRを確認し、必要に応じて新規ADRを作成すること
- 既存ADRの内容は書き換えない（不変原則）。決定を変更する場合は新しいADRを発行し、旧ADRをSupersededにする
- ADRのステータスが `Accepted` のもののみが現在有効な決定である
- バリデーション: `bun run check:adr`
