import { createInterface } from "node:readline";
import { coerceToolArguments, executeLspTool, LSP_MCP_TOOLS } from "./tools.js";
const SERVER_NAME = "lsp";
const SERVER_VERSION = "0.1.0";
export async function handleLspMcpRequest(input) {
    if (!isRecord(input)) {
        return errorResponse(null, -32600, "Invalid Request");
    }
    const id = jsonRpcId(input.id);
    if (input.method === "notifications/initialized")
        return undefined;
    if (input.method === "ping")
        return successResponse(id, {});
    if (input.method === "initialize") {
        const protocolVersion = requestedProtocolVersion(input.params);
        return successResponse(id, {
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
            protocolVersion,
        });
    }
    if (input.method === "tools/list") {
        return successResponse(id, { tools: LSP_MCP_TOOLS.map(describeTool) });
    }
    if (input.method === "tools/call") {
        return handleToolCall(id, input.params);
    }
    return errorResponse(id, -32601, `Method not found: ${String(input.method)}`);
}
export async function runMcpStdioServer(input = process.stdin, output = process.stdout) {
    const lines = createInterface({ input, crlfDelay: Number.POSITIVE_INFINITY });
    for await (const line of lines) {
        if (!line.trim())
            continue;
        let parsed;
        try {
            parsed = JSON.parse(line);
        }
        catch (error) {
            output.write(`${JSON.stringify(errorResponse(null, -32700, "Parse error", messageFromError(error)))}\n`);
            continue;
        }
        const response = await handleLspMcpRequest(parsed);
        if (response)
            output.write(`${JSON.stringify(response)}\n`);
    }
}
async function handleToolCall(id, params) {
    if (!isRecord(params) || typeof params.name !== "string") {
        return errorResponse(id, -32602, "tools/call requires params.name");
    }
    try {
        const result = await executeLspTool(params.name, coerceToolArguments(params.arguments));
        return successResponse(id, {
            content: result.content,
            isError: result.isError ?? false,
            details: result.details,
        });
    }
    catch (error) {
        return successResponse(id, {
            content: [{ type: "text", text: messageFromError(error) }],
            isError: true,
        });
    }
}
function describeTool(tool) {
    return {
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
    };
}
function successResponse(id, result) {
    return { jsonrpc: "2.0", id, result };
}
function errorResponse(id, code, message, data) {
    return { jsonrpc: "2.0", id, error: data === undefined ? { code, message } : { code, message, data } };
}
function requestedProtocolVersion(params) {
    if (!isRecord(params) || typeof params.protocolVersion !== "string")
        return "2024-11-05";
    return params.protocolVersion;
}
function jsonRpcId(value) {
    return typeof value === "string" || typeof value === "number" || value === null ? value : null;
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function messageFromError(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=mcp.js.map