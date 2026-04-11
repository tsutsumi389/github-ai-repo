---
name: ui-ux-design-guide
description: >
  GitHub Primer風デザインシステムのトークンとガイドライン。UI/UXの実装・改善時に使用する。
  コンポーネント作成、スタイリング、レイアウト、カラー選択、タイポグラフィ、
  アクセシビリティ対応など、見た目に関わる作業では必ずこのスキルを参照すること。
  「ボタンを作って」「フォームを追加」「ダークモード対応」「レスポンシブにして」
  「色を変えたい」「UIを改善して」のような依頼で自動的にトリガーされる。
---

# UI/UX Design Guide

このプロジェクトは GitHub の Primer デザインシステムをベースにしたデザイントークンを使用する。
Tailwind CSS v4 のカスタムテーマとして `globals.css` に定義し、全コンポーネントで一貫して適用する。

## 基本原則

1. **セマンティックトークンを使う** — 生の色コード (`#0969da`) ではなく、意味のあるCSS変数 (`var(--color-accent)`) を使う
2. **ライト/ダーク両対応** — すべてのUIは両モードで正しく表示されること
3. **アクセシビリティファースト** — WCAG 2.1 AA 準拠を最低基準とする
4. **Tailwind ユーティリティ優先** — カスタムCSSは最小限に、Tailwind のクラスで表現する

## カラーパレット

詳細な色定義は `references/colors.md` を参照。以下はよく使うセマンティックトークンの要約。

### 前景色（テキスト）

| トークン | 用途 | ライト | ダーク |
|---|---|---|---|
| `--color-fg-default` | 本文テキスト | `#1f2328` | `#f0f6fc` |
| `--color-fg-muted` | 補助テキスト | `#59636e` | `#9198a1` |
| `--color-fg-disabled` | 無効状態 | `#818b98` | `#656c76` |
| `--color-fg-link` | リンク | `#0969da` | `#58a6ff` |
| `--color-fg-success` | 成功 | `#1a7f37` | `#3fb950` |
| `--color-fg-danger` | エラー・危険 | `#d1242f` | `#f85149` |
| `--color-fg-attention` | 警告 | `#9a6700` | `#d29922` |
| `--color-fg-done` | 完了 | `#8250df` | `#ab7df8` |

### 背景色

| トークン | 用途 | ライト | ダーク |
|---|---|---|---|
| `--color-bg-default` | デフォルト背景 | `#ffffff` | `#0d1117` |
| `--color-bg-muted` | ミュート背景 | `#f6f8fa` | `#151b23` |
| `--color-bg-emphasis` | 強調背景 | `#25292e` | `#f0f6fc` |
| `--color-bg-accent` | アクセント背景（薄） | `#ddf4ff` | `#121d2f` |
| `--color-bg-success` | 成功背景（薄） | `#dafbe1` | `#12261e` |
| `--color-bg-danger` | 危険背景（薄） | `#ffebe9` | `#2d1315` |
| `--color-bg-attention` | 警告背景（薄） | `#fff8c5` | `#272115` |

### ボーダー色

| トークン | 用途 | ライト | ダーク |
|---|---|---|---|
| `--color-border-default` | デフォルトボーダー | `#d1d9e0` | `#3d444d` |
| `--color-border-muted` | 薄いボーダー | `#d1d9e080` | `#3d444d80` |
| `--color-border-emphasis` | 強調ボーダー | `#25292e` | `#f0f6fc` |
| `--color-border-accent` | アクセントボーダー | `#0969da` | `#1f6feb` |
| `--color-border-success` | 成功ボーダー | `#1a7f37` | `#238636` |
| `--color-border-danger` | 危険ボーダー | `#cf222e` | `#da3633` |

## タイポグラフィ

### フォントファミリー

```
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
--font-mono: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
```

プロジェクトでは Geist フォントが設定済み。GitHub の雰囲気に合うシステムフォントスタックをフォールバックとして維持する。

### フォントサイズ

