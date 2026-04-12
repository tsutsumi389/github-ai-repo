import { CircleDot, Eye, GitFork, Star, Tag } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { LanguageIndicator } from "@/components/language-indicator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  fetchLatestRelease,
  fetchRepositoryDetail,
  GitHubHttpError,
} from "@/lib/github";
import type { RepositoryDetail } from "@/types/github";

type PageProps = {
  params: Promise<{ owner: string; repo: string }>;
};

async function loadDetail(
  owner: string,
  repo: string,
): Promise<RepositoryDetail> {
  try {
    return await fetchRepositoryDetail(owner, repo);
  } catch (error) {
    if (error instanceof GitHubHttpError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} | github-ai-repo`,
  };
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  const { owner, repo } = await params;
  const [detail, release] = await Promise.all([
    loadDetail(owner, repo),
    fetchLatestRelease(owner, repo).catch(() => null),
  ]);

  const stats = [
    {
      key: "stars",
      label: "Star数",
      value: detail.stargazers_count,
      icon: Star,
    },
    {
      key: "watchers",
      label: "Watcher数",
      value: detail.watchers_count,
      icon: Eye,
    },
    {
      key: "forks",
      label: "Fork数",
      value: detail.forks_count,
      icon: GitFork,
    },
    {
      key: "issues",
      label: "Issue数",
      value: detail.open_issues_count,
      icon: CircleDot,
    },
  ];

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Image
                src={detail.owner.avatar_url}
                alt={`${detail.owner.login} avatar`}
                width={56}
                height={56}
                className="rounded-full"
              />
              <div className="min-w-0">
                <h2 className="text-xl font-semibold break-words">
                  <a
                    href={detail.owner.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${detail.owner.login} の GitHub プロフィール (新しいタブで開く)`}
                    className="hover:underline"
                  >
                    {detail.owner.login}
                  </a>
                  <span className="text-muted-foreground"> / </span>
                  <a
                    href={detail.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${detail.full_name} の GitHub リポジトリ (新しいタブで開く)`}
                    className="hover:underline"
                  >
                    {detail.name}
                  </a>
                </h2>
                <p className="truncate text-sm text-muted-foreground">
                  {detail.language ? (
                    <LanguageIndicator language={detail.language} />
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.key}
                    className="flex items-start gap-2 rounded-lg border border-border/50 p-3"
                  >
                    <Icon className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted-foreground">
                        {stat.label}
                      </dt>
                      <dd className="truncate font-medium">
                        {stat.value.toLocaleString("en-US")}
                      </dd>
                    </div>
                  </div>
                );
              })}
            </dl>
            {release && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-border/50 p-4">
                <Tag className="mt-0.5 size-5 text-muted-foreground" />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">最新リリース</h3>
                  <p className="mt-1 text-sm font-medium">
                    {release.name ?? release.tag_name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {release.tag_name} ・{" "}
                    {new Date(release.published_at).toLocaleDateString("ja-JP")}
                  </p>
                  <a
                    href={release.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    GitHubで見る
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
