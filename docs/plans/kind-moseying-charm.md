# リポジトリ詳細ページ ヘッダー改善

## Context

リポジトリ詳細ページ (`/repositories/[owner]/[repo]`) のカードヘッダーは、現状 `full_name` をプレーンテキストで見出しに出し、その下に `owner.login` を繰り返している。ユーザーからの要望:

1. **オーナー名とリポジトリ名をリンク化する** — 現在は単なるテキストなのでGitHub本家へ遷移できない。オーナー名はオーナーのGitHubプロフィール、リポジトリ名はリポジトリのGitHubページへリンクさせる。オーナーのURLは規約組み立てではなく、APIの `owner.html_url` を取得して使う。
2. **オーナー名表示の位置に言語を表示する** — ヘッダー直下の行を `language` 表示に置き換える。重複を避けるため、既存 stats グリッドからは Language エントリを削除する。

## 変更対象ファイル

| ファイル | 変更内容 |
|---|---|
| `src/types/github.ts` | `Repository.owner` に `html_url` を追加 |
| `src/lib/github.ts` | `toRepository` で `owner.html_url` をマップ |
| `src/app/repositories/[owner]/[repo]/page.tsx` | ヘッダーJSXの書き換え、stats から Language 削除 |
| `src/__tests__/lib/github.test.ts` | `sampleDetailResponse.owner` と期待値に `html_url` を追加 |

## 実装方針

### 1. 型とマッパーに `owner.html_url` を追加

**`src/types/github.ts`** L6-9:
```ts
readonly owner: {
  readonly login: string;
  readonly avatar_url: string;
  readonly html_url: string;
};
```

**`src/lib/github.ts`** `toRepository` (L50-61) の owner ブロックに `html_url: raw.owner.html_url,` を追加。GitHub API (`/search/repositories` と `/repos/{o}/{r}`) 双方の owner オブジェクトに `html_url` は含まれているため、型追加だけで両経路ともマップされる。

### 2. ヘッダーJSXの書き換え

`src/app/repositories/[owner]/[repo]/page.tsx` L75-91 を次の構造に置き換える:

```tsx
<div className="flex items-center gap-4">
  <Image
    src={detail.owner.avatar_url}
    alt={`${detail.owner.login} avatar`}
    width={56}
    height={56}
    className="rounded-full"
  />
  <div className="min-w-0">
    <h2 className="truncate text-xl font-semibold">
      <a
        href={detail.owner.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {detail.owner.login}
      </a>
      <span className="text-muted-foreground"> / </span>
      <a
        href={detail.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {detail.name}
      </a>
    </h2>
    <p className="truncate text-sm text-muted-foreground">
      {detail.language ?? "—"}
    </p>
  </div>
</div>
```

ポイント:
- 外部リンクなので `next/link` ではなく `<a>`、`target="_blank"` + `rel="noopener noreferrer"`。
- `owner.html_url` を使用 (規約URLの手組みはしない)。
- `language` が null のときは既存 stats と同じく `"—"` フォールバック。

### 3. stats グリッドから Language を削除

L41-67 の stats 配列から `{ key: "language", ..., icon: Code2 }` を削除。未使用になる `Code2` も L1 の import から外す (vitest/lint がエラーを出すため)。残る stats: Stars / Watchers / Forks / Open Issues の4つ — `md:grid-cols-4` グリッドにちょうど4つでフィットする (現状5つで歪んでいた配置が揃う副次効果あり)。

### 4. テストの更新

`src/__tests__/lib/github.test.ts`:
- `sampleDetailResponse.owner` (L136-139) に `html_url: "https://github.com/octocat"` を追加。
- L209-223 の期待値 (`expect(detail).toEqual({...})`) の `owner` にも `html_url: "https://github.com/octocat"` を追加。

`repository-card.test` など一覧系テストがあれば同様に owner.html_url を追加する必要があるか要確認 — Grep で `sampleRepositor` / `owner:` を洗い出して全て追随する。

## 確認方法

1. `bun test` (または `npm test`) — `github.test.ts` と関連テストが全て green。
2. `bun run dev` で dev server を起動し、`http://localhost:3000/repositories/vercel/next.js` を開く:
   - ヘッダーに `vercel / next.js` 形式で2つの独立リンクが表示される。
   - `vercel` クリック → 新タブで `https://github.com/vercel` が開く。
   - `next.js` クリック → 新タブで `https://github.com/vercel/next.js` が開く。
   - リポジトリ名の直下に言語 (例: `JavaScript`) が表示される。
   - 下部 stats に Language カードが**存在しない** (Stars/Watchers/Forks/Open Issues のみ)。
3. 言語が null のリポジトリでも `"—"` が表示される。
4. `bun run lint` と型チェックが通る (未使用の `Code2` import を確実に消す)。
5. モバイル幅 (~375px) で `truncate` が効き、リンクがタップ可能。

## リスク・注意点

- `Repository` 型を変更するので、owner.html_url を参照しないがオブジェクトリテラルで owner を構築している既存コード (モック・テスト含む) が型エラーを出す可能性がある。実装時に型エラーを洗い出し、必要な箇所を全て追随する。
- 詳細ページのレンダリングテストは現状ないため、本タスクでは追加しない (ユーザー要望外)。
