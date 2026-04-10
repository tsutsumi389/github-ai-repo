import { Suspense } from "react";
import { Header } from "@/components/header";
import { RepositoryCard } from "@/components/repository-card";
import { SearchForm } from "@/components/search-form";
import { fetchRepositories, searchRepositories } from "@/lib/github";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const repositories = q
    ? await searchRepositories(q)
    : await fetchRepositories();

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Suspense>
            <SearchForm />
          </Suspense>
        </div>
        {repositories.length === 0 ? (
          <p className="text-muted-foreground">
            リポジトリが見つかりませんでした
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repository) => (
              <RepositoryCard key={repository.id} repository={repository} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
