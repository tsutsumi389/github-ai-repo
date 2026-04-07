import type { Repository } from "@/types/github";

const GITHUB_REPOSITORIES_URL = "https://api.github.com/repositories";

export async function fetchRepositories(): Promise<readonly Repository[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(GITHUB_REPOSITORIES_URL, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch repositories: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as Repository[];
  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    html_url: repo.html_url,
    owner: {
      login: repo.owner.login,
      avatar_url: repo.owner.avatar_url,
    },
  }));
}
