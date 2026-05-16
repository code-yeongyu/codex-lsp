import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";

import { getConfigPaths } from "../src/lsp/config-loader.js";

describe("config loader", () => {
	it("uses Codex config locations instead of pi config locations", () => {
		const paths = getConfigPaths();
		const expectedSuffix = join(".codex", "lsp-client.json");
		const piMarker = `${sep}.pi${sep}`;

		expect(paths.project.endsWith(expectedSuffix)).toBe(true);
		expect(paths.user.endsWith(expectedSuffix)).toBe(true);
		expect(paths.project).not.toContain(piMarker);
		expect(paths.user).not.toContain(piMarker);
	});
});
