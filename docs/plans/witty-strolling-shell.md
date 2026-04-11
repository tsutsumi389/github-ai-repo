# UI/UX デザインガイド準拠化計画 — Primer トークン移行

## Context

`/ui-ux-design-guide` のチェックで、デザイントークンが **GitHub Primer 風ではなく shadcn/ui のデフォルト (oklch グレースケール)** のままになっていることが判明した。

ADR-008 は「Primer 風デザイントークンへの調整が容易なこと」を shadcn 採用の理由に掲げており、**ガイドと ADR の意図に対して実装が追従していない状態**。アクセントカラーが無彩色グレーで、Primer の青系アクセント (`#0969da` / `#58a6ff`) が失われているのが最大の症状。

**目的**: `src/app/globals.css` をガイド準拠の Primer トークンで再構築し、shadcn コンポーネント (`src/components/ui/*`) を無改修のまま Primer 配色で動作させる。自作コンポーネント側はトークン参照が shadcn 名 (`bg-background` 等) のままでも、背後で Primer 色に解決されるようにする。

**ダークモード戦略**: 現状の `.dark` クラス方式 → **`prefers-color-scheme` メディアクエリ方式**に切り替える。理由:
- ガイドの実装例と一致
- トグル UI が現プロジェクトに未実装のため、`.dark` クラスは実質付与されず動作していない疑いがある
- JS ゼロで OS 設定に自動追随でき、RSC と相性が良い
- FOUC が原理的に起きない

**非目的**:
- ダークモード切替トグル UI の実装 (OS 設定追随のみ。将来必要になったらハイブリッド方式へ再検討)
- shadcn コンポーネントの書き換え
- `prefers-reduced-motion` 等の A11y 追加対応 (shadcn で既に担保済みと確認済み)

## アプローチ: 「shadcn トークン名のまま値だけ Primer に差し替える」ブリッジ方式 + メディアクエリ化

`globals.css` の `:root` に定義されている shadcn トークン (`--background`, `--foreground`, `--primary`, `--accent`, `--destructive` 等) の**値**を Primer のカラーに置き換える。トークン**名**は触らない。

ダークモードは `.dark` クラスセレクタを**廃止**し、`@media (prefers-color-scheme: dark) { :root { ... } }` ブロックに移行する。併せて `@custom-variant dark (&:is(.dark *))` を `@custom-variant dark (@media (prefers-color-scheme: dark))` に書き換え、shadcn コンポーネント内の `dark:` ユーティリティ (例: `button.tsx:14` の `dark:border-input` 等) がメディアクエリで解決されるようにする。

利点:
- shadcn コンポーネントと既存の自作コンポーネント (`header.tsx`, `repository-card.tsx`, 詳細ページ) がノーコード変更で Primer 配色になる
- shadcn CLI で将来コンポーネントを追加しても壊れない
- ADR-008 が示す「shadcn の上に Primer トークンを載せる」運用と一致

欠点:
- ガイドの `--color-fg-default` 等の命名とは一致しない（shadcn 名で参照する運用になる）
- → ガイドに「shadcn トークン名 ↔ Primer セマンティクスのマッピング表」を追記して辻褄を合わせる必要がある

## マッピング設計 (ライト / ダーク)

globals.css `:root` と `.dark` で値を差し替える対象:

| shadcn トークン | Primer ライト | Primer ダーク | 根拠 |
|---|---|---|---|
| `--background` | `#ffffff` | `#0d1117` | `--color-bg-default` |
| `--foreground` | `#1f2328` | `#f0f6fc` | `--color-fg-default` |
| `--card` | `#ffffff` | `#0d1117` | bg-default |
| `--card-foreground` | `#1f2328` | `#f0f6fc` | fg-default |
| `--popover` / `--popover-foreground` | 同上 | 同上 | bg/fg-default |
| `--primary` | `#0969da` | `#1f6feb` | Primer accent (border-accent) |
| `--primary-foreground` | `#ffffff` | `#ffffff` | accent 上の文字 |
| `--secondary` | `#f6f8fa` | `#151b23` | bg-muted |
| `--secondary-foreground` | `#1f2328` | `#f0f6fc` | fg-default |
| `--muted` | `#f6f8fa` | `#151b23` | bg-muted |
| `--muted-foreground` | `#59636e` | `#9198a1` | fg-muted |
| `--accent` | `#ddf4ff` | `#121d2f` | bg-accent (hover 用薄青) |
| `--accent-foreground` | `#0969da` | `#58a6ff` | fg-link |
| `--destructive` | `#d1242f` | `#f85149` | fg-danger |
| `--border` | `#d1d9e0` | `#3d444d` | border-default |
| `--input` | `#d1d9e0` | `#3d444d` | border-default |
| `--ring` | `#0969da` | `#1f6feb` | border-accent (フォーカスリング) |
| `--radius` | `0.375rem` (6px) | 同左 | `--radius-md` = 6px |

**チャート色・サイドバー色**: 今はどこからも参照されていないため、本フェーズではスコープ外 (現状値のまま放置)。将来必要になったら別途対応。

**色形式**: 現状 oklch だが、ガイドの色値は hex で提示されているため、**移行作業の検証性を優先して hex で書き込む**。oklch への再変換は任意フォローアップ。

## 変更対象ファイル

