import type { Repository, RepositoryDetail } from "@/types/github";

const GITHUB_API_BASE = "https://api.github.com";

export class GitHubHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
  ) {
    super(`GitHub API request failed: ${status} ${statusText}`);
    this.name = "GitHubHttpError";
  }
}

async function githubFetch<T>(path: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers,
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new GitHubHttpError(response.status, response.statusText);
  }

  return (await response.json()) as T;
}

function toRepository(raw: Repository): Repository {
  return {
    id: raw.id,
    name: raw.name,
    full_name: raw.full_name,
    html_url: raw.html_url,
    owner: {
      login: raw.owner.login,
      avatar_url: raw.owner.avatar_url,
    },
  };
}

export async function fetchRepositories(): Promise<readonly Repository[]> {
  const data = await githubFetch<Repository[]>("/repositories");
  return data.map(toRepository);
}

export async function fetchRepositoryDetail(
  owner: string,
  repo: string,
): Promise<RepositoryDetail> {
  const data = await githubFetch<RepositoryDetail>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
  return {
    ...toRepository(data),
    language: data.language,
    stargazers_count: data.stargazers_count,
    watchers_count: data.watchers_count,
    forks_count: data.forks_count,
    open_issues_count: data.open_issues_count,
  };
}
