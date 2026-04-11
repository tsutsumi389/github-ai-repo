---
id: ADR-010
title: shadcn トークンへの Primer カラーマッピングと prefers-color-scheme 方式への移行
status: Accepted
date: 2026-04-11
superseded_by:
supersedes:
---

## コンテキスト

ADR-008 で shadcn/ui を採用した際、その理由の一つに「Primer 風デザイントークンへの調整が容易」を挙げていた。
しかし、`src/app/globals.css` のカラー定義は shadcn の初期値（oklch グレースケール）のままで、
`.claude/skills/ui-ux-design-guide/SKILL.md` に記載された GitHub Primer のセマンティックカラーが反映されていなかった。
結果として、アクセントカラーが無彩色グレーとなり、Primer の青系アクセント（`#0969da` / `#58a6ff`）が失われていた。

加えて、ダークモードは shadcn 初期状態の `.dark` クラス方式で定義されていたが、
本プロジェクトには切替トグル UI が存在せず `.dark` クラスが付与されないため、OS のダークモード設定に追随しない状態だった。

## 決定

- **shadcn トークン名（`--background`, `--primary` 等）は維持し、値だけを GitHub Primer のカラーに差し替える**ブリッジ方式を採用する
- **ダークモード切替は `prefers-color-scheme` メディアクエリ方式**に移行する（`.dark` クラス方式は廃止）
- `@custom-variant dark` も `@media (prefers-color-scheme: dark)` に書き換え、shadcn コンポーネント内の `dark:` ユーティリティがメディアクエリで解決されるようにする

### マッピング表

| shadcn トークン | Primer ライト | Primer ダーク | 根拠 |
|---|---|---|---|
| `--background` | `#ffffff` | `#0d1117` | `bg-default` |
| `--foreground` | `#1f2328` | `#f0f6fc` | `fg-default` |
| `--card` | `#ffffff` | `#0d1117` | `bg-default` |
| `--card-foreground` | `#1f2328` | `#f0f6fc` | `fg-default` |
| `--popover` | `#ffffff` | `#0d1117` | `bg-default` |
| `--popover-foreground` | `#1f2328` | `#f0f6fc` | `fg-default` |
| `--primary` | `#0969da` | `#1f6feb` | `border-accent` |
| `--primary-foreground` | `#ffffff` | `#ffffff` | accent 上の文字 |
| `--secondary` | `#f6f8fa` | `#151b23` | `bg-muted` |
| `--secondary-foreground` | `#1f2328` | `#f0f6fc` | `fg-default` |
| `--muted` | `#f6f8fa` | `#151b23` | `bg-muted` |
| `--muted-foreground` | `#59636e` | `#9198a1` | `fg-muted` |
| `--accent` | `#ddf4ff` | `#121d2f` | `bg-accent` |
| `--accent-foreground` | `#0969da` | `#58a6ff` | `fg-link` |
| `--destructive` | `#d1242f` | `#f85149` | `fg-danger` |
| `--border` | `#d1d9e0` | `#3d444d` | `border-default` |
| `--input` | `#d1d9e0` | `#3d444d` | `border-default` |
| `--ring` | `#0969da` | `#1f6feb` | `border-accent`（フォーカスリング） |
| `--radius` | `0.375rem`（6px） | 同左 | `--radius-md` |

チャート色・サイドバー色は現状参照されていないため、本フェーズではスコープ外。

## 理由

- **shadcn コンポーネントを無改修で Primer 配色にできる**: トークン名を維持するため、`src/components/ui/*` および自作コンポーネント（`header.tsx`, `repository-card.tsx` 等）は変更不要
- **shadcn CLI での将来コンポーネント追加が壊れない**: 標準のトークン名空間を保つ
- **ADR-008 の意図と整合**: 「shadcn の上に Primer トークンを載せる」運用を実体化
- **`prefers-color-scheme` 採用理由**:
  - デザインガイドの実装例と一致
  - 切替トグル UI が未実装のため `.dark` クラス方式は実質機能していない
  - JS ゼロで OS 設定に自動追随でき、RSC と相性が良い
  - FOUC が原理的に発生しない

### 代替案

- **Primer 命名（`--color-fg-default` 等）を直接導入する**: ガイドとの命名一致度は上がるが、shadcn コンポーネント側を全修正する必要があり、将来の CLI 追加も不整合となるため不採用
- **`.dark` クラス方式を継続**: 切替トグル UI の実装が必要で、本フェーズのスコープを超える

## 結果

- `src/app/globals.css` の `:root` が Primer ライト値に、新設する `@media (prefers-color-scheme: dark) { :root { ... } }` がダーク値を保持する
- `.dark { ... }` ブロックは廃止される
- shadcn コンポーネントおよび既存の自作コンポーネントはトークン参照（`bg-background`, `text-muted-foreground`, `border-border` 等）のままで Primer 配色に解決される
- shadcn トークン名と Primer セマンティクスの対応関係は本 ADR のマッピング表を参照先とする
- ADR-008 を補完する位置付け（supersede ではなく追加）
- **将来、ユーザー明示切替が必要になった場合**: `prefers-color-scheme` に `.light` / `.dark` クラス上書きを組み合わせたハイブリッド方式へ拡張する。その際は新規 ADR で決定を記録する
- チャート色・サイドバー色は将来ダッシュボード系機能を追加する際に別 ADR で扱う
