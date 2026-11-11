import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const textKeys = new Set(["summary", "description", "outcome", "role", "bio", "detail"]);
const zhPatterns = [
  [/不是[^。；]{0,45}而是/, "“不是…而是…”转折模板"],
  [/真正的/, "“真正的”空泛强调"],
  [/这台机体/, "“这台机体”重复指代"],
  [/故事/, "“故事”叙事腔"],
  [/读者/, "“读者”评论腔"],
  [/宿命/, "“宿命”抒情词"],
  [/极致/, "“极致”抒情词"],
  [/见证了/, "“见证了”评论腔"],
  [/浪漫/, "“浪漫”抒情词"],
  [/让人/, "“让人”替读者规定感受"],
  [/叙事/, "“叙事”评论腔"],
  [/堪称|无疑|某种意义上/, "评论腔"],
  [/不再只是/, "“不再只是”模板转折"],
];
const jaPatterns = [
  [/本当の/, "「本当の」テンプレート強調"],
  [/物語/, "「物語」評論調"],
  [/読者/, "「読者」評論調"],
  [/宿命/, "「宿命」情緒語"],
  [/極限/, "「極限」情緒語"],
  [/ロマン/, "「ロマン」情緒語"],
  [/証言/, "「証言」評論調"],
  [/まるで|あたかも/, "比喩テンプレート"],
];
const errors = [];

function scan(label, value, lang) {
  if (typeof value !== "string") return;
  const patterns = lang === "zh" ? zhPatterns : jaPatterns;
  for (const [pattern, reason] of patterns) {
    if (pattern.test(value)) errors.push(`${label} [${lang}] ${reason}: ${value.slice(0, 48)}…`);
  }
  const max = lang === "zh" ? 260 : 320;
  if (value.length > max) errors.push(`${label} [${lang}] 段落过长 (${value.length} > ${max})`);
}

function walkLocalized(label, value) {
  if (!value || typeof value !== "object") return;
  for (const lang of ["zh", "ja"]) {
    const text = value[lang];
    if (typeof text === "string") scan(label, text, lang);
    if (Array.isArray(text)) text.forEach((item, index) => scan(`${label}[${index}]`, item, lang));
  }
}

function walkItem(file, item) {
  for (const key of textKeys) {
    if (key in item) walkLocalized(`${path.basename(file)}:${item.id ?? "?"}.${key}`, item[key]);
  }
  if (item.summary && typeof item.summary.zh === "string" && item.summary.zh.length > 90) {
    errors.push(`${path.basename(file)}:${item.id}.summary [zh] 摘要过长 (${item.summary.zh.length} > 90)`);
  }
  if (item.summary && typeof item.summary.ja === "string" && item.summary.ja.length > 120) {
    errors.push(`${path.basename(file)}:${item.id}.summary [ja] 要約が長い (${item.summary.ja.length} > 120)`);
  }
}

for (const file of fs.readdirSync(path.join(root, "content"))) {
  if (!file.endsWith(".json")) continue;
  const data = JSON.parse(fs.readFileSync(path.join(root, "content", file), "utf8"));
  if (Array.isArray(data)) data.forEach((item) => walkItem(file, item));
}
for (const file of fs.readdirSync(path.join(root, "content", "machines"))) {
  if (!file.endsWith(".json")) continue;
  const item = JSON.parse(fs.readFileSync(path.join(root, "content", "machines", file), "utf8"));
  walkItem(file, item);
}

// UI copy lives in src/lib/i18n.ts; scan it as raw text for the same high-frequency templates.
const i18nFile = path.join(root, "src", "lib", "i18n.ts");
if (fs.existsSync(i18nFile)) {
  const i18n = fs.readFileSync(i18nFile, "utf8");
  for (const [pattern, reason] of [...zhPatterns, ...jaPatterns]) {
    if (pattern.test(i18n)) errors.push(`src/lib/i18n.ts ${reason}`);
  }
}

if (errors.length > 0) {
  console.error(`Language check failed: ${errors.length} issue(s)\n`);
  errors.forEach((error) => console.error(`  · ${error}`));
  process.exit(1);
}
console.log("✓ language check passed: no high-frequency AI-style templates found");
