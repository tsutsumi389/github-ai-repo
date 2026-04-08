# GitHub リポジトリ一覧ページ（shadcn/ui対応・改訂版）

## Context

元プラン `docs/plans/sharded-bubbling-hennessy.md` のステップ1〜2（`src/types/github.ts`, `src/lib/github.ts`）は実装済み。その後 shadcn/ui（style: `radix-nova`, baseColor: `neutral`）がADR-008で採用されたため、残りのUI実装ステップを shadcn コンポーネントベースに書き換える。

## 実装済み（変更なし）

- ✅ `src/types/github.ts` — `Repository` 型定義
- ✅ `src/lib/github.ts` — `fetchRepositories()` 実装（GITHUB_TOKEN対応・エラー throw）
- ✅ `src/lib/utils.ts` — `cn()` ヘルパー
- ✅ `src/app/globals.css` — shadcn テーマトークン（`--card`, `--border` 等、ライト/ダーク両対応）

## 変更方針（差分）

- **Card は自作しない**。shadcn の `Card` / `CardHeader` / `CardTitle` / `CardContent` を使う
- アイコンは `lucide-react` を使用（ExternalLink 等が必要なら）
- 色は Tailwind ユーティリティ（`bg-card`, `text-card-foreground`, `border-border` 等）で CSS 変数参照
- 角丸は `rounded-lg`（`--radius: 0.625rem` に従う）
- `src/components/ui/` は現状空。Card を CLI でインストールする必要あり

## 残タスク

### 1. shadcn Card コンポーネントのインストール（コマンド）
```bash
bunx --bun shadcn@latest add card
```
→ `src/components/ui/card.tsx` が生成される（`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` をエクスポート）

### 2. `next.config.ts` 更新
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
```

### 3. `src/components/header.tsx`（新規）
- Server Component（`"use client"` なし）
- `<header>` に `border-b border-border bg-background` 等
- `<h1 className="text-xl font-semibold">github-ai-repo</h1>`
- コンテナ幅は page.tsx 側で制御、ヘッダー自体は横幅100%

### 4. `src/components/repository-card.tsx`（新規）
- Props: `{ repository: Repository }`
- shadcn の `Card` をルートに使用
- 構造：
  ```tsx
  <a href={repository.html_url} target="_blank" rel="noopener noreferrer" className="block">
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Image
          src={repository.owner.avatar_url}
          alt={`${repository.owner.login} avatar`}
          width={40}
          height={40}
          className="rounded-full"
        />
        <CardTitle className="text-base truncate">{repository.full_name}</CardTitle>
      </CardHeader>
    </Card>
  </a>
  ```
- `next/image` を使う（`next.config.ts` の remotePatterns に依存）

### 5. `src/app/page.tsx`（全面置換）
- `async` Server Component
- `fetchRepositories()` を呼んでカードグリッドを描画
- レイアウト：`<main>` に `Header` + `<section className="container mx-auto px-4 py-8">`
- グリッド：`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- 空配列時：`<p className="text-muted-foreground">リポジトリが見つかりませんでした</p>`
- デフォルトテンプレート（Next.svg, Vercel ロゴ等）は全削除

### 6. `src/app/layout.tsx`
- `metadata.title` を `"github-ai-repo"` に、`description` を適切な一文に更新
- Geist フォント読み込み等はそのまま維持

## 実装順序

1. `bunx --bun shadcn@latest add card`（CLI）
2. `next.config.ts`
3. `src/components/header.tsx`
4. `src/components/repository-card.tsx`
5. `src/app/page.tsx`
6. `src/app/layout.tsx`

## 変更対象ファイル一覧

| 区分 | パス |
|---|---|
| 自動生成 | `src/components/ui/card.tsx`（shadcn CLI） |
| 新規 | `src/components/header.tsx` |
| 新規 | `src/components/repository-card.tsx` |
| 変更 | `next.config.ts` |
| 変更 | `src/app/page.tsx` |
| 変更 | `src/app/layout.tsx` |

## 参照する既存資産

- `src/lib/github.ts` → `fetchRepositories()`
- `src/types/github.ts` → `Repository`
- `src/lib/utils.ts` → `cn()`
- `src/app/globals.css` → `--card`, `--border`, `--muted-foreground` 等のテーマトークン
- `docs/adr/ADR-008-shadcn-ui.md` → shadcn 採用方針

## 検証方法

1. `bun run dev` → `http://localhost:3000` でカード表示を確認
2. ヘッダー「github-ai-repo」が表示されること
3. アバター画像（next/image）が 40×40 rounded で表示されること
4. レスポンシブ（1 / 2 / 3 カラム）がブレークポイントで切り替わること
5. ライト/ダーク両モードで CSS 変数由来の色が正しく反映されること
6. カードクリックで GitHub リポジトリページが新しいタブで開くこと
7. `bun run lint` 通過
8. `bun run build` 成功
9. `bun run check:adr` 通過（新規ADR不要 — ADR-008既存方針の範囲内）

## 注意点

- `next/image` の remotePatterns 設定を忘れるとビルド時ではなくランタイムで失敗するので先に `next.config.ts` を修正
- shadcn CLI が生成するファイルは Biome のフォーマットと競合することが ADR-008 に記載あり。生成直後にそのままコミットし、手修正は最小限に
- `Card` のデフォルトは `flex flex-col gap-6` なので `CardHeader` に `flex-row items-center` を指定して横並びにする
