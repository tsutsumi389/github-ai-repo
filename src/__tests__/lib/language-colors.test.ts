import { describe, expect, it } from "vitest";
import { getLanguageColor } from "@/lib/language-colors";

describe("getLanguageColor", () => {
  it.each([
    ["Python", "#3572A5"],
    ["TypeScript", "#3178c6"],
    ["JavaScript", "#f1e05a"],
    ["Go", "#00ADD8"],
    ["Rust", "#dea584"],
  ])("returns the correct color for %s", (language, expected) => {
    expect(getLanguageColor(language)).toBe(expected);
  });

  it("returns fallback gray for unknown languages", () => {
    expect(getLanguageColor("UnknownLang")).toBe("#8b949e");
  });
});
