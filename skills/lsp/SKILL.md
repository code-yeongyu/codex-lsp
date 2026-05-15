---
name: lsp
description: Use when Codex needs language-server diagnostics, definitions, references, symbols, or rename safety checks in the current workspace.
---

# Codex LSP

Use the `codex-lsp` MCP tools when language-aware feedback is useful before or after code edits.

## Tools

- `lsp_status`: list configured, installed, missing, disabled, and active language servers.
- `lsp_diagnostics`: check one file or directory for LSP diagnostics. Prefer `severity: "error"` after edits.
- `lsp_goto_definition`: locate a symbol definition from file, line, and character.
- `lsp_find_references`: find usages of a symbol across the workspace.
- `lsp_symbols`: inspect document symbols or search workspace symbols.
- `lsp_prepare_rename`: check whether a rename is valid at a position.
- `lsp_rename`: apply a language-server workspace edit for a rename.

## Config

Project config lives at `.codex/lsp-client.json`; user config lives at `~/.codex/lsp-client.json`.

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

Use `lsp_status` first when diagnostics report a missing language server.
