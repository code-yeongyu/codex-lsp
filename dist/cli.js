#!/usr/bin/env node
import { argv, stderr } from "node:process";
import { runPostToolUseHookCli } from "./codex-hook.js";
import { disposeDefaultLspManager } from "./lsp/manager.js";
import { runMcpStdioServer } from "./mcp.js";
async function main() {
    const [command = "mcp", subcommand = ""] = argv.slice(2);
    try {
        if (command === "hook" && subcommand === "post-tool-use") {
            await runPostToolUseHookCli();
            return;
        }
        if (command === "mcp") {
            await runMcpStdioServer();
            return;
        }
        stderr.write("Usage: codex-lsp [mcp | hook post-tool-use]\n");
        process.exitCode = 2;
    }
    finally {
        await disposeDefaultLspManager();
    }
}
main().catch(async (error) => {
    stderr.write(`${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`);
    await disposeDefaultLspManager();
    process.exitCode = 1;
});
//# sourceMappingURL=cli.js.map