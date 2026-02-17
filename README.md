# MCP Apps on Adobe I/O Runtime

Build [MCP Apps](https://modelcontextprotocol.github.io/ext-apps/) on Adobe I/O Runtime. Create AI tools with interactive widgets that render in any MCP-compatible host (Claude, Cursor, etc.).

This template uses the **official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)** and supports the [MCP Apps extension](https://modelcontextprotocol.github.io/ext-apps/api/documents/Overview.html) for delivering interactive UIs alongside tool results.

## Quick Start

```bash
npm install
npm test
npm run deploy
```

## How It Works

1. Each **action** is a directory in `server/actions/` containing an `index.js` (tool definition) and an optional `widget.html` (interactive UI).
2. The **loader** auto-discovers actions at build time and registers them as MCP tools. Actions with `widget.html` also get a `ui://` resource registered automatically.
3. Hosts that support MCP Apps render the widget in a sandboxed iframe. Hosts that don't still get the text response. This is **progressive enhancement**.

See [TEMPLATE-FEATURES.md](./TEMPLATE-FEATURES.md) for full documentation on the action convention, widget configuration, and project structure.
