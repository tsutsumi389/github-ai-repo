# リポジトリ一覧の1カラム化と情報量追加

## Context

現在のリポジトリ一覧はアバター+リポジトリ名のみの3カラムグリッド表示で情報量が少ない。1カラムリスト形式に変更し、description・topics・スター数・主要言語・フォーク数を追加表示することで、詳細ページに遷移せずにリポジトリの概要を把握できるようにする。

GitHub Search APIはこれらのフィールドを既に返しているが、TypeScript型定義に含まれていないため実装では破棄されている。型定義とマッパーを拡張すれば追加APIコール不要。

## 変更ファイル

### 1. `src/types/github.ts` — Repository型の拡張

`Repository`型に以下を追加：
- `description: string | null`
- `language: string | null`
- `stargazers_count: number`
- `forks_count: number`
- `topics: readonly string[]`

`RepositoryDetail`型からは`Repository`に移動した`language`, `stargazers_count`, `forks_count`を削除（継承で引き続き利用可能）。

### 2. `src/lib/github.ts` — データマッパー更新

`toRepository()`に新フィールドを追加。APIレスポンスにフィールドがない場合のデフォルト値を設定：
- `description: raw.description ?? null`
- `language: raw.language ?? null`
- `stargazers_count: raw.stargazers_count ?? 0`
- `forks_count: raw.forks_count ?? 0`
- `topics: raw.topics ?? []`

`fetchRepositoryDetail()`から重複フィールドのスプレッドを削除。

### 3. `src/components/ui/badge.tsx` — Badgeコンポーネント追加

`bunx shadcn@latest add badge`でshadcn/uiのBadgeコンポーネントを生成。topicsバッジに使用。

### 4. `src/app/page.tsx` — レイアウト変更

グリッドを1カラムのflexレイアウトに変更：
```
- grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3
+ flex flex-col gap-4
```

### 5. `src/components/repository-card.tsx` — カードデザイン刷新

新レイアウト構成：
1. **ヘッダー行**: アバター(24px) + full_name（font-semibold text-primary）
2. **説明文**: description（text-sm text-muted-foreground line-clamp-2）※nullなら非表示
3. **トピックス**: Badge variant="secondary"で最大6件表示（flex-wrap）※空なら非表示
4. **メタデータ行**: 言語ドット + name, Star + count, GitFork + count（text-xs text-muted-foreground gap-4）

アイコンは既存の`lucide-react`から`Star`, `GitFork`を使用（詳細ページと同じ）。
数値は`.toLocaleString()`で桁区切り表示。

### 6. `src/__tests__/lib/github.test.ts` — テスト更新

- `sampleDefaultSearchResponse`と`sampleSearchResponse`に新フィールドを追加
- マッピング結果のアサーションに新フィールドを含める
- `fetchRepositoryDetail`のアサーションを更新

## 実装順序

```
Step 1: types/github.ts（型定義）
Step 2: lib/github.ts（マッパー）+ badge追加（並列可）
Step 3: page.tsx + repository-card.tsx（UI変更、並列可）
Step 4: テスト更新
```

## 検証

1. `bun run build` — ビルド成功確認
2. `bun run test` — 既存テスト + 更新テストがパス
3. `bun run dev` でブラウザ確認:
   - 1カラムリスト表示になっていること
   - description, topics, スター数, 言語, フォーク数が表示されること
   - topicsが空のリポジトリでレイアウトが崩れないこと
   - ダークモードで正常表示されること
   - 詳細ページが引き続き正常動作すること
