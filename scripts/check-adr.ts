import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ADR_DIR = join(import.meta.dirname, "..", "docs", "adr");
const ADR_PATTERN = /^ADR-\d{3}-/;
const VALID_STATUSES = ["Accepted", "Superseded", "Deprecated"] as const;
const REQUIRED_FIELDS = ["id", "title", "status", "date"] as const;

interface Frontmatter {
  [key: string]: string | undefined;
}

function parseFrontmatter(content: string): Frontmatter | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key && value) fm[key] = value;
  }
  return fm;
}

const errors: string[] = [];
const ids = new Map<string, string>();

const files = (await readdir(ADR_DIR))
  .filter((f) => ADR_PATTERN.test(f) && f.endsWith(".md"))
  .sort();

if (files.length === 0) {
  console.log("No ADR files found.");
  process.exit(0);
}

for (const file of files) {
  const content = await readFile(join(ADR_DIR, file), "utf-8");
  const fm = parseFrontmatter(content);

  if (!fm) {
    errors.push(`${file}: YAMLフロントマターが見つかりません`);
    continue;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!fm[field]) {
      errors.push(`${file}: 必須フィールド '${field}' がありません`);
    }
  }

  if (
    fm.status &&
    !VALID_STATUSES.includes(fm.status as (typeof VALID_STATUSES)[number])
  ) {
    errors.push(
      `${file}: 無効なステータス '${fm.status}' (有効値: ${VALID_STATUSES.join(", ")})`,
    );
  }

  if (fm.status === "Superseded" && !fm.superseded_by) {
    errors.push(
      `${file}: ステータスが Superseded ですが 'superseded_by' が指定されていません`,
    );
  }

  if (fm.id) {
    const existing = ids.get(fm.id);
    if (existing) {
      errors.push(`${file}: ID '${fm.id}' が重複しています (${existing})`);
    } else {
      ids.set(fm.id, file);
    }
  }
}

if (errors.length > 0) {
  console.error("ADR validation failed:\n");
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  console.log(`All ${files.length} ADR(s) passed validation.`);
}
