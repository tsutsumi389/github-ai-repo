# リポジトリ一覧にページネーションを追加

## Context

現在、`src/app/page.tsx` はデフォルト時に `/repositories`、検索時に `/search/repositories` を呼び出し、取得結果をすべて1ページに表示している。ユーザーから「一覧にページネーションを追加してほしい」と依頼があった。

GitHub API の仕様上、`/repositories` は `since` カーソル方式でページ番号UIと相性が悪い。ユーザー確認の結果、**デフォルト一覧も検索APIに統一し、page/per_page ベースの番号付きページネーションを実装する**方針で決定した。さらに、デフォルト一覧は **AI系トピック (`topic:ai`) のスター数上位リポジトリ** を表示するよう変更する。per_page は 30 件（API既定値）に合わせる。

## 方針サマリ

- デフォルト一覧を `/search/repositories?q=topic:ai&sort=stars&order=desc` に切り替え、「AI系トピックでスター数が多いリポジトリ」を表示する。
- `searchRepositories` / `fetchRepositories` の両方で `page` を受け取り、`{ items, totalCount }` を返すよう戻り値を変更する。
- URL クエリ `?q=...&page=N` で状態を駆動（既存の Server Component + GET フォーム方式を踏襲）。
- shadcn/ui 公式の `Pagination` コンポーネントを `bunx shadcn@latest add pagination` で導入し、`src/components/ui/pagination.tsx` に追加する。その上で、自前のラッパー Server Component `src/components/repository-pagination.tsx` を作り、URLクエリ (`q`, `page`) の組み立てを担わせる。
- GitHub Search API は最大1000件（= 34ページ@30件）までしか返さないため、`totalPages` を `min(ceil(total_count / 30), 34)` にクランプする。

## 変更対象ファイル

### 1. `src/lib/github.ts`（変更）

- `fetchRepositories(page: number = 1)` を作り直す
  - パス: `/search/repositories?q=${encodeURIComponent("topic:ai")}&sort=stars&order=desc&page=${page}&per_page=30`
  - `topic:ai` は定数 `DEFAULT_REPOSITORIES_QUERY` として `src/lib/github.ts` 冒頭に切り出す（将来差し替えやすくする）
  - 戻り値: `Promise<{ items: readonly Repository[]; totalCount: number }>`
  - `SearchRepositoriesResponse` から `total_count` と `items` を取り出して返す
- `searchRepositories(query: string, page: number = 1)` を更新
  - パス: `/search/repositories?q=${encodeURIComponent(query)}&page=${page}&per_page=30`
  - 戻り値: 同上 `Promise<{ items: readonly Repository[]; totalCount: number }>`
  - 空クエリのときは `{ items: [], totalCount: 0 }` を返す
- 既存の `toRepository` / `githubFetch` / `GitHubHttpError` / `fetchRepositoryDetail` は変更しない

### 2. `src/types/github.ts`（変更）

- 新規型を追加:
  ```ts
  export type PaginatedRepositories = {
    items: readonly Repository[];
    totalCount: number;
  };
  export const REPOSITORIES_PER_PAGE = 30;
  export const GITHUB_SEARCH_MAX_RESULTS = 1000;
  ```
- 既存の `SearchRepositoriesResponse` は API レスポンス型として残す

### 3. `src/app/page.tsx`（変更）

- `searchParams` 型を `Promise<{ q?: string; page?: string }>` に拡張
- `page` を `Number.parseInt` でパースし、`NaN` や `< 1` は `1` にフォールバック
- 取得:
  ```ts
  const { items, totalCount } = q
    ? await searchRepositories(q, page)
    : await fetchRepositories(page);
  ```
- `totalPages` を算出（上限34）し、空でなければリスト下に `<RepositoryPagination currentPage={page} totalPages={totalPages} query={q} />` を描画

### 4. `src/components/ui/pagination.tsx`（新規・shadcn CLIで追加）

- 導入コマンド: `bunx shadcn@latest add pagination`
- shadcn 公式の Pagination プリミティブ（`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`）が追加される
- ファイルは編集せず、生成されたままを使う（shadcn のコードオーナーシップ原則）
- 依存: `lucide-react`（既存）

### 5. `src/components/repository-pagination.tsx`（新規・自前ラッパー）

URL 組み立てロジックを閉じ込める Server Component。shadcn プリミティブを組み合わせる。

