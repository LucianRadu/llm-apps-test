# Test Suite

Tests for the MCP Apps server on Adobe I/O Runtime. Uses [Jest](https://jestjs.io/) to validate action discovery, tool registration, widget resource serving, and MCP protocol compliance.

## Running Tests

```bash
npm test
```

Watch mode (re-run on file changes):

```bash
npm run test:watch
```

## Test Structure

### `server.test.js`

Main test suite for the MCP Apps server. Covers:

| Suite | Description |
|-------|-------------|
| **Health Check** | GET `/` returns JSON health status (status, server name, version) |
| **CORS Support** | OPTIONS preflight returns correct `Access-Control-*` headers |
| **MCP Protocol** | `initialize` handshake, `tools/list` discovery, tool metadata (`_meta.ui` for widgets) |
| **Tool Calls** | `tools/call` for echo, calculator, weather; error handling for unknown tools |
| **Widget Resources** | `resources/list` and `resources/read` for `ui://weather/widget.html`; `prefersBorder` metadata |
| **Error Handling** | Invalid JSON body (500), unsupported HTTP method (405) |

### `jest.setup.js`

- Sets Jest timeout to 30 seconds for I/O Runtime tests
- Mocks `@adobe/aio-sdk` Logger
- Defines global helpers: `createMockMcpRequest`, `createMockI18nParams`

### `html-transform.js`

Jest transform that loads `.html` files as raw strings (mirrors webpack's asset/source behavior). Used when actions import widget HTML.

## Tested Tools

- **echo** — Returns the input message (no widget)
- **calculator** — Evaluates math expressions (no widget)
- **weather** — Returns weather data with `structuredContent` for the weather widget
