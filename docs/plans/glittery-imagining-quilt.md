# リポジトリ詳細ページの改善

## Context
リポジトリ詳細ページのStar/Fork/Watcher/Issue数がカンマ区切りされていない（一覧ページでは対応済み）。また、最新リリース情報を表示したい。

## 変更内容

### 1. `Release` 型追加 — `src/types/github.ts`
```typescript
export type Release = {
  readonly tag_name: string;
  readonly name: string | null;
  readonly published_at: string;
  readonly html_url: string;
  readonly prerelease: boolean;
};
```

### 2. テスト追加（TDD: RED） — `src/__tests__/lib/github.test.ts`
`fetchLatestRelease` の describe ブロックを追加:
- URL構築の検証（`/repos/{owner}/{repo}/releases/latest`）
- owner/repo の URLエンコード検証
- レスポンス → Release 型へのマッピング検証
- 404 → `null` を返す（リリースなしのリポジトリ）
- 5xx → `GitHubHttpError` を投げる

### 3. `fetchLatestRelease` 実装（TDD: GREEN） — `src/lib/github.ts`
- `toRelease()` 変換関数（`toRepository` パターン踏襲）
- `fetchLatestRelease(owner, repo): Promise<Release | null>`
- 404 → `null` 返却、それ以外のエラーは再throw

### 4. 詳細ページ更新 — `src/app/repositories/[owner]/[repo]/page.tsx`

**カンマ区切り:**
- `stat.value` → `stat.value.toLocaleString("en-US")`

**リリース情報表示:**
- `fetchLatestRelease` を `Promise.all` で detail と並列取得
- stats グリッドの下に最新リリースセクションを条件表示（`release && ...`）
- 表示: リリース名（name ?? tag_name）、タグ名、公開日（ja-JP）、GitHubへのリンク
- lucide-react の `Tag` アイコン使用
- リリースがないリポジトリでは非表示

## 検証
1. `bun test src/__tests__/lib/github.test.ts` — テスト通過
2. `bun dev` で詳細ページを確認
   - 数値がカンマ区切りで表示される
   - リリースありのリポジトリ: リリース情報が表示される
   - リリースなしのリポジトリ: リリースセクションが非表示
