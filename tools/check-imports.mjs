import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (path.endsWith(".js")) yield path;
  }
}

const segments = (path) => relative(root, path).split(sep);

function allowed(from, to) {
  const [fromLayer, fromMod] = segments(from);
  const [toLayer, toMod] = segments(to);
  if (fromLayer === "engine") return toLayer === "engine";
  if (fromLayer === "api") return toLayer === "engine" || toLayer === "api";
  if (fromLayer === "mods") return toLayer === "api" || (toLayer === "mods" && toMod === fromMod);
  return true;
}

let violations = 0;
for (const file of walk(root)) {
  if (segments(file)[0] === "tools") continue;
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/(?:from\s+|import\s*\(\s*)"(\.[^"]*)"/g)) {
    const target = resolve(dirname(file), match[1]);
    if (!allowed(file, target)) {
      console.error(`${relative(root, file)} imports ${match[1]}`);
      violations++;
    }
  }
}

if (violations > 0) process.exit(1);
console.log("import directions ok");
