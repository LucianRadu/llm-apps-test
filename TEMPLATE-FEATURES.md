# MCP Apps Template Features

Production-ready **MCP Apps** boilerplate for Adobe I/O Runtime. Build AI tools with interactive widgets that render in any MCP-compatible host (Claude, Cursor, etc.).

## Core Concept

This repo **is** the app. An app has multiple **actions**. Each action is a **tool** with an optional **widget** (interactive UI rendered in a sandboxed iframe).

## Architecture

- **MCP v2024-11-05** compliance with JSON-RPC 2.0
- **Streamable HTTP** transport for serverless environments
- **Official MCP SDK** integration with type-safe Zod schemas
- **MCP Apps** support: tools can deliver interactive UIs to hosts via `ui://` resources
- **Progressive enhancement**: all tools return text for any client; widget-enabled hosts get the rich UI too

## Built-in Example Actions

### Echo (tool only)
Test connectivity and debugging with message echo functionality.

### Calculator (tool only)
Mathematical expression evaluation with configurable output formats (decimal, scientific, fraction).
**Note**: Uses `eval()` -- replace with proper math parser for production.

### Weather (tool + widget)
Mock weather API with an interactive weather card widget. Demonstrates:
- `content` (concise text for LLM) and `structuredContent` (rich data for widget)
- Widget-to-server communication via `tools/call` (refresh button)
- Host theme integration via CSS custom properties
- MCP Apps metadata: visibility, CSP, permissions, border preference

## Action Convention

Each action lives in `server/actions/<name>/`:

| File | Required | Purpose |
|------|----------|---------|
| `index.js` | Yes | Exports `name`, `description`, `schema`, `handler` |
| `widget.html` | No | Self-contained HTML rendered in host iframe |

### Tool-only action

```javascript
const { z } = require('zod')

module.exports = {
    name: 'echo',
    description: 'Echoes back a message.',
    schema: { message: z.string() },
    handler: async ({ message }) => ({
        content: [{ type: 'text', text: `Echo: ${message}` }]
    })
}
```

### Action with widget

When `widget.html` exists alongside `index.js`, the loader automatically registers a `ui://` resource and links it to the tool via `_meta.ui.resourceUri`.

```javascript
module.exports = {
    name: 'weather',
    description: 'Get weather info.',
    schema: { city: z.string() },
    handler: async ({ city }) => ({
        content: [{ type: 'text', text: `Weather for ${city}: ...` }],
        structuredContent: { city, temperature: 22, ... }
    }),

    // Optional widget configuration
    widget: {
        visibility: ['model', 'app'],
        csp: { connectDomains: [], resourceDomains: [], frameDomains: [], baseUriDomains: [] },
        permissions: { camera: {}, microphone: {}, geolocation: {}, clipboardWrite: {} },
        domain: undefined,
        prefersBorder: true
    }
}
```

### Widget Configuration Reference

All fields in the `widget` object are optional. The loader applies sensible defaults.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `visibility` | `string[]` | `['model', 'app']` | Who can see/call the tool. `'model'` = LLM, `'app'` = widget |
| `csp.connectDomains` | `string[]` | `[]` | Allowed origins for fetch/XHR/WebSocket |
| `csp.resourceDomains` | `string[]` | `[]` | Allowed origins for scripts, styles, images |
| `csp.frameDomains` | `string[]` | `[]` | Allowed origins for nested iframes |
| `csp.baseUriDomains` | `string[]` | `[]` | Allowed base URI origins |
| `permissions.camera` | `object` | -- | Request camera access |
| `permissions.microphone` | `object` | -- | Request microphone access |
| `permissions.geolocation` | `object` | -- | Request geolocation access |
| `permissions.clipboardWrite` | `object` | -- | Request clipboard write access |
| `domain` | `string` | -- | Dedicated sandbox origin for OAuth/CORS |
| `prefersBorder` | `boolean` | -- | Request visible border around widget |

## content vs. structuredContent

| | `content` | `structuredContent` |
|---|-----------|---------------------|
| **Who consumes it** | LLM / text-only hosts | Widget (iframe) |
| **Format** | `[{ type: 'text', text: '...' }]` | Arbitrary JSON |
| **Token cost** | Counts against context window | Zero (not sent to LLM) |
| **Purpose** | Concise summary for AI reasoning | Rich data for UI rendering |

## Project Structure

```
your-mcp-app/
├── server/                    # MCP server (one I/O Runtime action)
│   ├── index.js               # Entry point, request routing
│   ├── loader.js              # Auto-discovers actions, registers tools + widgets
│   └── actions/               # Each subdirectory is an action
│       ├── echo/
│       │   └── index.js       # Tool only
│       ├── calculator/
│       │   └── index.js       # Tool only
│       └── weather/
│           ├── index.js       # Tool + widget config
│           └── widget.html    # Interactive UI
├── test/
│   ├── jest.setup.js
│   ├── html-transform.js
│   └── server.test.js
├── app.config.yaml            # I/O Runtime config
├── webpack.config.js          # Build (entry: server/index.js)
├── jest.config.js             # Test config
└── package.json
```

## Development Stack

- **Build**: Webpack with `asset/source` for inlining widget HTML
- **Testing**: Jest with HTML transform and Adobe I/O mocks
- **Quality**: ESLint + Prettier with security rules
- **Deployment**: Adobe I/O CLI integration

## Quick Start

```bash
npm install         # Install dependencies
npm test           # Run tests
npm run dev         # Local development
npm run deploy     # Deploy to I/O Runtime
```

## Adding a New Action

1. Create `server/actions/your-action/index.js` with `name`, `description`, `schema`, `handler`
2. (Optional) Add `server/actions/your-action/widget.html` for an interactive UI
3. (Optional) Export a `widget` config object from `index.js` for CSP, permissions, etc.
4. The loader discovers it automatically -- no registration boilerplate needed

## Security & Performance

- **Serverless optimized**: Stateless design, fresh server per request
- **CORS enabled**: Ready for browser clients
- **Input validation**: Zod schema enforcement
- **Widget sandboxing**: Iframes with configurable CSP and permissions
- **Monitoring**: Adobe I/O Logger integration

## Compatibility

Works with any MCP-compliant client. Widget-enabled hosts (Claude, Cursor, etc.) render the interactive UI. All other hosts still receive the text response -- progressive enhancement.