| トークン | 値 | 用途 |
|---|---|---|
| `--text-xs` | `0.75rem` (12px) | キャプション、バッジ |
| `--text-sm` | `0.875rem` (14px) | 本文デフォルト |
| `--text-md` | `1rem` (16px) | やや大きめ本文 |
| `--text-lg` | `1.25rem` (20px) | 小見出し |
| `--text-xl` | `2rem` (32px) | 見出し |
| `--text-2xl` | `2.5rem` (40px) | ヒーロー見出し |

### フォントウェイト

| トークン | 値 | 用途 |
|---|---|---|
| `--font-light` | 300 | 大きな見出しで軽く |
| `--font-normal` | 400 | 本文 |
| `--font-medium` | 500 | ラベル、強調 |
| `--font-semibold` | 600 | 見出し、ボタン |

### 行間

| トークン | 値 | 用途 |
|---|---|---|
| `--leading-tight` | 1.25 | ボタン、バッジなど1行UI |
| `--leading-snug` | 1.375 | 見出し |
| `--leading-normal` | 1.5 | 本文デフォルト |
| `--leading-relaxed` | 1.625 | 長文コンテンツ |

## スペーシング

4px グリッドベース。Tailwind のデフォルトスペーシングに加え、以下のセマンティックトークンを使う。

| トークン | 値 | 用途 |
|---|---|---|
| `--spacing-condensed` | `8px` (0.5rem) | 密なUI、バッジ内パディング |
| `--spacing-normal` | `16px` (1rem) | カード内パディング、一般的な余白 |
| `--spacing-spacious` | `24px` (1.5rem) | セクション間の余白 |

