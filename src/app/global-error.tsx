"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col items-center justify-center">
        <title>重大なエラーが発生しました</title>
        <div className="max-w-md mx-auto text-center space-y-4 px-4">
          <h1 className="text-2xl font-semibold">重大なエラーが発生しました</h1>
          <p className="text-muted-foreground">
            アプリケーションで予期しないエラーが発生しました。もう一度お試しください。
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              もう一度試す
            </button>
            <a
              href="/"
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              ホームに戻る
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
