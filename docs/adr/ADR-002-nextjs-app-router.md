---
id: ADR-002
title: Next.js 16 (App Router) の採用
status: Accepted
date: 2026-04-05
superseded_by:
supersedes:
---

## コンテキスト

本プロジェクトのフレームワーク選定にあたり、Next.js (App Router / Pages Router)、Remix、Vite + React (SPA)、Astro などが候補となった。

## 決定

Next.js 16 の App Router を採用する。

## 理由

プロジェクト要件として Next.js App Router の使用が指定されている。加えて、以下の技術的利点から要件に適合すると判断した。

- **RSC（React Server Components）**: コンポーネントをサーバー側で実行してHTMLを生成するため、クライアントへのJSバンドルが削減され表示が速い。サーバーから直接DB・APIにアクセスできる
- **ファイルベースルーティング**: ディレクトリ構造がそのままURLに対応するため、ルーティング設定を手書きする必要がない
- **レイアウトのネスト**: `layout.tsx` による階層的なレイアウト管理が可能

Pages Router ではなく App Router を選択した理由は、RSC対応とNext.js公式が App Router を推奨している点による。

## 結果

- App Router 固有の概念（Server Components / Client Components の境界、`"use client"` ディレクティブ等）の理解が必要になる
- デプロイ先として Vercel との親和性が高いが、他のプラットフォームでは一部機能に制約が生じる可能性がある
