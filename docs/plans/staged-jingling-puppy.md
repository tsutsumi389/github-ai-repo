# スケルトンローディングの適用

## Context

現在、ページ遷移やデータ取得中にローディング表示がなく、ユーザーは画面が固まったように感じる。Next.js App Routerの `loading.tsx` を活用し、スケルトンローディングを導入してUXを改善する。

## 対象ページ

1. **ホームページ** (`src/app/page.tsx`) — リポジトリ一覧
2. **リポジトリ詳細ページ** (`src/app/repositories/[owner]/[repo]/page.tsx`)

## 実装方針

### Step 1: Skeleton UIコンポーネントの追加

shadcnの `Skeleton` コンポーネントを追加する。

```bash
bunx shadcn@latest add skeleton
```

これにより `src/components/ui/skeleton.tsx` が生成される。

### Step 2: ホームページ用スケルトンの作成

**ファイル:** `src/app/loading.tsx`

`RepositoryCard` のレイアウトを模したスケルトンカードを表示する。

- アバター（丸いスケルトン 24x24）
- リポジトリ名（横長のスケルトン）
- 説明文（2行分のスケルトン）
- トピックバッジ（小さなスケルトン x3）
- Star/Fork数（小さなスケルトン x2）

検索フォームは `Suspense` で既にラップ済みなので、そのまま維持。カード部分を6件分のスケルトンとして表示する。

### Step 3: リポジトリ詳細ページ用スケルトンの作成

**ファイル:** `src/app/repositories/[owner]/[repo]/loading.tsx`

`RepositoryDetailPage` のレイアウトを模したスケルトンを表示する。

- ヘッダー部分：アバター（56x56丸）+ リポジトリ名 + 言語表示
- Stats（Star/Watcher/Fork/Issue）：2x4グリッドのスケルトン
- 最新リリース：1つのスケルトンブロック

### 再利用するもの

- `Header` コンポーネント — loading中もヘッダーは表示
- `Card`, `CardHeader`, `CardContent` — 既存のCardコンポーネントでスケルトンを包む
- `cn()` — `src/lib/utils.ts`

## 対象ファイル

| 操作 | ファイル |
|------|----------|
| 生成 | `src/components/ui/skeleton.tsx` (shadcn CLI) |
| 新規 | `src/app/loading.tsx` |
| 新規 | `src/app/repositories/[owner]/[repo]/loading.tsx` |

既存ファイルの変更は不要。

## 検証方法

1. `bun run dev` で開発サーバーを起動
2. ホームページにアクセス → リロード時にスケルトンが表示されることを確認
3. リポジトリ詳細ページに遷移 → スケルトンが表示されることを確認
4. `bun run build` でビルドが通ることを確認
