import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchRepositories } from "@/lib/github";

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

    expect(fetchMock).toHaveBeenCalledTimes(1);
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
