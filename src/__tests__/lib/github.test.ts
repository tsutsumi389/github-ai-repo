import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchRepositories,
  fetchRepositoryDetail,
  GitHubHttpError,
  searchRepositories,
} from "@/lib/github";

const sampleDefaultSearchResponse = {
  total_count: 5000,
  items: [
    {
      id: 1,
      name: "tensorflow",
      full_name: "tensorflow/tensorflow",
      html_url: "https://github.com/tensorflow/tensorflow",
      owner: {
        login: "tensorflow",
        avatar_url: "https://avatars.githubusercontent.com/u/15658638?v=4",
        html_url: "https://github.com/tensorflow",
      },
      description: "An Open Source Machine Learning Framework for Everyone",
      private: false,
    },
    {
      id: 2,
      name: "transformers",
      full_name: "huggingface/transformers",
      html_url: "https://github.com/huggingface/transformers",
      owner: {
        login: "huggingface",
        avatar_url: "https://avatars.githubusercontent.com/u/25720743?v=4",
        html_url: "https://github.com/huggingface",
      },
    },
  ],
};

describe("fetchRepositories", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    delete process.env.GITHUB_TOKEN;
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(sampleDefaultSearchResponse), {
        status: 200,
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("page 未指定時は topic:ai をスター数降順で取得する (page=1)", async () => {
    await fetchRepositories();

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.github.com/search/repositories?q=topic%3Aai&sort=stars&order=desc&page=1&per_page=30",
    );
  });

  it("page 引数に応じて page クエリを切り替える", async () => {
    await fetchRepositories(3);

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.github.com/search/repositories?q=topic%3Aai&sort=stars&order=desc&page=3&per_page=30",
    );
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

  it("レスポンスを { items, totalCount } にマップする", async () => {
    const result = await fetchRepositories();

    expect(result.totalCount).toBe(5000);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      id: 1,
      name: "tensorflow",
      full_name: "tensorflow/tensorflow",
      html_url: "https://github.com/tensorflow/tensorflow",
      owner: {
        login: "tensorflow",
        avatar_url: "https://avatars.githubusercontent.com/u/15658638?v=4",
        html_url: "https://github.com/tensorflow",
      },
    });
  });

  it("HTTP エラー時は GitHubHttpError を投げる", async () => {
    fetchMock.mockResolvedValue(new Response("rate limited", { status: 403 }));

    const error = await fetchRepositories().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GitHubHttpError);
    expect((error as GitHubHttpError).status).toBe(403);
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
    html_url: "https://github.com/octocat",
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
        html_url: "https://github.com/octocat",
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

    const error = await fetchRepositoryDetail("octocat", "Hello-World").catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(GitHubHttpError);
    expect((error as GitHubHttpError).status).toBe(404);
  });

  it("5xx のときは status を保持した GitHubHttpError を投げる", async () => {
    fetchMock.mockResolvedValue(new Response("boom", { status: 503 }));

    const error = await fetchRepositoryDetail("octocat", "Hello-World").catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(GitHubHttpError);
    expect((error as GitHubHttpError).status).toBe(503);
  });
});

const sampleSearchResponse = {
  total_count: 2,
  items: [
    {
      id: 10,
      name: "react",
      full_name: "facebook/react",
      html_url: "https://github.com/facebook/react",
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
      },
      description: "A declarative, efficient, and flexible JavaScript library",
      private: false,
    },
    {
      id: 20,
      name: "react-native",
      full_name: "facebook/react-native",
      html_url: "https://github.com/facebook/react-native",
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
      },
    },
  ],
};

describe("searchRepositories", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    delete process.env.GITHUB_TOKEN;
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(sampleSearchResponse), { status: 200 }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("GitHub Search API の /search/repositories エンドポイントを叩く (page=1)", async () => {
    await searchRepositories("react");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.github.com/search/repositories?q=react%20topic%3Aai&page=1&per_page=30",
    );
  });

  it("クエリ文字列を URL エンコードする", async () => {
    await searchRepositories("hello world");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.github.com/search/repositories?q=hello%20world%20topic%3Aai&page=1&per_page=30",
    );
  });

  it("page 引数に応じて page クエリを切り替える", async () => {
    await searchRepositories("react", 4);

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.github.com/search/repositories?q=react%20topic%3Aai&page=4&per_page=30",
    );
  });

  it("items と totalCount を返す", async () => {
    const result = await searchRepositories("react");

    expect(result.totalCount).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      id: 10,
      name: "react",
      full_name: "facebook/react",
      html_url: "https://github.com/facebook/react",
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
      },
    });
    expect(result.items[1]).toEqual({
      id: 20,
      name: "react-native",
      full_name: "facebook/react-native",
      html_url: "https://github.com/facebook/react-native",
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
      },
    });
  });

  it("空文字クエリは API を呼ばず {items: [], totalCount: 0} を返す", async () => {
    const result = await searchRepositories("   ");

    expect(result).toEqual({ items: [], totalCount: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("HTTP エラー時は GitHubHttpError を投げる", async () => {
    fetchMock.mockResolvedValue(new Response("unprocessable", { status: 422 }));

    const error = await searchRepositories("invalid query").catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(GitHubHttpError);
    expect((error as GitHubHttpError).status).toBe(422);
  });
});
