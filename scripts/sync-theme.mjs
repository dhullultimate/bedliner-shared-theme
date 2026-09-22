// Reference copy — each consuming site keeps its own copy of this file at
// site/scripts/sync-theme.mjs and runs it via `"prebuild": "node scripts/sync-theme.mjs"`.
//
// Resolves the theme package two ways so this works both before and after
// bedliner-theme is published/pushed as a real git dependency:
//   1. node_modules/bedliner-theme   (once package.json depends on the git repo)
//   2. ../bedliner-shared-theme      (sibling checkout, for local dev before that)
import { existsSync, cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidates = [
  join(siteRoot, "node_modules", "bedliner-theme"),
  join(siteRoot, "..", "..", "bedliner-shared-theme"),
];
const themeRoot = candidates.find((p) => existsSync(p));
if (!themeRoot) {
  console.error("sync-theme: could not find bedliner-theme in node_modules or as a sibling checkout.");
  process.exit(1);
}

const srcDir = join(siteRoot, "src");
mkdirSync(join(srcDir, "_includes"), { recursive: true });
mkdirSync(join(srcDir, "assets", "css"), { recursive: true });
mkdirSync(join(srcDir, "assets", "js"), { recursive: true });

cpSync(join(themeRoot, "includes", "base.njk"), join(srcDir, "_includes", "base.njk"));
cpSync(join(themeRoot, "assets", "css", "style.css"), join(srcDir, "assets", "css", "style.css"));
cpSync(join(themeRoot, "assets", "js", "main.js"), join(srcDir, "assets", "js", "main.js"));

console.log(`sync-theme: synced base.njk / style.css / main.js from ${themeRoot}`);
