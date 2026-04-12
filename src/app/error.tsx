"use client";

import { AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js error.tsx convention requires this name
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isRateLimit =
    error.message.includes("429") ||
    error.message.includes("403") ||
    error.message.toLowerCase().includes("rate limit");

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="items-center text-center">
              {isRateLimit ? (
                <>
                  <Clock className="size-12 text-destructive" />
                  <CardTitle>APIリクエスト制限に達しました</CardTitle>
                  <CardDescription>
                    GitHub
                    APIのリクエスト回数が上限に達しました。しばらく待ってからもう一度お試しください。
                  </CardDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="size-12 text-destructive" />
                  <CardTitle>エラーが発生しました</CardTitle>
                  <CardDescription>
                    予期しないエラーが発生しました。もう一度お試しいただくか、ホームに戻ってください。
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="flex justify-center gap-2">
              <Button onClick={() => unstable_retry()}>もう一度試す</Button>
              <Button variant="outline" asChild>
                <Link href="/">ホームに戻る</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
