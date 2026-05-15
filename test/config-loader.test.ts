import { describe, expect, it } from "vitest";

import { getConfigPaths } from "../src/lsp/config-loader.js";

describe("config loader", () => {
	it("uses Codex config locations instead of pi config locations", () => {
		const paths = getConfigPaths();

		expect(paths.project).toMatch(/\.codex\/lsp-client\.json$/);
		expect(paths.user).toMatch(/\.codex\/lsp-client\.json$/);
		expect(paths.project).not.toContain("/.pi/");
		expect(paths.user).not.toContain("/.pi/");
	});
});