1. **`src/app/globals.css`** — 唯一の実質変更
   - 行 5 `@custom-variant dark (&:is(.dark *));` → `@custom-variant dark (@media (prefers-color-scheme: dark));` に差し替え
   - `:root` ブロック (行 51-84): 上記マッピング表のライト値に差し替え
   - `.dark { ... }` ブロック (行 86-118) を**削除**し、代わりに `@media (prefers-color-scheme: dark) { :root { ... } }` を追加してダーク値を記述
   - `@theme inline` ブロック (行 7-49): **変更なし** (shadcn トークン名のまま)
   - `--radius` を `0.625rem` → `0.375rem` に変更 (ガイドの `--radius-md` = 6px に合わせる)

2. **`docs/adr/ADR-010-primer-token-mapping.md`** (新規)
   - 「shadcn トークン名を Primer セマンティックカラーにマップする」決定を記録
   - ダークモード切替戦略を `.dark` クラスから `prefers-color-scheme` に変更した判断もここに記録 (理由: ガイド準拠、トグル UI 未実装、JS ゼロで RSC 相性良し)
   - ADR-008 を補完する形 (supersede ではなく追加)
   - マッピング表を内包し、将来のコンポーネント追加時の参照先にする
   - 将来ユーザー明示切替が必要になったらハイブリッド方式 (`prefers-color-scheme` + `.light`/`.dark` クラス上書き) に拡張する方針を「結果」節に明記

3. **`.claude/skills/ui-ux-design-guide/SKILL.md`** (読み取り確認済み、軽微更新)
   - 「実装ガイド」セクションに「本プロジェクトでは shadcn トークン経由で Primer 色を参照する」旨の注記を追記
   - `var(--color-fg-default)` の直接参照例は削除し、`bg-background text-foreground` 形式に書き換える

## 既存資産の再利用

- **ADR-008** (`docs/adr/ADR-008-shadcn-ui.md`): 本計画の前提となる決定。新規 ADR から参照する
- **`src/components/ui/button.tsx:8`**: 既に `focus-visible:ring-ring/50` が定義済み。`--ring` の値差し替えだけで Primer の青フォーカスリングが自動適用される
- **`src/app/layout.tsx`**: Geist フォント設定は変更不要 (ガイドのシステムフォントスタックはフォールバックとして機能)
- **自作コンポーネント群** (`header.tsx`, `repository-card.tsx`, `repositories/[owner]/[repo]/page.tsx`, `page.tsx`): いずれも shadcn トークン経由 (`bg-background`, `text-muted-foreground`, `border-border`) で参照しており、**変更不要**

## 検証手順

1. **ビジュアル確認** (必須)
   - `bun dev` で起動し、以下の画面を確認:
     - `/` (トップページ、リポジトリ一覧)
     - `/repositories/{owner}/{repo}` (詳細ページ)
   - ライト/ダーク両モードは **OS の外観設定を切り替えて** 検証 (macOS: システム設定 → 外観、もしくは DevTools の Rendering パネルから `Emulate CSS media feature prefers-color-scheme` を `dark` / `light` に切替)
   - 確認項目:
     - カードの背景が白/`#0d1117` になっているか
     - ボーダーが Primer グレー (`#d1d9e0` / `#3d444d`) になっているか
     - ボタン/ペジネーションのフォーカス時に青リング (`#0969da`) が出るか
     - リンクのホバー下線が読めるか
     - 補助テキスト (`text-muted-foreground`) が Primer のミュート色になっているか
     - OS をダークに切り替えると**ページ全体が自動でダーク化する** (JS 介入なし、FOUC なし)

2. **コントラスト比チェック**
   - DevTools のアクセシビリティパネルで主要テキスト要素の WCAG AA (4.5:1) 準拠を確認
   - 特に `--muted-foreground` (`#59636e` on `#ffffff` = 5.1:1 ✓) と accent 組合せ

3. **自動チェック**
   - `bun run check:adr` — 新規 ADR のバリデーション
   - `bun run lint` / `bunx biome check` — globals.css の構文チェック
   - `bun test` — 既存テストが壊れていないことを確認 (トークンは名前のまま変更しないので破壊変更なしの想定)
   - `bun run build` — Tailwind v4 の `@theme` 解決がビルド時に通ることを確認

4. **リグレッション目視**
   - ダークモードは手動切替 (`<html class="dark">`) で確認。現状の切替 UI がないため DevTools からクラス注入で検証

## 実行順序 (実装フェーズで辿る手順)

1. ADR-010 を `docs/adr/` に新規作成 (マッピング決定 + `prefers-color-scheme` 移行を先に固定)
2. `globals.css` 行 5 の `@custom-variant dark` をメディアクエリ方式に書き換え
3. `:root` を Primer ライト値に差し替え → OS ライトでビジュアル確認
4. `.dark { ... }` ブロックを削除し `@media (prefers-color-scheme: dark) { :root { ... } }` を追加 → OS ダーク (または DevTools エミュレート) で確認
5. `--radius` を `0.375rem` に変更 → 角丸の見た目確認
6. `.claude/skills/ui-ux-design-guide/SKILL.md` の実装ガイドセクションを更新
7. `bun run check:adr` / `bun run lint` / `bun test` / `bun run build` を通す
8. コミット: `feat: migrate design tokens to GitHub Primer palette`

## 未解決事項 (実装中に判断)

- チャート色・サイドバー色は現状未使用のため保留。将来ダッシュボード系機能を足す際に別 ADR で扱う
- hex → oklch 再変換は美学の問題で機能に影響しないため、本計画ではスコープ外