- Props: `{ currentPage: number; totalPages: number; query?: string }`
- `buildHref(page: number)`: `q` の有無で `?page=N` または `?q=...&page=N` を生成（`URLSearchParams` を使用）
- 構成:
  - `<Pagination>` 直下に `<PaginationContent>`
  - `<PaginationPrevious href={buildHref(currentPage - 1)}>` — `currentPage === 1` のとき `aria-disabled` + `tabIndex={-1}` + `pointer-events-none` クラスで無効化
  - ページ番号リスト: 現在ページ前後2ページ + 先頭/末尾を表示し、省略箇所に `<PaginationEllipsis>` を入れる。すべて `<PaginationLink href={buildHref(n)} isActive={n === currentPage}>` で描画
  - `<PaginationNext href={buildHref(currentPage + 1)}>` — 同様に最終ページで無効化
- `next/link` との統合: shadcn の `PaginationLink` は `<a>` を生成するため、`asChild` パターンで `Link` を差し込めるよう、shadcn が生成した `pagination.tsx` の `PaginationLink` はそのまま使い、`href` を渡すだけで SPA 遷移は `next/link` に置き換える必要があれば別途ラップ（Next.js 16 の App Router では生 `<a>` でも遷移はフル動作する）
- アクセシビリティは shadcn のプリミティブが `<nav role="navigation" aria-label="pagination">` を持つため踏襲

### 6. `src/components/search-form.tsx`（変更不要 / 軽微）

- GET フォームなので送信時に自動的に `page` パラメータは消える（検索し直すとページ1にリセット）→ 追加対応は不要
- ただし念のため `useSearchParams` で `page` は拾わないまま

### 7. `src/__tests__/lib/github.test.ts`（変更）

- `fetchRepositories` のテストを全面更新:
  - URL が `/search/repositories?q=topic%3Aai&sort=stars&order=desc&page=1&per_page=30` であること
  - `page` 引数で URL が切り替わること
  - 戻り値が `{ items, totalCount }` 形式になっていること
  - HTTP エラー時の挙動
- `searchRepositories` のテストを更新:
  - URL に `page=${n}&per_page=30` が含まれること
  - `totalCount` が返されること
  - 空クエリで `{ items: [], totalCount: 0 }`
- 既存の `SearchRepositoriesResponse` モックは流用可能

### 8. `docs/adr/`（新規 ADR）

`ADR-00X-pagination-strategy.md` を追加（既存 ADR 連番に合わせる）。要点:

- タイトル: 「リポジトリ一覧のページネーション戦略」
- Status: Accepted
- Decision: デフォルト一覧も `/search/repositories` を使用し、`page/per_page` ベースの番号付きページネーションを実装する
- Consequences: GitHub Search API のレート制限（未認証10req/min）と最大1000件制約を受ける
- バリデーションは `bun run check:adr` で確認

## 再利用する既存資産

- `githubFetch<T>()` — 認証ヘッダ・ISR revalidate 済みのベースクライアント（`src/lib/github.ts:19`）
- `SearchRepositoriesResponse` 型 — 既に `total_count` と `items` を持つ（`src/types/github.ts`）
- `Button` コンポーネント（`src/components/ui/button.tsx`） — Pagination のリンクボタンに `asChild` 経由で使用
- `Suspense` + `useSearchParams` の流し方は既存 `SearchForm` のパターンを踏襲

## 検証手順

1. **型チェック & Lint**: `bun run typecheck` / `bun run lint`
2. **単体テスト**: `bun run test src/__tests__/lib/github.test.ts` で API 層が緑
3. **ADR バリデーション**: `bun run check:adr`
4. **ローカル起動**: `bun run dev`
   - `http://localhost:3000/` を開き、AI系トピックのリポジトリが 30 件（スター降順）表示されることを確認
   - 「次へ」クリックで `?page=2` に遷移し、別のリポジトリが表示されることを確認
   - 「前へ」クリックで `?page=1` に戻ることを確認
   - 検索フォームに `react` を入力して送信 → `?q=react&page=1` になり、ページネーションが継続することを確認
   - URL を直接 `?q=react&page=3` に書き換え、該当ページが表示されることを確認
   - 1ページ目で「前へ」ボタンが無効、最終ページで「次へ」ボタンが無効であることを確認
5. **エラーハンドリング**: 存在しないクエリ（例: `?q=zzzzz_no_match`）で空表示メッセージが出ることを確認

## スコープ外（今回やらないこと）

- per_page のユーザー切替（30 固定）
- `/repositories` の `since` カーソル対応（採用しない方針で決定済み）
- E2E テスト（Playwright）の追加 — 単体テストで十分カバー
