import { type TextContent } from "./tools.js";
export type JsonRpcId = string | number | null;
export interface McpToolDescriptor {
    name: string;
    title: string;
    description: string;
    inputSchema: unknown;
}
export interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
}
export interface JsonRpcResult {
    capabilities?: Record<string, unknown>;
    serverInfo?: Record<string, unknown>;
    protocolVersion?: string;
    tools?: McpToolDescriptor[];
    content?: TextContent[];
    isError?: boolean;
    [key: string]: unknown;
}
export interface JsonRpcResponse {
    jsonrpc: "2.0";
    id: JsonRpcId;
    result?: JsonRpcResult;
    error?: JsonRpcError;
}
export declare function handleLspMcpRequest(input: unknown): Promise<JsonRpcResponse | undefined>;
export declare function runMcpStdioServer(input?: NodeJS.ReadableStream, output?: NodeJS.WritableStream): Promise<void>;
//# sourceMappingURL=mcp.d.ts.map