import { describe, expect, it } from "vitest";

import { extractMutatedFilePaths, runLspPostToolUseHook } from "../src/codex-hook.js";

describe("codex PostToolUse hook", () => {
	it("extracts files from Codex apply_patch command payloads", () => {
		const paths = extractMutatedFilePaths({
			tool_name: "apply_patch",
			tool_input: {
				command: [
					"*** Begin Patch",
					"*** Add File: src/new.ts",
					"+export const value = 1;",
					"*** Update File: src/existing.ts",
					"@@",
					"-export const old = true;",
					"+export const old = false;",
					"*** End Patch",
				].join("\n"),
			},
			tool_response: "Success. Updated files.",
		});

		expect(paths).toEqual(["src/new.ts", "src/existing.ts"]);
	});

	it("extracts files from edit-style tool input aliases", () => {
		const paths = extractMutatedFilePaths({
			tool_name: "Edit",
			tool_input: { file_path: "src/edit.ts" },
			tool_response: { ok: true },
		});

		expect(paths).toEqual(["src/edit.ts"]);
	});

	it("returns blocking feedback when post-edit diagnostics contain errors", async () => {
		const output = await runLspPostToolUseHook(
			{
				tool_name: "apply_patch",
				tool_input: {
					command: "*** Begin Patch\n*** Update File: src/broken.ts\n@@\n+missing();\n*** End Patch\n",
				},
				tool_response: "Success. Updated files.",
			},
			async (filePath) => {
				expect(filePath).toBe("src/broken.ts");
				return "error[typescript] (2304) at 1:1: Cannot find name 'missing'.";
			},
		);

		expect(JSON.parse(output)).toEqual({
			decision: "block",
			reason:
				"LSP diagnostics after editing src/broken.ts:\n" +
				"error[typescript] (2304) at 1:1: Cannot find name 'missing'.",
		});
	});

	it("is silent for clean diagnostics and unsupported extensions", async () => {
		const output = await runLspPostToolUseHook(
			{
				tool_name: "apply_patch",
				tool_input: {
					command: "*** Begin Patch\n*** Update File: README.md\n@@\n+hello\n*** End Patch\n",
				},
				tool_response: "Success. Updated files.",
			},
			async () => "No LSP server configured for extension: .md",
		);

		expect(output).toBe("");
	});
});
