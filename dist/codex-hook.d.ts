export type DiagnosticsRunner = (filePath: string) => Promise<string>;
export interface CodexPostToolUseInput {
    tool_name?: unknown;
    tool_input?: unknown;
    tool_response?: unknown;
}
export declare function runLspDiagnosticsText(filePath: string): Promise<string>;
export declare function runLspPostToolUseHook(input: CodexPostToolUseInput, runDiagnostics?: DiagnosticsRunner): Promise<string>;
export declare function extractMutatedFilePaths(input: CodexPostToolUseInput): string[];
export declare function runPostToolUseHookCli(stdin?: NodeJS.ReadStream): Promise<void>;
