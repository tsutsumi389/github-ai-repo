import { Header } from "@/components/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <main
        className="container mx-auto px-4 py-8"
        aria-busy="true"
        aria-label="リポジトリ詳細を読み込み中"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="size-14 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="mt-2 h-4 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {(["stars", "watchers", "forks", "issues"] as const).map(
                (key) => (
                  <div
                    key={key}
                    className="flex items-start gap-2 rounded-lg border border-border/50 p-3"
                  >
                    <Skeleton className="mt-0.5 size-4" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="mt-1 h-5 w-16" />
                    </div>
                  </div>
                ),
              )}
            </div>
            <div className="mt-6 rounded-lg border border-border/50 p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="mt-0.5 size-5" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-4 w-40" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
