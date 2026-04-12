# エラーページ作成プラン

## Context

GitHub APIのレートリミット(429)やその他のエラー発生時に、Next.jsデフォルトの汎用エラー画面が表示され、ユーザーに何の情報も伝わらない。`error.tsx`、`not-found.tsx`、`global-error.tsx` のいずれも存在しないため、カスタムエラーページを新規作成する。

## 作成ファイル

### 1. `src/app/not-found.tsx` (Server Component)

404ページ。`notFound()` 呼び出し時や未マッチURL時に表示。

- **props**: なし
- **UI構成**:
  - `<Header />` コンポーネント（各page.tsxと同じパターン）
  - `<main className="container mx-auto px-4 py-8">` 内に中央寄せカード (`max-w-md mx-auto`)
  - lucide-react `FileQuestion` アイコン (size-12, text-muted-foreground)
  - タイトル: 「ページが見つかりません」
  - 説明: 「お探しのページは存在しないか、移動した可能性があります。」
  - 「ホームに戻る」ボタン (`Link href="/"`, Button variant="outline")
- **使用コンポーネント**: `Header`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `Link`, `cn()`

### 2. `src/app/error.tsx` (Client Component — `"use client"`)

アプリ全体のエラーバウンダリー。レートリミットと一般エラーを区別して表示。

- **props**: `{ error: Error & { digest?: string }, unstable_retry: () => void }` (Next.js 16.2.0 API)
- **エラー判定**: `error.message` に `429` を含むかで判定（開発環境で動作。本番ではServer Componentのエラーメッセージが汎用化されるため一般エラーにフォールバック）
- **レートリミットUI**:
  - lucide-react `Clock` アイコン (text-destructive)
  - タイトル: 「APIリクエスト制限に達しました」
  - 説明: 「GitHub APIのリクエスト回数が上限に達しました。しばらく待ってからもう一度お試しください。」
- **一般エラーUI**:
  - lucide-react `AlertCircle` アイコン (text-destructive)
  - タイトル: 「エラーが発生しました」
  - 説明: 「予期しないエラーが発生しました。もう一度お試しいただくか、ホームに戻ってください。」
- **共通UI**:
  - `<Header />` + `<main>` で既存パターンに合わせる
  - 「もう一度試す」ボタン (`unstable_retry()` 呼び出し)
  - 「ホームに戻る」リンク (`Link href="/"`)
  - `useEffect` で `error` をコンソール出力（デバッグ用）
- **使用コンポーネント**: `Header`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Button`, `Link`, `cn()`

### 3. `src/app/global-error.tsx` (Client Component — `"use client"`)

ルートレイアウト自体が壊れた時の最終防衛線。

- **props**: `{ error: Error & { digest?: string }, unstable_retry: () => void }`
- `<html lang="ja">` と `<body>` タグを含む（必須）
- `globals.css` をインポート（テーマ変数・Tailwind利用のため）
- Geist / Geist_Mono フォントを `layout.tsx` と同じ設定で再現
- React `<title>` コンポーネントでタイトル設定（`metadata` エクスポート不可のため）
- shadcn/ui コンポーネントは使わず、Tailwindユーティリティクラスのみで構成（依存最小化）
- `<a href="/">` で通常のアンカータグを使用（`next/link` は避ける — Routerが壊れている可能性）
- シンプルな中央寄せUI: タイトル「重大なエラーが発生しました」+ リトライボタン + ホームリンク

## 既存コード変更

なし。3ファイルの新規追加のみ。

## 参照ファイル

| ファイル | 参照理由 |
|---------|---------|
| `src/app/layout.tsx` | フォント設定をglobal-errorで再現 |
| `src/components/header.tsx` | error.tsx, not-found.tsxで使用 |
| `src/components/ui/card.tsx` | Card系コンポーネント |
| `src/components/ui/button.tsx` | Buttonコンポーネント |
| `src/lib/utils.ts` | `cn()` ユーティリティ |
| `src/lib/github.ts:18` | エラーメッセージ形式: `"GitHub API request failed: {status} {statusText}"` |

## 検証方法

1. `bun run build` でビルドエラーがないことを確認
2. `bun run dev` で開発サーバー起動
3. 存在しないURL（例: `/nonexistent`）にアクセスして not-found.tsx の表示を確認
4. GitHub APIエラー時に error.tsx が表示されることを確認
5. ダークモード/ライトモードの両方で表示を確認
