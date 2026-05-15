export interface SpawnedProcess {
    stdin: NodeJS.WritableStream;
    stdout: NodeJS.ReadableStream;
    stderr: NodeJS.ReadableStream;
    pid: number | undefined;
    exitCode: number | null;
    exited: Promise<number>;
    kill(signal?: NodeJS.Signals): void;
    killed: boolean;
}
export interface SpawnOptions {
    cwd: string;
    env: Record<string, string | undefined>;
}
export declare function validateCwd(cwd: string): {
    valid: boolean;
    error?: string;
};
export declare function spawnProcess(command: string[], options: SpawnOptions): SpawnedProcess;
//# sourceMappingURL=process.d.ts.map