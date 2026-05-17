import { describe, expect, it } from "vitest";

import type { LspClient } from "../src/lsp/client.js";
import { LspManager } from "../src/lsp/manager.js";
import type { ResolvedServer } from "../src/lsp/types.js";

import { FakeLspClient, type FakeLspClientOptions, makeServer } from "./helpers/fake-lsp-client.js";

interface FakeContext {
	manager: LspManager;
	clients: FakeLspClient[];
	now: { value: number };
}

function setupManager(options?: {
	idleTimeoutMs?: number;
	initTimeoutMs?: number;
	reaperIntervalMs?: number;
	clientFactoryOptions?: () => FakeLspClientOptions;
}): FakeContext {
	const clients: FakeLspClient[] = [];
	const now = { value: 1_000 };
	const manager = new LspManager({
		idleTimeoutMs: options?.idleTimeoutMs ?? 5_000,
		initTimeoutMs: options?.initTimeoutMs ?? 1_000,
		reaperIntervalMs: options?.reaperIntervalMs ?? 100,
		now: () => now.value,
		clientFactory: (root: string, server: ResolvedServer): LspClient => {
			const client = new FakeLspClient(root, server, options?.clientFactoryOptions?.());
			clients.push(client);
			return client;
		},
	});
	return { manager, clients, now };
}

describe("LspManager", () => {
	it("#given failed start #when later getClient #then failed client is stopped and a fresh client is built", async () => {
		// given
		let firstCall = true;
		const failingFactory = () => {
			if (firstCall) {
				firstCall = false;
				return { failStart: true };
			}
			return {};
		};
		const { manager, clients } = setupManager({ clientFactoryOptions: failingFactory });
		const server = makeServer("typescript");

		// when
		await expect(manager.getClient("/root/a", server)).rejects.toThrow("fake start failed");

		// then
		expect(manager.getSnapshot()).toEqual([]);
		expect(clients[0]?.stopCallCount).toBeGreaterThan(0);

		const fresh = await manager.getClient("/root/a", server);
		expect(clients.length).toBe(2);
		expect(fresh).toBe(clients[1]);

		await manager.stopAll();
	});

	it("#given failed initialize #when later getClient #then failed client is stopped and a fresh client is built", async () => {
		// given
		let firstCall = true;
		const failingFactory = () => {
			if (firstCall) {
				firstCall = false;
				return { failInitialize: true };
			}
			return {};
		};
		const { manager, clients } = setupManager({ clientFactoryOptions: failingFactory });
		const server = makeServer("typescript");

		// when
		await expect(manager.getClient("/root/a", server)).rejects.toThrow("fake initialize failed");

		// then
		expect(manager.getSnapshot()).toEqual([]);
		expect(clients[0]?.stopCallCount).toBeGreaterThan(0);

		const fresh = await manager.getClient("/root/a", server);
		expect(clients.length).toBe(2);
		expect(fresh).toBe(clients[1]);

		await manager.stopAll();
	});
});
