// Static export writes segment payloads as out/<route>/__next.a/b/__PAGE__.txt, but the client
// prefetches out/<route>/__next.a.b.__PAGE__.txt. Static hosts (GitHub Pages) can't rewrite,
// so also write the flattened names. Usage: node scripts/flatten-export-segments.mjs [outDir]
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = process.argv[2] ?? "out";
let count = 0;

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? filesUnder(p) : [p];
  });
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      for (const file of filesUnder(p)) {
        const flat = [name, ...relative(p, file).split(sep)].join(".");
        copyFileSync(file, join(dir, flat));
        count++;
      }
    } else {
      walk(p);
    }
  }
}

walk(OUT);
console.log(`flattened ${count} segment files`);
