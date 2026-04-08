import { Header } from "@/components/header";
import { RepositoryCard } from "@/components/repository-card";
import { fetchRepositories } from "@/lib/github";

export default async function Home() {
  const repositories = await fetchRepositories();

  return (
    <main>
      <Header />
      <section className="container mx-auto px-4 py-8">
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
      </section>
    </main>
  );
}
