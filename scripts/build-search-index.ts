import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildSearchIndex } from "../src/lib/search-index";
import { LANGS, type Lang } from "../src/lib/schema";

const dir = join(process.cwd(), "public");
mkdirSync(dir, { recursive: true });
for (const lang of LANGS) {
  const entries = buildSearchIndex(lang);
  const file = join(dir, `search-index.${lang}.json`);
  writeFileSync(file, JSON.stringify(entries));
  console.log(`wrote public/search-index.${lang}.json (${entries.length} entries)`);
}
