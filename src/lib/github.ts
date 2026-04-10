import type {
  Repository,
  RepositoryDetail,
  SearchRepositoriesResponse,
} from "@/types/github";

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

async function githubFetch<T>(
  path: string,
  options?: { revalidate?: number | false },
): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = { headers };
  if (options?.revalidate !== false) {
    (fetchOptions as Record<string, unknown>).next = {
      revalidate: options?.revalidate ?? 300,
    };
  }

  const response = await fetch(`${GITHUB_API_BASE}${path}`, fetchOptions);

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

export async function searchRepositories(
  query: string,
): Promise<readonly Repository[]> {
  if (!query.trim()) {
    return [];
  }
  const data = await githubFetch<SearchRepositoriesResponse>(
    `/search/repositories?q=${encodeURIComponent(query)}`,
    { revalidate: false },
  );
  return data.items.map(toRepository);
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
