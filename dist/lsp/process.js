import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { delimiter, join } from "node:path";
import { reportBestEffortCleanupError } from "./cleanup-errors.js";
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
            catch (error) {
                reportBestEffortCleanupError("process kill", error);
            }
        },
    };
}
function isWindowsShellShim(command) {
    const lowerCommand = command.toLowerCase();
    return lowerCommand.endsWith(".cmd") || lowerCommand.endsWith(".bat");
}
function splitPath(pathValue, platform) {
    const separator = platform === "win32" ? ";" : delimiter;
    return pathValue.split(separator).filter(Boolean);
}
function getWindowsPathExtensions(env) {
    const rawExtensions = env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD";
    const extensions = rawExtensions
        .split(";")
        .map((extension) => extension.trim())
        .filter(Boolean)
        .map((extension) => (extension.startsWith(".") ? extension : `.${extension}`));
    return [...new Set(["", ...extensions, ".exe", ".cmd", ".bat"])];
}
function resolveWindowsCommand(command, env) {
    const hasPathSeparator = command.includes("/") || command.includes("\\");
    const pathValue = env.PATH ?? env.Path ?? "";
    const baseDirectories = hasPathSeparator ? [""] : splitPath(pathValue, "win32");
    const extensions = getWindowsPathExtensions(env);
    for (const baseDirectory of baseDirectories) {
        for (const extension of extensions) {
            const candidate = baseDirectory ? join(baseDirectory, `${command}${extension}`) : `${command}${extension}`;
            if (existsSync(candidate))
                return candidate;
        }
    }
    return command;
}
export function createSpawnCommand(command, platform = process.platform, commandProcessor = process.env.ComSpec ?? "cmd.exe", env = process.env) {
    const [cmd, ...args] = command;
    if (!cmd) {
        throw new LspProcessSpawnError("[lsp] empty command");
    }
    if (platform !== "win32") {
        return { command: cmd, args, shell: false };
    }
    const resolvedCommand = resolveWindowsCommand(cmd, env);
    if (!isWindowsShellShim(resolvedCommand)) {
        return { command: resolvedCommand, args, shell: false };
    }
    return {
        command: commandProcessor,
        args: ["/d", "/s", "/c", resolvedCommand, ...args],
        shell: false,
    };
}
export function spawnProcess(command, options) {
    const cwdValidation = validateCwd(options.cwd);
    if (!cwdValidation.valid) {
        throw new LspInvalidPathError(`[lsp] ${cwdValidation.error}`);
    }
    const [cmd] = command;
    if (!cmd) {
        throw new LspProcessSpawnError("[lsp] empty command");
    }
    const preparedCommand = createSpawnCommand(command, process.platform, process.env.ComSpec ?? "cmd.exe", options.env);
    const proc = spawn(preparedCommand.command, preparedCommand.args, {
        cwd: options.cwd,
        env: options.env,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
        shell: preparedCommand.shell,
    });
    return wrap(proc);
}
//# sourceMappingURL=process.js.map