import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  computePageItems,
  RepositoryPagination,
} from "@/components/repository-pagination";

afterEach(() => {
  cleanup();
});

describe("computePageItems", () => {
  it("totalPages <= 7 はすべて番号表示", () => {
    expect(computePageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("先頭付近は末尾側に ellipsis を入れる", () => {
    expect(computePageItems(2, 20)).toEqual([1, 2, 3, 4, "ellipsis", 20]);
  });

  it("末尾付近は先頭側に ellipsis を入れる", () => {
    expect(computePageItems(19, 20)).toEqual([1, "ellipsis", 17, 18, 19, 20]);
  });

  it("中央付近は両側に ellipsis を入れる", () => {
    expect(computePageItems(10, 20)).toEqual([
      1,
      "ellipsis",
      8,
      9,
      10,
      11,
      12,
      "ellipsis",
      20,
    ]);
  });
});

describe("RepositoryPagination", () => {
  it("currentPage がアクティブリンクとして描画される", () => {
    render(<RepositoryPagination currentPage={3} totalPages={10} />);
    const active = screen.getByRole("link", { current: "page" });
    expect(active).toHaveTextContent("3");
  });

  it("query があれば href に q パラメータが含まれる", () => {
    render(
      <RepositoryPagination currentPage={2} totalPages={5} query="react" />,
    );
    const page3 = screen.getByRole("link", { name: "3" });
    expect(page3.getAttribute("href")).toBe("/?q=react&page=3");
  });

  it("query が無ければ href に page のみ", () => {
    render(<RepositoryPagination currentPage={2} totalPages={5} />);
    const page3 = screen.getByRole("link", { name: "3" });
    expect(page3.getAttribute("href")).toBe("/?page=3");
  });

  it("currentPage=1 のとき Previous は aria-disabled", () => {
    render(<RepositoryPagination currentPage={1} totalPages={5} />);
    const prev = screen.getByLabelText("Go to previous page");
    expect(prev.getAttribute("aria-disabled")).toBe("true");
  });

  it("currentPage=totalPages のとき Next は aria-disabled", () => {
    render(<RepositoryPagination currentPage={5} totalPages={5} />);
    const next = screen.getByLabelText("Go to next page");
    expect(next.getAttribute("aria-disabled")).toBe("true");
  });
});
