import { Suspense } from "react";
import { Header } from "@/components/header";
import { RepositoryCard } from "@/components/repository-card";
import { RepositoryPagination } from "@/components/repository-pagination";
import { SearchForm } from "@/components/search-form";
import { fetchRepositories, searchRepositories } from "@/lib/github";
import {
  GITHUB_SEARCH_MAX_RESULTS,
  REPOSITORIES_PER_PAGE,
} from "@/types/github";

const MAX_PAGE = Math.floor(GITHUB_SEARCH_MAX_RESULTS / REPOSITORIES_PER_PAGE);

function parsePage(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return Math.min(parsed, MAX_PAGE);
}

function computeTotalPages(totalCount: number): number {
  const cappedTotal = Math.min(totalCount, GITHUB_SEARCH_MAX_RESULTS);
  return Math.max(1, Math.ceil(cappedTotal / REPOSITORIES_PER_PAGE));
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const { items, totalCount } = q
    ? await searchRepositories(q, page)
    : await fetchRepositories(page);

  const totalPages = computeTotalPages(totalCount);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Suspense>
            <SearchForm />
          </Suspense>
        </div>
        {items.length === 0 ? (
          <p className="text-muted-foreground">
            リポジトリが見つかりませんでした
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {items.map((repository) => (
                <RepositoryCard key={repository.id} repository={repository} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8">
                <RepositoryPagination
                  currentPage={page}
                  totalPages={totalPages}
                  query={q}
                />
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
