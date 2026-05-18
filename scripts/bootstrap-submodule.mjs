#!/usr/bin/env node
// Bootstrap the lsp-tools-mcp git submodule for local development.
// CI runs the install+build steps explicitly in the workflow, so this
// script is for `npm run bootstrap` after a fresh clone.
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const submoduleDir = join(__dirname, "..", "packages", "lsp-tools-mcp");
const submodulePackageJson = join(submoduleDir, "package.json");

if (!existsSync(submodulePackageJson)) {
	console.error(
		"lsp-tools-mcp submodule is missing. Run: git submodule update --init --recursive",
	);
	process.exit(1);
}

console.log("Installing lsp-tools-mcp dependencies...");
execSync("npm ci", { cwd: submoduleDir, stdio: "inherit" });

console.log("Building lsp-tools-mcp...");
execSync("npm run build", { cwd: submoduleDir, stdio: "inherit" });

console.log("Done.");
