# リポジトリ検索機能の追加

## Context

現在のリポジトリ一覧ページ（`/`）はGitHub APIの `/repositories` エンドポイントから全リポジトリを表示しているが、検索機能がない。ヘッダーの下に検索欄と検索ボタンを追加し、GitHub Search APIを使ってキーワード検索できるようにする。

## 方針

**サーバーサイド検索（URLのsearchParams利用）** を採用する。
- ページはasync Server Componentのまま維持
- HTMLネイティブの`<form method="get">`で`?q=keyword`をURL に付与
- サーバー側で`searchParams.q`を読み取り、検索APIを呼ぶ
- 検索結果のURLが共有可能、ブラウザの戻るボタンも正常動作

## 実装ステップ

### 1. shadcn/ui コンポーネント追加
```
npx shadcn@latest add input
npx shadcn@latest add button
```
- `src/components/ui/input.tsx` と `src/components/ui/button.tsx` を生成

### 2. 型定義の追加 — `src/types/github.ts`
```typescript
export type SearchRepositoriesResponse = {
  readonly total_count: number;
  readonly items: readonly Repository[];
};
```

### 3. 検索API関数の追加 — `src/lib/github.ts`
```typescript
export async function searchRepositories(query: string): Promise<readonly Repository[]> {
  const data = await githubFetch<SearchRepositoriesResponse>(
    `/search/repositories?q=${encodeURIComponent(query)}`,
  );
  return data.items.map(toRepository);
}
```
- 既存の `githubFetch` と `toRepository` を再利用
- 戻り値は `fetchRepositories` と同じ `readonly Repository[]`

### 4. 検索フォームコンポーネント作成 — `src/components/search-form.tsx`（新規）
- `"use client"` コンポーネント
- `useSearchParams()` で現在のクエリを入力欄に表示
- `<form action="/" method="get">` でGETリクエスト（ネイティブフォーム送信）
- shadcn/ui の `Input` + `Button` を使用

### 5. ページ更新 — `src/app/page.tsx`
- `searchParams`（Next.js 16ではPromise）を受け取り`await`
- `q`があれば `searchRepositories(q)` を呼び、なければ `fetchRepositories()` を呼ぶ
- 空白のみのクエリは検索しない（trimして判定）
- `<Suspense>` で `SearchForm` をラップ（`useSearchParams`が要求するため）

### 6. テスト追加 — `src/__tests__/lib/github.test.ts`
`searchRepositories` のテストを追加：
- 正しいエンドポイント `/search/repositories?q=...` を呼ぶこと
- クエリ文字列がURLエンコードされること
- `items` を `Repository[]` にマッピングすること
- HTTPエラー時に `GitHubHttpError` を投げること

## 変更ファイル一覧

| ファイル | 操作 |
|---------|------|
| `src/components/ui/input.tsx` | 新規（shadcn CLI） |
| `src/components/ui/button.tsx` | 新規（shadcn CLI） |
| `src/types/github.ts` | 修正 |
| `src/lib/github.ts` | 修正 |
| `src/components/search-form.tsx` | 新規 |
| `src/app/page.tsx` | 修正 |
| `src/__tests__/lib/github.test.ts` | 修正 |

## 検証方法

1. `bun run test` — 既存テスト + 新規テストがすべてパスすること
2. `bun run build` — ビルドが成功すること
3. `bun run dev` で起動し、以下を手動確認：
   - ヘッダーの下に検索欄と検索ボタンが表示される
   - キーワードを入力して検索ボタンを押すとURLが `/?q=keyword` になり結果が表示される
   - 空欄で検索すると全リポジトリ一覧に戻る
   - ブラウザの戻るボタンで前の状態に戻れる
