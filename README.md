# GitHub AI Repository Explorer

GitHub上のAI関連リポジトリを探索・検索できるWebアプリケーション。
AI関連トピックのリポジトリをスター数順に一覧表示し、キーワード検索やリポジトリ詳細の閲覧が可能。

## 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js (App Router) | 16.2.2 |
| 言語 | TypeScript (strict mode) | 5.x |
| UIコンポーネント | shadcn/ui + Radix UI | - |
| スタイリング | Tailwind CSS | 4.x |
| リンター/フォーマッター | Biome | 2.2.0 |
| テスト | Vitest + Testing Library | 4.x |
| パッケージマネージャー | Bun | - |

## セットアップ

### 前提条件

- [Bun](https://bun.sh/) がインストールされていること
- (任意) GitHub Personal Access Token（APIレート制限緩和のため）

### インストール・起動

```bash
# 依存パッケージのインストール
bun install

# 開発サーバー起動
bun run dev

# http://localhost:3000 でアクセス
```

### 環境変数

```bash
# .env.local に設定（任意）
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

未設定でも動作するが、GitHub APIのレート制限が60リクエスト/時間に制限される（設定時は5,000リクエスト/時間）。

## 設計判断

すべての主要な設計判断は [ADR（Architecture Decision Records）](./docs/adr/) として記録している。各技術の選定理由・比較検討の詳細はADRを参照されたい。

## 工夫した点・こだわったポイント

### AI関連リポジトリへの特化

AI分野に関心があるので、他との差別化のため「AI関連リポジトリの探索」にテーマを絞った。

### GitHub API 制約への対応

GitHub Search API の制約（最大1,000件）をアプリケーション層で透過的に処理している：

- `GITHUB_SEARCH_MAX_RESULTS` 定数で上限を一元管理
- ページ番号のバリデーションで上限を超えるリクエストを防止
- ISR（300秒）でAPIコール数を削減し、レート制限に余裕を持たせる

### GitHubライクなデザイン

GitHub関連のアプリケーションなので、ユーザーが違和感なく操作できるようにGitHubの見た目に寄せた。shadcn/ui のカラートークンを GitHub Primer のカラーパレットにマッピングし、ダークモードもOSの設定に連動する形で対応している。

### スケルトンUIによるUX向上

Next.js の `loading.tsx` を活用し、データ取得中にスケルトンUIを表示。レイアウトシフトのない滑らかな読み込み体験を提供している。

## AI利用レポート

本プロジェクトの開発には **Claude Code** を使用して実装した。

### デザインの一貫性のためのスキル作成

一貫したデザインで生成させるために、Claude Code のカスタムスキル `ui-ux-design-guide` を作成した。GitHub Primer 風のデザイントークンやガイドラインをスキルとして定義することで、AIがUI関連のコードを生成する際に毎回同じデザイン基準に従うようにした。

### MVP方針での段階的な実装

最初からすべての機能を盛り込むのではなく、MVPとして最小限の機能で動くものを作り、そこから機能追加していく方針で進めた。

### 開発フロー

基本的な流れは以下の通り：

1. **Plan モード**でプランを作成
2. **TDD**でテストを先に書いてから実装 — [everything-claude-code の TDD スキル](https://github.com/affaan-m/everything-claude-code/blob/main/skills/tdd-workflow/SKILL.md)を使用
3. **コードレビューエージェント**でレビュー — [everything-claude-code のコードレビューエージェント](https://github.com/affaan-m/everything-claude-code/blob/main/agents/code-reviewer.md)を使用
4. **`/simplify`** でコードの改善 — Claude Code デフォルトのスキル

### プランファイル（`docs/plans/`）

Claude Code の Plan モードで作成したプランファイルを [`docs/plans/`](./docs/plans/) に残す。どのような順序・粒度で作成したか参考用。

以下は実装の時系列順：

| # | プランファイル | 概要 |
|---|---------------|------|
| 1 | [sharded-bubbling-hennessy.md](./docs/plans/sharded-bubbling-hennessy.md) | リポジトリ一覧ページの初期実装（API連携・カード表示） |
| 2 | [harmonic-popping-sunbeam.md](./docs/plans/harmonic-popping-sunbeam.md) | shadcn/ui 対応への改訂（UIコンポーネント刷新） |
| 3 | [lexical-bubbling-sun.md](./docs/plans/lexical-bubbling-sun.md) | リポジトリ詳細ページの追加（動的ルーティング） |
| 4 | [joyful-twirling-hickey.md](./docs/plans/joyful-twirling-hickey.md) | リポジトリ検索機能の追加（GitHub Search API連携） |
| 5 | [serialized-strolling-sky.md](./docs/plans/serialized-strolling-sky.md) | ページネーション機能の追加 |
| 6 | [glistening-herding-alpaca.md](./docs/plans/glistening-herding-alpaca.md) | 検索クエリに `topic:ai` をデフォルト付与 |
| 7 | [witty-strolling-shell.md](./docs/plans/witty-strolling-shell.md) | GitHub Primer カラーパレットへのデザイントークン移行 |
| 8 | [kind-moseying-charm.md](./docs/plans/kind-moseying-charm.md) | リポジトリ詳細ページのヘッダー改善 |
| 9 | [soft-prancing-badger.md](./docs/plans/soft-prancing-badger.md) | 言語カラードットの実装（GitHub風言語別色表示） |
| 10 | [staged-stirring-twilight.md](./docs/plans/staged-stirring-twilight.md) | リポジトリ一覧の1カラム化と情報量追加 |
| 11 | [glittery-imagining-quilt.md](./docs/plans/glittery-imagining-quilt.md) | 詳細ページの数値カンマ区切り・最新リリース表示 |
| 12 | [staged-jingling-puppy.md](./docs/plans/staged-jingling-puppy.md) | スケルトンローディングの適用 |
| 13 | [peppy-booping-pike.md](./docs/plans/peppy-booping-pike.md) | カスタムエラーページの作成（404・APIエラー対応） |
