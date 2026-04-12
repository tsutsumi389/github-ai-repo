import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function RepositoryCardSkeleton() {
  return (
    <Card>
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-18 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </Card>
  );
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f"] as const;

export default function Loading() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8" aria-busy="true">
        <div className="mb-6">
          <Skeleton className="h-10 w-full" />
        </div>
        <output
          className="flex flex-col gap-4"
          aria-label="リポジトリを読み込み中"
        >
          {SKELETON_KEYS.map((key) => (
            <RepositoryCardSkeleton key={key} />
          ))}
        </output>
      </main>
    </>
  );
}
