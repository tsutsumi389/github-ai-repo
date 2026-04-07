---
id: ADR-008
title: shadcn/ui の採用
status: Accepted
date: 2026-04-07
superseded_by:
supersedes:
---

## コンテキスト

UIコンポーネント（Button、Form、Dialog、Table等）の実装方法として以下の選択肢があった。

- 自前実装（Tailwind + Radix UI を直接利用）
- MUI / Mantine / Chakra UI などの完成された UI ライブラリ
- shadcn/ui（Radix UI ベースのコンポーネント集を自プロジェクトにコピーする方式）

本プロジェクトは GitHub Primer 風デザインシステムを採用しており、トークン（色・角丸・タイポ）を細かく調整できることが必須要件となる。

## 決定

shadcn/ui を採用する。Nova プリセット（Lucide / Geist）をベースとし、必要なコンポーネントだけを `src/components/ui/` 配下に追加する運用とする。

## 理由

- **コードオーナーシップ**: コンポーネントは npm パッケージではなくソースコードとしてプロジェクトに取り込まれるため、Primer 風デザイントークンへの調整が容易
- **アクセシビリティ**: Radix UI Primitives ベースのため WAI-ARIA 準拠が担保される
- **技術スタック適合**: Next.js 16 / React 19 / Tailwind CSS v4（ADR-004）と公式に互換
- **段階導入**: CLI で必要なコンポーネントだけ追加できるため、未使用コードを抱え込まない
- **ロックインなし**: パッケージではないため、後から差し替え・削除が容易

完成形 UI ライブラリ（MUI 等）は独自テーマシステムを持つため Primer トークンへの追従コストが高く、また RSC との相性に懸念があるため不採用とした。

## 結果

- `components.json` がプロジェクト直下に追加され、shadcn CLI の設定を保持する
- `src/lib/utils.ts` に `cn()` ヘルパが追加される
- 依存として `class-variance-authority`、`clsx`、`tailwind-merge`、`radix-ui`、`lucide-react`、`geist` が追加される
- 追加したコンポーネントは自プロジェクトのコードとなるため、上流の更新は手動で取り込む必要がある
- Biome のフォーマット規約と shadcn 生成コードが衝突する場合があるため、追加後は `bunx biome check --write` を実行する運用とする
