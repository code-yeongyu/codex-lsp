import { describe, expect, it } from "vitest";

import { handleLspMcpRequest } from "../src/mcp.js";

describe("codex-lsp MCP server", () => {
	it("responds to initialize with tool capabilities", async () => {
		const response = await handleLspMcpRequest({
			jsonrpc: "2.0",
			id: 1,
			method: "initialize",
			params: {
				protocolVersion: "2024-11-05",
				capabilities: {},
				clientInfo: { name: "test", version: "0.0.0" },
			},
		});

		expect(response).toMatchObject({
			jsonrpc: "2.0",
			id: 1,
			result: {
				capabilities: { tools: { listChanged: false } },
				serverInfo: { name: "codex-lsp", version: "0.1.0" },
			},
		});
	});

	it("lists LSP MCP tools", async () => {
		const response = await handleLspMcpRequest({
			jsonrpc: "2.0",
			id: 2,
			method: "tools/list",
		});

		const tools = response?.result?.tools as Array<{ name: string }>;
		expect(tools.map((tool) => tool.name)).toEqual([
			"lsp_status",
			"lsp_diagnostics",
			"lsp_goto_definition",
			"lsp_find_references",
			"lsp_symbols",
			"lsp_prepare_rename",
			"lsp_rename",
		]);
	});

	it("calls lsp_status without starting a language server", async () => {
		const response = await handleLspMcpRequest({
			jsonrpc: "2.0",
			id: 3,
			method: "tools/call",
			params: { name: "lsp_status", arguments: {} },
		});

		expect(response).toMatchObject({
			jsonrpc: "2.0",
			id: 3,
			result: {
				isError: false,
			},
		});
		expect(response?.result?.content?.[0]?.text).toContain("Configured LSP servers");
	});
});
