export type Repository = {
  readonly id: number;
  readonly name: string;
  readonly full_name: string;
  readonly html_url: string;
  readonly owner: {
    readonly login: string;
    readonly avatar_url: string;
  };
};

export type SearchRepositoriesResponse = {
  readonly total_count: number;
  readonly items: readonly Repository[];
};

export type RepositoryDetail = Repository & {
  readonly language: string | null;
  readonly stargazers_count: number;
  readonly watchers_count: number;
  readonly forks_count: number;
  readonly open_issues_count: number;
};
