import { getBundle } from "../src/lib/content";
import { validateBundle } from "../src/lib/schema";

const required = ["eras", "factions", "characters", "works", "places", "events", "tags", "machines"];

try {
  const bundle = getBundle();
  const counts = Object.fromEntries(required.map((key) => [key, (bundle as any)[key].length]));
  console.log("GAIA Archive content check");
  console.log("──────────────────────────");
  for (const [key, value] of Object.entries(counts)) {
    console.log(`${key.padEnd(12)} ${String(value).padStart(3)}`);
  }
  console.log(`${"edges".padEnd(12)} ${String(bundle.machines.reduce((n, m) => n + m.edges.length, 0)).padStart(3)}`);
  const errors = validateBundle(bundle);
  if (errors.length > 0) {
    console.error("\n交叉引用问题:");
    errors.forEach((error) => console.error(`  · ${error}`));
    process.exit(1);
  }
  console.log("\n✓ schema, references, DAG and reciprocity checks passed");
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
