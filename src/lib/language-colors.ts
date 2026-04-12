const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Scala: "#c22d40",
  R: "#198CE7",
  Julia: "#a270ba",
  Dart: "#00B4AB",
  Shell: "#89e051",
  Perl: "#0298c3",
  Lua: "#000080",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  "Jupyter Notebook": "#DA5B0B",
  "Objective-C": "#438eff",
  MATLAB: "#e16737",
  PowerShell: "#012456",
  Zig: "#ec915c",
  Nim: "#ffc200",
  OCaml: "#3be133",
};

const FALLBACK_COLOR = "#8b949e";

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? FALLBACK_COLOR;
}
