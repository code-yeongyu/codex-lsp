import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readJson(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

describe("plugin package metadata", () => {
	it("#given packaged plugin files #when validating entrypoints #then hook command uses portable plugin root interpolation", () => {
		// given
		const packageJson = readJson("package.json");
		const pluginJson = readJson(".codex-plugin/plugin.json");
		const hooksJson = readJson("hooks/hooks.json");
		const mcpJson = readJson(".mcp.json");
		const cliSource = readFileSync("src/cli.ts", "utf8");

		// when
		const bin = packageJson.bin as Record<string, unknown>;
		const dependencies = packageJson.dependencies as Record<string, unknown> | undefined;
		const hookConfig = hooksJson.hooks as Record<string, Array<{ hooks: Array<{ command: string }> }>>;
		const command = hookConfig.PostToolUse?.[0]?.hooks[0]?.command;
		const mcpServers = mcpJson.mcpServers as Record<string, { command: string; args: string[] }>;
		const pluginRoot = ["$", "{PLUGIN_ROOT}"].join("");

		// then
		expect(packageJson.type).toBe("module");
		expect(packageJson.packageManager).toBe("npm@11.12.1");
		expect(dependencies).toEqual({
			"@code-yeongyu/lsp-tools-mcp": "file:./packages/lsp-tools-mcp",
		});
		expect(bin["codex-lsp"]).toBe("./dist/cli.js");
		expect(pluginJson.hooks).toBe("./hooks/hooks.json");
		expect(pluginJson.mcpServers).toBe("./.mcp.json");
		expect(cliSource.startsWith("#!/usr/bin/env node")).toBe(true);
		expect(command).toBe(`node "${pluginRoot}/dist/cli.js" hook post-tool-use`);
		expect(mcpServers.lsp?.command).toBe("node");
		expect(mcpServers.lsp?.args).toEqual(["./packages/lsp-tools-mcp/dist/cli.js", "mcp"]);
	});
});
