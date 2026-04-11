---
id: ADR-009
title: リポジトリ一覧のページネーション戦略
status: Accepted
date: 2026-04-11
superseded_by:
supersedes:
---

## コンテキスト

リポジトリ一覧 (`src/app/page.tsx`) は、デフォルト時に `/repositories`、検索時に `/search/repositories` を呼び出し、取得した結果をすべて1ページに表示していた。ユーザーから一覧にページネーションを追加する要望があったが、GitHub REST API の `/repositories` は `since` カーソル方式であり、ページ番号 UI とは相性が悪い。

以下の選択肢を検討した。

- 案A: `/repositories` を `since` カーソル方式のまま、「次へ」のみのカーソル型ページネーションにする
- 案B: デフォルト一覧も `/search/repositories` に統一し、`page` / `per_page` ベースの番号付きページネーションにする
- 案C: サーバー側でキャッシュを持ち、独自のページング層を実装する

## 決定

**案B を採用する。**

- デフォルト一覧は `/search/repositories?q=topic:ai&sort=stars&order=desc` を使い、「AI 系トピックでスター数が多いリポジトリ」を表示する
- `fetchRepositories(page)` / `searchRepositories(query, page)` は共に `{ items, totalCount }` を返す
- URL クエリ `?q=...&page=N` でページ状態を駆動する（既存の Server Component + GET フォーム方式に整合）
- `per_page` は 30（GitHub Search API の既定値）に固定する
- GitHub Search API の最大取得件数（1000 件）制約から、`totalPages = min(ceil(total_count / 30), 34)` にクランプする
- UI コンポーネントは shadcn/ui 公式の `Pagination` プリミティブ（ADR-008）を利用し、URL 組み立てロジックは自前ラッパー `src/components/repository-pagination.tsx` に閉じ込める

## 理由

- **ユーザー体験の一貫性**: デフォルト一覧と検索結果で同じページング UI を提供できる。カーソル型だと前へ戻れない／現在位置が分からないなどの UX 上の欠点がある（案A の不採用理由）
- **実装コストと保守性**: GitHub API 側に pagination を任せられるため、独自のキャッシュ層は不要。案C はキャッシュ無効化やレート制限回避の複雑性を抱え込む
- **既存構成との整合**: Next.js App Router の Server Component + URL クエリ駆動という既存パターンをそのまま活かせる
- **AI トピック中心のサービス特性**: このプロジェクトは AI 系リポジトリの発見を主目的としており、デフォルトで `topic:ai` をスター数降順で見せることはドメイン要件にも合致する

## 結果

- `fetchRepositories` / `searchRepositories` の戻り値が `Promise<PaginatedRepositories>` になり、既存呼び出し元の置き換えが必要となる
- GitHub Search API のレート制限（未認証 10 req/min、認証済み 30 req/min）を受けることになる。ISR の revalidate により多少緩和される
- 一覧から辿れる件数は最大 1000 件（34 ページ）に制限される。それ以上を取得したい場合は今後別途検討する
- `src/components/ui/pagination.tsx` は shadcn/ui 公式の生成物であり、ADR-008 の方針通りコードオーナーシップを自プロジェクトに置く
- `per_page` のユーザー切替、および `/repositories` の `since` カーソル対応は当面スコープ外とする