Tailwind のユーティリティとの対応: `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `gap-2` = 8px, `gap-4` = 16px, `gap-6` = 24px

## ボーダー

### 角丸

| トークン | 値 | 用途 |
|---|---|---|
| `--radius-sm` | `3px` | 小さな要素（バッジ、タグ） |
| `--radius-md` | `6px` | デフォルト（ボタン、カード、インプット） |
| `--radius-lg` | `12px` | 大きなカード、モーダル |
| `--radius-full` | `9999px` | アバター、ピル型ボタン |

Tailwind 対応: `rounded` = 6px（デフォルト）, `rounded-sm` = 3px, `rounded-lg` = 12px, `rounded-full` = 9999px

### ボーダー幅

デフォルトは `1px solid`。フォーカスリングは `2px solid var(--color-border-accent)`。

## シャドウ

| トークン | ライト | ダーク |
|---|---|---|
| `--shadow-inset` | `inset 0 1px 0 0 rgba(31,35,40,0.04)` | `inset 0 1px 0 0 rgba(1,4,9,0.24)` |
| `--shadow-xs` | `0 1px 1px rgba(31,35,40,0.05)` | `0 1px 1px rgba(1,4,9,0.80)` |
| `--shadow-sm` | `0 1px 1px rgba(31,35,40,0.04), 0 1px 2px rgba(31,35,40,0.03)` | `0 1px 1px rgba(1,4,9,0.60), 0 1px 3px rgba(1,4,9,0.60)` |
| `--shadow-md` | `0 1px 1px rgba(37,41,46,0.10), 0 3px 6px rgba(37,41,46,0.12)` | `0 1px 1px rgba(1,4,9,0.40), 0 3px 6px rgba(1,4,9,0.40)` |

用途: `--shadow-xs` はバッジ、`--shadow-sm` はボタン、`--shadow-md` はカードやドロップダウン。

## ブレークポイント

| トークン | 値 | 用途 |
|---|---|---|
| `--bp-xs` | `320px` | 小型モバイル |
| `--bp-sm` | `544px` | モバイル |
| `--bp-md` | `768px` | タブレット |
| `--bp-lg` | `1012px` | デスクトップ |
| `--bp-xl` | `1280px` | ワイドデスクトップ |
| `--bp-2xl` | `1400px` | 超ワイド |

Tailwind でカスタムブレークポイントとして定義し、`sm:`, `md:`, `lg:` 等のプレフィックスで使用する。

## アクセシビリティ

WCAG 2.1 AA 準拠を必須とする。以下のルールを守ること。

### コントラスト比

- **通常テキスト** (< 18px / < 14px bold): 最低 **4.5:1**
- **大きなテキスト** (>= 18px / >= 14px bold): 最低 **3:1**
- **UI コンポーネント・アイコン**: 最低 **3:1**

上記のセマンティックカラーはこの基準を満たすよう選定されている。カスタムカラーを使う場合は必ずコントラスト比を確認すること。

### キーボード操作

- すべてのインタラクティブ要素は Tab キーで到達可能にする
- フォーカスリングを必ず表示する: `outline: 2px solid var(--color-border-accent); outline-offset: 2px`
- `outline: none` の使用は禁止（代替のフォーカス表示がある場合を除く）
- `:focus-visible` を使い、マウスクリック時はリングを非表示にしてもよい

### セマンティック HTML

- 正しい見出し階層 (`h1` > `h2` > `h3`...) を守る
- ランドマーク要素 (`<nav>`, `<main>`, `<aside>`, `<footer>`) を適切に使う
- リスト構造には `<ul>/<ol>/<li>` を使う
- `<button>` と `<a>` を正しく使い分ける（アクションは `<button>`、ナビゲーションは `<a>`）

### ARIA

- 画像には `alt` 属性を必ず付ける（装飾画像は `alt=""`）
- アイコンボタンには `aria-label` を付ける
- 動的に変わるコンテンツには `aria-live` リージョンを使う
- モーダルには `role="dialog"` と `aria-modal="true"` を設定する
- 色だけで情報を伝えない — テキストやアイコンも併用する

### モーション

- `prefers-reduced-motion` メディアクエリを尊重する
- アニメーションの持続時間はデフォルト 150-300ms
- 装飾的なアニメーションは `reduced-motion` で無効化する

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 実装ガイド

### 本プロジェクトでの運用方針

本プロジェクトは shadcn/ui（ADR-008）を採用しており、`globals.css` には shadcn のトークン名
（`--background`, `--foreground`, `--primary`, `--muted-foreground`, `--border` 等）のみが定義されている。
Primer のカラーはこれらの shadcn トークンに**値として差し替え**てマップされている（ADR-010）。

したがって、コンポーネント実装時は以下のルールに従うこと。

- **Primer トークンを直接参照しない**（`var(--color-fg-default)` のような書き方はしない）
- **shadcn トークン経由の Tailwind ユーティリティを使う**（`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-accent text-accent-foreground` 等）
- shadcn トークン名と Primer セマンティクスの対応関係は `docs/adr/ADR-010-primer-token-mapping.md` のマッピング表を参照
- ダークモードは `prefers-color-scheme` メディアクエリで OS 設定に自動追随する（`.dark` クラスは使わない）

### globals.css の構造（参考）

```css
@import "tailwindcss";
@import "shadcn/tailwind.css";

@custom-variant dark (@media (prefers-color-scheme: dark));

:root {
  --background: #ffffff;
  --foreground: #1f2328;
  --primary: #0969da;
  /* ... Primer ライト値 */
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0d1117;
    --foreground: #f0f6fc;
    --primary: #1f6feb;
    /* ... Primer ダーク値 */
  }
}
```

### コンポーネントでの使い方

```tsx
// shadcn トークン経由の Tailwind ユーティリティで書く
<button className="bg-primary text-primary-foreground rounded-md px-4 py-2 shadow-sm">
  ボタン
</button>

<p className="text-muted-foreground">補助テキスト</p>
<div className="bg-background text-foreground border border-border rounded-md">...</div>
```

### 詳細リファレンス

色の完全なスケール（gray, blue, green, red, yellow, orange, purple, pink, coral）は
`references/colors.md` に定義されている。コンポーネントで特殊な色が必要な場合はそちらを参照すること。
