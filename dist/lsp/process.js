import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { LspInvalidPathError, LspProcessSpawnError } from "./errors.js";
export function validateCwd(cwd) {
    try {
        if (!existsSync(cwd)) {
            return { valid: false, error: `Working directory does not exist: ${cwd}` };
        }
        const stats = statSync(cwd);
        if (!stats.isDirectory()) {
            return { valid: false, error: `Path is not a directory: ${cwd}` };
        }
        return { valid: true };
    }
    catch (err) {
        return {
            valid: false,
            error: `Cannot access working directory: ${cwd} (${err instanceof Error ? err.message : String(err)})`,
        };
    }
}
function wrap(proc) {
    const exitedPromise = new Promise((resolve) => {
        proc.once("close", (code) => resolve(code ?? 0));
        proc.once("error", () => resolve(1));
    });
    if (!proc.stdin || !proc.stdout || !proc.stderr) {
        throw new LspProcessSpawnError("Spawned process is missing one of stdin/stdout/stderr pipes");
    }
    return {
        stdin: proc.stdin,
        stdout: proc.stdout,
        stderr: proc.stderr,
        get pid() {
            return proc.pid ?? undefined;
        },
        get exitCode() {
            return proc.exitCode;
        },
        get killed() {
            return proc.killed;
        },
        exited: exitedPromise,
        kill(signal) {
            try {
                proc.kill(signal ?? "SIGTERM");
            }
            catch { }
        },
    };
}
export function spawnProcess(command, options) {
    const cwdValidation = validateCwd(options.cwd);
    if (!cwdValidation.valid) {
        throw new LspInvalidPathError(`[lsp] ${cwdValidation.error}`);
    }
    const [cmd, ...args] = command;
    if (!cmd) {
        throw new LspProcessSpawnError("[lsp] empty command");
    }
    const proc = spawn(cmd, args, {
        cwd: options.cwd,
        env: options.env,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
        shell: process.platform === "win32",
    });
    return wrap(proc);
}
//# sourceMappingURL=process.js.map