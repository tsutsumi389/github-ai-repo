# 言語カラードットの実装

## Context

リポジトリカードの言語インジケーターが全て同じグレー（`bg-foreground/70`）で表示されている。GitHubのように言語ごとに固有の色を表示することで、視覚的に言語を識別しやすくする。

## 変更ファイル

### 1. `src/lib/language-colors.ts` — 言語カラーマッピング（新規）

GitHub Linguistの公式カラーから主要30-40言語分のマッピングを定義：

```ts
const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  // ...
};

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "#8b949e"; // フォールバック: muted gray
}
```

### 2. `src/components/repository-card.tsx` — カラードット適用

```diff
- <span className="bg-foreground/70 inline-block size-3 rounded-full" aria-hidden="true" />
+ <span className="inline-block size-3 rounded-full" style={{ backgroundColor: getLanguageColor(repository.language!) }} aria-hidden="true" />
```

インラインstyleを使用する理由: Tailwindの動的クラス生成は不可。CSS変数やクラスマップより直接的でシンプル。

### 3. `src/app/repositories/[owner]/[repo]/page.tsx` — 詳細ページにもカラードット追加

言語テキストの前にカラードットを追加（一覧と一貫したUI）：

```diff
- 言語: {detail.language ?? "—"}
+ <span className="inline-flex items-center gap-1">
+   {detail.language && <span className="inline-block size-3 rounded-full" style={{ backgroundColor: getLanguageColor(detail.language) }} aria-hidden="true" />}
+   {detail.language ?? "—"}
+ </span>
```

## 対象言語（GitHub Linguist準拠）

Python, TypeScript, JavaScript, Java, C, C++, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, Scala, R, Julia, Dart, Shell, Perl, Lua, Haskell, Elixir, Clojure, HTML, CSS, SCSS, Vue, Svelte, Jupyter Notebook, Objective-C, MATLAB, PowerShell, Zig, Nim, OCaml

## 実装しないこと

- CSS変数やTailwindテーマへの色定義追加（動的な色はインラインstyleが最適）
- ダークモード別の色定義（GitHub Linguistの色はライト/ダーク共通）

## 検証

1. `bun run build` — ビルド成功確認
2. `bun run test` — 既存テストがパス
3. `bun run dev` でブラウザ確認:
   - 各言語に固有の色ドットが表示されること
   - 未定義言語でフォールバック色が表示されること
   - 詳細ページでもカラードットが表示されること
   - ダークモードで視認性に問題がないこと
