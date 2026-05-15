import type { ResolvedServer } from "./types.js";
interface LspEntry {
    disabled?: boolean;
    command?: string[];
    extensions?: string[];
    priority?: number;
    env?: Record<string, string>;
    initialization?: Record<string, unknown>;
}
interface ConfigJson {
    lsp?: Record<string, LspEntry>;
}
type ConfigSource = "project" | "user";
export interface ServerWithSource extends ResolvedServer {
    source: "project" | "user" | "builtin";
}
export declare function getConfigPaths(): {
    project: string;
    user: string;
};
export declare function loadAllConfigs(): Map<ConfigSource, ConfigJson>;
export declare function getMergedServers(): ServerWithSource[];
export declare function getDisabledServerIds(): Set<string>;
export {};
//# sourceMappingURL=config-loader.d.ts.map