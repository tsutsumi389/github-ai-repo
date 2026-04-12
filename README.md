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
| デザイントークン | GitHub Primer カラーパレット | - |

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
