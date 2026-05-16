import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createSpawnCommand } from "../src/lsp/process.js";

const tempDirectories: string[] = [];

afterEach(() => {
	for (const directory of tempDirectories.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

describe("createSpawnCommand", () => {
	it("#given windows executable command #when building spawn command #then it avoids shell mode", () => {
		// given
		const command = ["typescript-language-server", "--stdio"];

		// when
		const prepared = createSpawnCommand(command, "win32", "cmd.exe");

		// then
		expect(prepared).toEqual({
			command: "typescript-language-server",
			args: ["--stdio"],
			shell: false,
		});
	});

	it("#given windows cmd shim #when building spawn command #then it uses cmd only for the shim", () => {
		// given
		const command = ["typescript-language-server.cmd", "--stdio"];

		// when
		const prepared = createSpawnCommand(command, "win32", "cmd.exe");

		// then
		expect(prepared).toEqual({
			command: "cmd.exe",
			args: ["/d", "/s", "/c", "typescript-language-server.cmd", "--stdio"],
			shell: false,
		});
	});

	it("#given windows PATH shim #when resolving spawn command #then it executes the shim without shell mode", () => {
		// given
		const binaryDirectory = mkdtempSync(join(tmpdir(), "codex-lsp-bin-"));
		tempDirectories.push(binaryDirectory);
		mkdirSync(binaryDirectory, { recursive: true });
		const shimPath = join(binaryDirectory, "typescript-language-server.cmd");
		writeFileSync(shimPath, "@echo off\n");

		// when
		const prepared = createSpawnCommand(["typescript-language-server", "--stdio"], "win32", "cmd.exe", {
			PATH: binaryDirectory,
			PATHEXT: ".cmd;.exe",
		});

		// then
		expect(prepared).toEqual({
			command: "cmd.exe",
			args: ["/d", "/s", "/c", shimPath, "--stdio"],
			shell: false,
		});
	});
});
