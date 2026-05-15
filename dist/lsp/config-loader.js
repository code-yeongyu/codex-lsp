import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { BUILTIN_SERVERS } from "./server-definitions.js";
export function getConfigPaths() {
    const cwd = process.cwd();
    return {
        project: join(cwd, ".codex", "lsp-client.json"),
        user: join(homedir(), ".codex", "lsp-client.json"),
    };
}
function loadJsonFile(path) {
    if (!existsSync(path))
        return null;
    try {
        return JSON.parse(readFileSync(path, "utf-8"));
    }
    catch {
        return null;
    }
}
export function loadAllConfigs() {
    const paths = getConfigPaths();
    const configs = new Map();
    const project = loadJsonFile(paths.project);
    if (project)
        configs.set("project", project);
    const user = loadJsonFile(paths.user);
    if (user)
        configs.set("user", user);
    return configs;
}
export function getMergedServers() {
    const configs = loadAllConfigs();
    const servers = [];
    const disabled = new Set();
    const seen = new Set();
    const sources = ["project", "user"];
    for (const source of sources) {
        const config = configs.get(source);
        if (!config?.lsp)
            continue;
        for (const [id, entry] of Object.entries(config.lsp)) {
            if (entry.disabled) {
                disabled.add(id);
                continue;
            }
            if (seen.has(id))
                continue;
            if (!entry.command || !entry.extensions)
                continue;
            servers.push({
                id,
                command: entry.command,
                extensions: entry.extensions,
                priority: entry.priority ?? 0,
                env: entry.env,
                initialization: entry.initialization,
                source,
            });
            seen.add(id);
        }
    }
    for (const [id, config] of Object.entries(BUILTIN_SERVERS)) {
        if (disabled.has(id) || seen.has(id))
            continue;
        servers.push({
            id,
            command: config.command,
            extensions: config.extensions,
            priority: -100,
            source: "builtin",
        });
    }
    return servers.sort((a, b) => {
        if (a.source !== b.source) {
            const order = {
                project: 0,
                user: 1,
                builtin: 2,
            };
            return order[a.source] - order[b.source];
        }
        return b.priority - a.priority;
    });
}
export function getDisabledServerIds() {
    const configs = loadAllConfigs();
    const disabled = new Set();
    for (const config of configs.values()) {
        if (!config.lsp)
            continue;
        for (const [id, entry] of Object.entries(config.lsp)) {
            if (entry.disabled)
                disabled.add(id);
        }
    }
    return disabled;
}
//# sourceMappingURL=config-loader.js.map