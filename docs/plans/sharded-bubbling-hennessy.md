# GitHub リポジトリ一覧ページ

## Context

現在のpage.tsxはNext.jsデフォルトテンプレート。これを置き換えて、GitHubリポジトリをカード形式で一覧表示する画面を作成する。将来的に検索機能を追加予定だが、初期版は条件なしで取得する。

## 実装方針

- Server Componentでデータ取得（クライアントJSなし）
- GitHub REST API `https://api.github.com/repositories` で公開リポジトリを取得
- 環境変数 `GITHUB_TOKEN` でオプションの認証対応（レートリミット対策）
- カードはオーナーアバター + リポジトリ名のみ（最小限）

## ファイル変更一覧

### 新規作成
1. **`src/types/github.ts`** - GitHub APIレスポンスの型定義
2. **`src/lib/github.ts`** - リポジトリ取得関数
3. **`src/components/header.tsx`** - ヘッダーコンポーネント（タイトル "github-ai-repo"）
4. **`src/components/repository-card.tsx`** - カードコンポーネント（アバター + リポジトリ名）

### 変更
5. **`src/app/page.tsx`** - デフォルトテンプレートを置き換え（Header + カードグリッド）
6. **`src/app/layout.tsx`** - metadata更新（title: "github-ai-repo"）
7. **`next.config.ts`** - `images.remotePatterns` に `avatars.githubusercontent.com` 追加

## 実装詳細

### 1. 型定義 (`src/types/github.ts`)
```typescript
export type Repository = {
  readonly id: number
  readonly name: string
  readonly full_name: string
  readonly html_url: string
  readonly owner: {
    readonly login: string
    readonly avatar_url: string
  }
}
```

### 2. データ取得 (`src/lib/github.ts`)
- `GET https://api.github.com/repositories` (公開リポジトリ一覧、条件なし)
- `GITHUB_TOKEN` があれば Authorization ヘッダー付与
- `Accept: application/vnd.github.v3+json`
- エラー時は throw でNext.jsエラーバウンダリに委譲

### 3. ヘッダー (`src/components/header.tsx`)
- `<header>` + `<h1>github-ai-repo</h1>`
- 下部ボーダー付き、背景白/ダーク対応

### 4. カード (`src/components/repository-card.tsx`)
- Props: `Repository`
- `next/image` でアバター表示（40x40, rounded-full）
- リポジトリ名をテキスト表示
- `<a>` で `html_url` にリンク
- ホバー時にシャドウ変化

### 5. ページ (`src/app/page.tsx`)
- async Server Component
- Header + responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- 空の場合のメッセージ表示

### 6. next.config.ts
```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "avatars.githubusercontent.com" }
  ]
}
```

## 実装順序
1. `src/types/github.ts`
2. `src/lib/github.ts`
3. `next.config.ts`
4. `src/components/header.tsx`
5. `src/components/repository-card.tsx`
6. `src/app/page.tsx`
7. `src/app/layout.tsx`

## 検証方法
1. `bun run dev` で開発サーバー起動
2. ブラウザで `http://localhost:3000` を確認
3. カードにアバターとリポジトリ名が表示されることを確認
4. レスポンシブ（1〜3列）を確認
5. `bun run lint` でリント通過
6. `bun run build` でビルド成功
