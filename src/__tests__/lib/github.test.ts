import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRepositories, fetchRepositoryDetail } from "@/lib/github";

const sampleResponse = [
  {
    id: 1,
    name: "grit",
    full_name: "mojombo/grit",
    html_url: "https://github.com/mojombo/grit",
    owner: {
      login: "mojombo",
      avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
    },
    // 不要なフィールドが含まれていても問題ないことを確認
    description:
      "Grit gives you object oriented read/write access to Git repositories via Ruby.",
    private: false,
  },
  {
    id: 2,
    name: "merb-core",
    full_name: "wycats/merb-core",
    html_url: "https://github.com/wycats/merb-core",
    owner: {
      login: "wycats",
      avatar_url: "https://avatars.githubusercontent.com/u/4?v=4",
    },
  },
];

describe("fetchRepositories", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    delete process.env.GITHUB_TOKEN;
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(sampleResponse), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("GitHub APIの /repositories エンドポイントを叩く", async () => {
    await fetchRepositories();

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.github.com/repositories");
  });

  it("Accept ヘッダーに GitHub v3 JSON を指定する", async () => {
    await fetchRepositories();

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("Accept")).toBe("application/vnd.github.v3+json");
  });

  it("GITHUB_TOKEN が未設定のときは Authorization ヘッダーを付けない", async () => {
    await fetchRepositories();

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.has("Authorization")).toBe(false);
  });

  it("GITHUB_TOKEN が設定されていれば Authorization ヘッダーを付与する", async () => {
    process.env.GITHUB_TOKEN = "ghp_test_token";

    await fetchRepositories();

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer ghp_test_token");
  });

  it("レスポンスを Repository[] として返す", async () => {
    const repos = await fetchRepositories();

    expect(repos).toHaveLength(2);
    expect(repos[0]).toEqual({
      id: 1,
      name: "grit",
      full_name: "mojombo/grit",
      html_url: "https://github.com/mojombo/grit",
      owner: {
        login: "mojombo",
        avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
      },
    });
  });

  it("HTTP エラー時は例外を投げる", async () => {
    fetchMock.mockResolvedValue(new Response("rate limited", { status: 403 }));

    await expect(fetchRepositories()).rejects.toThrow(/403/);
  });

  it("fetch 自体が失敗したら例外を伝播する", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(fetchRepositories()).rejects.toThrow("network down");
  });
});

const sampleDetailResponse = {
  id: 1296269,
  name: "Hello-World",
  full_name: "octocat/Hello-World",
  html_url: "https://github.com/octocat/Hello-World",
  owner: {
    login: "octocat",
    avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
  },
  language: "C",
  stargazers_count: 80,
  watchers_count: 9,
  forks_count: 9,
  open_issues_count: 0,
  description: "This your first repo!",
  private: false,
  size: 108,
};

describe("fetchRepositoryDetail", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    delete process.env.GITHUB_TOKEN;
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(sampleDetailResponse), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("GitHub APIの /repos/{owner}/{repo} エンドポイントを叩く", async () => {
    await fetchRepositoryDetail("octocat", "Hello-World");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.github.com/repos/octocat/Hello-World");
  });

  it("owner/repo を URL エンコードする", async () => {
    await fetchRepositoryDetail("foo bar", "baz/qux");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.github.com/repos/foo%20bar/baz%2Fqux");
  });

  it("Accept ヘッダーに GitHub v3 JSON を指定する", async () => {
    await fetchRepositoryDetail("octocat", "Hello-World");

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("Accept")).toBe("application/vnd.github.v3+json");
  });

  it("GITHUB_TOKEN が未設定のときは Authorization ヘッダーを付けない", async () => {
    await fetchRepositoryDetail("octocat", "Hello-World");

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.has("Authorization")).toBe(false);
  });

  it("GITHUB_TOKEN が設定されていれば Authorization ヘッダーを付与する", async () => {
    process.env.GITHUB_TOKEN = "ghp_test_token";

    await fetchRepositoryDetail("octocat", "Hello-World");

    const [, init] = fetchMock.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer ghp_test_token");
  });

  it("レスポンスを RepositoryDetail にマップする", async () => {
    const detail = await fetchRepositoryDetail("octocat", "Hello-World");

    expect(detail).toEqual({
      id: 1296269,
      name: "Hello-World",
      full_name: "octocat/Hello-World",
      html_url: "https://github.com/octocat/Hello-World",
      owner: {
        login: "octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
      },
      language: "C",
      stargazers_count: 80,
      watchers_count: 9,
      forks_count: 9,
      open_issues_count: 0,
    });
  });

  it("language が null のケースをそのまま返す", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ ...sampleDetailResponse, language: null }),
        { status: 200 },
      ),
    );

    const detail = await fetchRepositoryDetail("octocat", "Hello-World");

    expect(detail.language).toBeNull();
  });

  it("404 のときは status=404 の GitHubHttpError を投げる", async () => {
    fetchMock.mockResolvedValue(new Response("not found", { status: 404 }));

    await expect(
      fetchRepositoryDetail("octocat", "Hello-World"),
    ).rejects.toMatchObject({
      name: "GitHubHttpError",
      status: 404,
    });
  });

  it("5xx のときは status を保持した GitHubHttpError を投げる", async () => {
    fetchMock.mockResolvedValue(new Response("boom", { status: 503 }));

    await expect(
      fetchRepositoryDetail("octocat", "Hello-World"),
    ).rejects.toMatchObject({
      name: "GitHubHttpError",
      status: 503,
    });
  });
});
