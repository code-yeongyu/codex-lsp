# codex-lsp

[![ci](https://github.com/code-yeongyu/codex-lsp/actions/workflows/ci.yml/badge.svg)](https://github.com/code-yeongyu/codex-lsp/actions/workflows/ci.yml) [![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Codex plugin that ports the standalone LSP runtime from [`pi-lsp-client`](https://github.com/code-yeongyu/pi-lsp-client). It gives Codex post-edit diagnostics plus explicit MCP tools for language-aware code work.

## Behavior

| Case | Result |
|------|--------|
| `apply_patch` succeeds | parses `tool_input.command`, extracts added/updated/moved files, and checks each with LSP error diagnostics |
| `write` / `edit` / `multiedit` succeeds | checks `path`, `filePath`, or `file_path` aliases |
| diagnostics contain errors | returns Codex `PostToolUse` blocking feedback so Codex fixes the file |
| no diagnostics | emits no hook output |
| unsupported extension | emits no hook output |
| missing configured language server | surfaces the install/config message through hook or MCP output |

Deletes are ignored because they cannot introduce new diagnostics.

## MCP Tools

- `lsp_status`
- `lsp_diagnostics`
- `lsp_goto_definition`
- `lsp_find_references`
- `lsp_symbols`
- `lsp_prepare_rename`
- `lsp_rename`

`lsp_rename` applies the returned workspace edit to files. Use `lsp_prepare_rename` first when possible.

## Configuration

Project config:

```text
.codex/lsp-client.json
```

User config:

```text
~/.codex/lsp-client.json
```

Example:

```json
{
	"lsp": {
		"typescript": {
			"command": ["typescript-language-server", "--stdio"],
			"extensions": [".ts", ".tsx", ".js", ".jsx"]
		}
	}
}
```

Built-in server definitions are used when no custom config overrides them. `lsp_status` shows which configured servers are installed or missing.

## Codex Plugin

The plugin ships:

- `.codex-plugin/plugin.json` for Codex plugin discovery.
- `.mcp.json` for the `codex-lsp` MCP server.
- `hooks/hooks.json` for the `PostToolUse` diagnostics hook.
- `skills/lsp/SKILL.md` with MCP usage guidance.

The hook command is:

```bash
node "$PLUGIN_ROOT/dist/cli.js" hook post-tool-use
```

The MCP command is:

```bash
node ./dist/cli.js mcp
```

## Local Development

```bash
npm install
npm test
npm run typecheck
npm run check
npm pack --dry-run
```

Smoke-test the hook:

```bash
node dist/cli.js hook post-tool-use < test/fixtures/post-tool-use.json
```

Smoke-test the MCP server:

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/cli.js mcp
```

## Local Codex Installation

From the marketplace root containing this plugin:

```bash
codex plugin marketplace add /path/to/codex-plugins
```

If your local Codex build does not yet expose `codex plugin add`, install from the UI or copy the plugin into `~/.codex/plugins/cache/<marketplace>/codex-lsp/0.1.0` and enable:

```toml
[plugins."codex-lsp@code-yeongyu-codex-plugins"]
enabled = true
```

## Branch Rules and Releases

- `main` is protected by `.github/branch-ruleset.json`.
- CI runs Node 20 and 22 on Ubuntu and macOS.
- Releases are GitHub Releases tagged as `v<semver>`.
- Publishing runs from the `publish` workflow after a GitHub Release is published.

## Privacy

This plugin runs locally. It starts configured language-server commands on your machine and does not call a network service by itself.

## License

[MIT](LICENSE).

## Related

- [pi-lsp-client](https://github.com/code-yeongyu/pi-lsp-client) - source extension this Codex plugin ports.
