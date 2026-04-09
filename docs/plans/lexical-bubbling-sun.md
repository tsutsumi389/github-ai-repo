# リポジトリ詳細ページの追加

## Context

現在のトップページ (`src/app/page.tsx`) は GitHub 公開リポジトリ一覧を表示し、各カードをクリックすると外部 GitHub サイト (`repository.html_url`) に新規タブで遷移する。

ユーザーの要望はアプリ内で完結する詳細ページを用意すること:

- リポジトリカードのクリック → 別ページ（アプリ内ルート）の詳細画面に遷移
- 詳細画面にはリポジトリ名 / オーナーアイコン / 言語 / Star / Watcher / Fork / Issue 数を表示
- ヘッダーのタイトル "github-ai-repo" をクリックするとトップページに戻る

既存の `fetchRepositories()` は一覧用のエンドポイント (`/repositories`) を使っており、個別のカウント系フィールドは返ってこない。詳細ページでは `GET /repos/{owner}/{repo}` を新規に呼び出す必要がある。

Next.js は 16.2.2（App Router / Server Component 前提、`AGENTS.md` に「通常の Next.js と違うので API を確認せよ」と警告あり）。shadcn/ui（radix-nova プリセット）と Biome を採用済み。

## 変更方針

アプリ内ルート `/repositories/[owner]/[repo]` を動的ルートとして追加し、Server Component で単一リポジトリを取得して表示する。カードとヘッダーには `next/link` を導入する。

### 1. 型定義の拡張 — `src/types/github.ts`

既存 `Repository` はそのまま残し、詳細画面用の型を追加:

```ts
export type RepositoryDetail = Repository & {
  readonly language: string | null;
  readonly stargazers_count: number;
  readonly watchers_count: number;
  readonly forks_count: number;
  readonly open_issues_count: number;
};
```

`language` は null の可能性があることを型で表現する（GitHub API の仕様）。

### 2. 単一リポジトリ取得関数 — `src/lib/github.ts`

`fetchRepositories()` と同じ規約（ヘッダー、`GITHUB_TOKEN` 任意、`next.revalidate: 300`、エラー時 throw）で `fetchRepositoryDetail(owner: string, repo: string)` を追加する。

- エンドポイント: `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
- 戻り値: `RepositoryDetail`
- 404 の場合も既存と同じく `throw new Error(...)` とし、ページ側で `notFound()` に変換する
- 必要フィールド (`id`, `name`, `full_name`, `html_url`, `owner.{login,avatar_url}`, `language`, `stargazers_count`, `watchers_count`, `forks_count`, `open_issues_count`) のみマップし、余計なフィールドは落とす

### 3. 詳細ページ — `src/app/repositories/[owner]/[repo]/page.tsx`（新規）

- App Router の動的セグメント `[owner]/[repo]` を使う
- Next.js 15/16 では `params` が Promise になったため `async function Page({ params }: { params: Promise<{ owner: string; repo: string }> })` とし `await params` で受ける（`node_modules/next/dist/docs/` で最終確認する）
- `fetchRepositoryDetail` を呼び、エラーは `try/catch` で拾って `notFound()` を呼ぶ
- レイアウト構成:
  - `<Header />`（ヘッダーはそのまま流用）
  - `<main className="container mx-auto px-4 py-8">` の中に shadcn `Card` を 1 枚
  - カード内に `next/image` でオーナーアバター（56×56）+ `full_name` (見出し) + `owner.login`
  - 統計は `grid grid-cols-2 md:grid-cols-4 gap-4` で 5 項目（Language, Stars, Watchers, Forks, Open Issues）を表示
  - `language` が null の場合は `—` 等のプレースホルダを表示
  - lucide-react の `Star` / `Eye` / `GitFork` / `CircleDot` / `Code2` アイコンを使用（shadcn 前提で導入済み）
- `export const metadata` あるいは `generateMetadata` で `<title>` を `${full_name} | github-ai-repo` にする

### 4. カードをアプリ内リンクに変更 — `src/components/repository-card.tsx`

- 外部 `<a href={html_url} target="_blank">` を `import Link from "next/link"` + `<Link href={\`/repositories/${repository.owner.login}/${repository.name}\`}>` に置き換える
- `target="_blank"` / `rel` は削除
- 既存の見た目（`Card` + hover shadow + アバター + `full_name`）は維持
- `owner.login` / `name` は GitHub の命名規則上そのまま URL パスに使えるが、念のため `encodeURIComponent` を通しても良い（Server 側の動的ルートは自動でデコードされる）

### 5. ヘッダータイトルをトップページリンクに — `src/components/header.tsx`

`<h1>` を `next/link` の `<Link href="/">` でラップする。`<h1>` はランドマークのため残し、リンクは h1 の内側に置く:

```tsx
<h1 className="text-xl font-semibold">
  <Link href="/" className="hover:underline">github-ai-repo</Link>
</h1>
```

これでトップページ以外（詳細ページ）からもヘッダークリックで `/` に戻れる。

### 6. テスト — `src/__tests__/lib/github.test.ts`

既存ファイルに `describe("fetchRepositoryDetail", ...)` を追記。既存 `fetchRepositories` のモックパターン（`vi.stubGlobal("fetch", ...)` / `Response` を返す）を踏襲し、以下を検証:

- `https://api.github.com/repos/{owner}/{repo}` を叩く
- `Accept` ヘッダーが `application/vnd.github.v3+json`
- `GITHUB_TOKEN` 有無で `Authorization` ヘッダーの付与が切り替わる
- レスポンスを `RepositoryDetail` にマップ（`language`, `stargazers_count` 等を含む）
- `language: null` をそのまま返す
- HTTP エラー時に例外を投げる

コンポーネントテスト（`repository-card` の遷移先 URL、`header` のリンク先）は optional だが、リンク先検証程度の軽いテストを追加しておくと回帰を防げる。

## 変更対象ファイル一覧

- `src/types/github.ts` — `RepositoryDetail` 型追加
- `src/lib/github.ts` — `fetchRepositoryDetail` 追加
- `src/app/repositories/[owner]/[repo]/page.tsx` — 新規作成
- `src/components/repository-card.tsx` — アプリ内リンクに変更
- `src/components/header.tsx` — タイトルを `Link` 化
- `src/__tests__/lib/github.test.ts` — `fetchRepositoryDetail` のテスト追加

`next.config.ts` の `remotePatterns` は `avatars.githubusercontent.com` を既に許可済みのため変更不要。

## 再利用する既存コード

- `src/lib/github.ts` の `fetchRepositories` のパターン（ヘッダー組み立て、`revalidate`、エラー形式）をそのまま踏襲する
- `src/components/ui/card.tsx` の shadcn `Card` をそのまま使用
- `src/components/header.tsx` を一覧・詳細双方で流用
- `src/__tests__/lib/github.test.ts` のモック/アサーションパターンを踏襲

## 動作確認

1. `bun run lint` — Biome エラーがないこと
2. `bun run test` — `fetchRepositoryDetail` の単体テストが通ること
3. `bun run build` — Next.js 16 の動的ルートがビルドできること
4. `bun run dev` で開発サーバー起動後:
   - トップページのカードをクリック → `/repositories/{owner}/{name}` に遷移
   - 詳細ページに full_name / オーナーアバター / 言語 / Star / Watcher / Fork / Issue 数が表示される
   - ヘッダーの "github-ai-repo" をクリック → `/` に戻る
   - 存在しないリポジトリ（例: `/repositories/aaaa/bbbb-not-exist`）で `notFound()` が効く
5. `bun run check:adr` — ADR に矛盾がないこと（本タスクは新規 ADR 不要の範囲）
