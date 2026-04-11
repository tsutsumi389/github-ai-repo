# searchRepositories に topic:ai をデフォルト付与

## Context

`feat/pagenation` ブランチで `fetchRepositories()` は `topic:ai` で絞り込むよう変更されたが、`searchRepositories()` は素のユーザークエリ (`q=react` 等) のみを送っており、AI 関連に絞るサイトのコンセプトから外れている。検索経路でも常に `topic:ai` をデフォルト修飾子として付与し、「AI 関連リポジトリの中からユーザー入力で絞り込む」挙動に統一する。

## 変更方針

検索クエリを組み立てる際、ユーザー入力の末尾に `topic:ai` を常に付与する。GitHub Search 構文では空白区切りで修飾子を並べる (AND) 動作。

### 例
- 入力 `react` → `q=react topic:ai` (URL エンコード後: `react%20topic%3Aai`)
- 入力 `hello world` → `q=hello world topic:ai` → `hello%20world%20topic%3Aai`

## 変更対象ファイル

### 1. `src/lib/github.ts`
- `searchRepositories()` 内のクエリ組み立てを修正
- 既存定数 `DEFAULT_REPOSITORIES_QUERY = "topic:ai"` を再利用
- 組み立て例:
  ```ts
  const combinedQuery = `${query.trim()} ${DEFAULT_REPOSITORIES_QUERY}`;
  const data = await githubFetch<SearchRepositoriesResponse>(
    `/search/repositories?q=${encodeURIComponent(combinedQuery)}&page=${page}&per_page=${REPOSITORIES_PER_PAGE}`,
    { revalidate: false },
  );
  ```
- 既存の空文字ガード (`if (!query.trim())`) は維持

### 2. `src/__tests__/lib/github.test.ts`
`searchRepositories` describe 内の URL 期待値を更新:

- L304-L311 「/search/repositories エンドポイントを叩く (page=1)」
  - 期待値: `...?q=react%20topic%3Aai&page=1&per_page=30`
- L313-L320 「クエリ文字列を URL エンコードする」
  - 期待値: `...?q=hello%20world%20topic%3Aai&page=1&per_page=30`
- L322-L329 「page 引数に応じて page クエリを切り替える」
  - 期待値: `...?q=react%20topic%3Aai&page=4&per_page=30`
- 「空文字クエリは API を呼ばない」テストはそのまま (ガードで早期 return するため)
- 新規テスト追加 (任意): 「デフォルトで topic:ai が付与される」旨を明示するテスト

## 再利用する既存実装

- `DEFAULT_REPOSITORIES_QUERY` 定数 (src/lib/github.ts:10) — `fetchRepositories` と共有
- `toPaginatedRepositories()` ヘルパー (src/lib/github.ts:63) — そのまま利用
- `REPOSITORIES_PER_PAGE` (src/types/github.ts)

## 検証方法

1. `bun run test src/__tests__/lib/github.test.ts` — 単体テスト通過
2. `bun run test` — 全テストがリグレッションしないこと
3. 手動確認: `bun run dev` → `/?q=react` にアクセスし、結果が AI 関連の React リポジトリに絞られていることを確認 (素の `facebook/react` ではなく AI 関連プロジェクトが上位に来る)
4. ネットワークタブで `/search/repositories?q=react%20topic%3Aai...` になっていることを確認

## 非対象 (スコープ外)

- `fetchRepositories()` 側 (既に `topic:ai` を使っているため変更不要)
- ソート順 (`sort=stars&order=desc`) を `searchRepositories` にも付けるかは別課題。今回は付けない (GitHub Search のデフォルト = best match を維持)
