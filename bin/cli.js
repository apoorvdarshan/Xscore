#!/usr/bin/env node

import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(__dirname, "cli.ts");

try {
  execFileSync("npx", ["tsx", cli, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env },
  });
} catch (e) {
  process.exit(e.status || 1);
}
