---
id: ADR-004
title: Tailwind CSS v4 の採用
status: Accepted
date: 2026-04-05
superseded_by:
supersedes:
---

## コンテキスト

スタイリング手法として、Tailwind CSS、CSS Modules、CSS-in-JS（styled-components / Emotion）、Vanilla Extract が候補となった。

## 決定

Tailwind CSS v4 を採用する。

## 理由

プロジェクトのスキャフォールド時に Tailwind CSS が選択肢として提供されており、採用した。加えて、以下の技術的利点がある。

- **ユーティリティファースト**: クラスの組み合わせでスタイリングが完結し、開発効率が高い
- **RSCとの互換性**: ゼロランタイムであるため、App Router の Server Components と相性がよい。CSS-in-JS はランタイムJSが必要なため RSC 環境には不向き

## 結果

- HTMLにユーティリティクラスが多数付与されるため、マークアップが冗長になる傾向がある
- Tailwind 独自のクラス名体系の学習が必要
