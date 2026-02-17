# Test Suite

Comprehensive test suite for the **MCP Apps server** running on Adobe I/O Runtime. Uses [Jest](https://jestjs.io/) to validate action discovery, tool registration, widget resource serving, and MCP (Model Context Protocol) compliance.

---

## Overview

The test suite exercises the server's HTTP interface and MCP JSON-RPC handlers without deploying to I/O Runtime. Tests invoke the `main` function directly with simulated `__ow_*` parameters, mirroring the request shape produced by Adobe I/O Runtime when an action is invoked.

---

## Prerequisites

- **Node.js** ≥ 18.19.0
- Project dependencies installed (`npm install`)

---

## Running Tests

### One-time run

```bash
npm test
```

Runs all tests in `test/**/*.test.js` and `test/**/*.spec.js`, then exits.

### Watch mode (re-run on file changes)

```bash
npm run test:watch
```

Useful during development: Jest watches for changes and re-runs affected tests automatically.

### Coverage report

Coverage is collected by default. After `npm test`, reports are written to:

- **Terminal** — summary with percentages
- **`coverage/`** — `lcov` and `html` reports

To open the HTML coverage report:

```bash
open coverage/lcov-report/index.html
```

---

## Test Structure

### `server.test.js`

Main test suite for the MCP Apps server. Contains six top-level `describe` blocks:

| Suite | Tests | Description |
|-------|-------|-------------|
| **Health Check** | 1 | GET `/` returns JSON health status (`status`, `server`, `version`) |
| **CORS Support** | 1 | OPTIONS preflight returns correct `Access-Control-Allow-Origin` and `Access-Control-Allow-Methods` headers |
| **MCP Protocol** | 4 | `initialize` handshake, `tools/list` discovery, tool metadata (`_meta.ui` for widgets), and absence of UI metadata on plain tools |
| **Tool Calls** | 4 | `tools/call` for echo, calculator, weather; error handling for unknown tools |
| **Widget Resources** | 3 | `resources/list` and `resources/read` for `ui://weather/widget.html`; `prefersBorder` metadata |
| **Error Handling** | 2 | Invalid JSON body (500), unsupported HTTP method (405) |

#### Test details

**Health Check**

- Asserts `statusCode` 200, `Content-Type: application/json`
- Verifies `status: 'healthy'`, `server: 'llm-apps-poc'`, `version: '1.0.0'`

**CORS Support**

- Asserts `Access-Control-Allow-Origin: *` and that `Access-Control-Allow-Methods` includes `POST`

**MCP Protocol**

- **initialize** — Validates JSON-RPC 2.0 response, protocol version `2024-11-05`, and `serverInfo.name`
- **tools/list** — Ensures exactly three tools: `echo`, `calculator`, `weather`
- **weather tool metadata** — Checks `_meta.ui.resourceUri` (`ui://weather/widget.html`), legacy `_meta['ui/resourceUri']`, and `visibility: ['model', 'app']`
- **echo/calculator** — Confirms these tools do *not* have `_meta.ui` (no widget)

**Tool Calls**

- **echo** — Passes `message: 'Hello, test!'`, expects echoed text in `content[0].text`
- **calculator** — Passes `expression: '2 + 3 * 4'`, expects `14` in response
- **weather** — Passes `city: 'San Francisco'`, expects text content (e.g. "Weather for San Francisco", "Temperature:", "°C") and `structuredContent` with `city`, `temperature`, `humidity`, `windSpeed`
- **unknown tool** — Passes `nonexistent_tool`, expects `isError: true` and error message

**Widget Resources**

- **resources/list** — Ensures `ui://weather/widget.html` exists with `mimeType: 'text/html;profile=mcp-app'`
- **resources/read** — Fetches widget HTML, asserts `<!DOCTYPE html>`, `McpApp`, `Weather Widget`
- **prefersBorder** — Verifies `_meta.ui.prefersBorder === true` on the resource content

**Error Handling**

- **Invalid JSON** — Sends `__ow_body: 'invalid json'`, expects 500 and JSON-RPC `error` object
- **Unsupported method** — Sends `__ow_method: 'put'`, expects 405

---

## Configuration Files

### `jest.config.js` (project root)

- **testEnvironment**: `node`
- **testMatch**: `**/test/**/*.test.js`, `**/test/**/*.spec.js`
- **collectCoverage**: `true` — coverage from `server/**/*.js` (excludes `dist/`, `node_modules/`)
- **setupFilesAfterEnv**: `test/jest.setup.js`
- **testTimeout**: 30 seconds (for I/O Runtime–style tests)
- **transform**: `babel-jest` for `.js`, custom transform for `.html` (see below)

### `jest.setup.js`

- Sets Jest timeout to 30 seconds
- Mocks `@adobe/aio-sdk` Logger (info, debug, warn, error)
- Defines global helpers:
  - `createMockMcpRequest(method, params, id)` — builds JSON-RPC request object
  - `createMockI18nParams(body, method)` — builds `__ow_*` params for `main`
- Optional: commented-out console mock to reduce test output noise

### `html-transform.js`

Jest transform for `.html` files. Loads HTML as a raw string (via `JSON.stringify`), mirroring webpack's `asset/source` behavior. Used when actions import widget HTML templates.

---

## Test Helpers

The suite uses a local `mcpPost(body)` helper to send MCP POST requests:

```javascript
function mcpPost(body) {
    return main({
        __ow_method: 'post',
        __ow_body: JSON.stringify(body),
        __ow_headers: {
            'content-type': 'application/json',
            accept: 'application/json;q=1.0, text/event-stream;q=0.5'
        },
        LOG_LEVEL: 'info'
    })
}
```

For non-POST requests (GET, OPTIONS, PUT), tests call `main()` directly with `__ow_method` and other params.

---

## Tested Tools

| Tool | Arguments | Widget | Description |
|------|-----------|--------|--------------|
| **echo** | `message` | No | Returns the input message as-is |
| **calculator** | `expression` | No | Evaluates math expressions (e.g. `2 + 3 * 4` → `14`) |
| **weather** | `city` | Yes (`ui://weather/widget.html`) | Returns weather data with `structuredContent` for the weather widget; includes `_meta.ui` with `resourceUri` and `visibility` |

---

## Adding New Tests

1. Add a new `describe` or `test` in `server.test.js`, or create `test/<name>.test.js`.
2. Use `mcpPost(body)` for MCP JSON-RPC requests, or `main({ __ow_method, ... })` for raw HTTP.
3. Assert on `result.statusCode`, `result.headers`, and `JSON.parse(result.body)`.
4. Run `npm test` or `npm run test:watch` to verify.

---

## Troubleshooting

| Issue | Possible cause | Solution |
|-------|----------------|----------|
| Timeout errors | Slow I/O or long-running logic | Increase `testTimeout` in `jest.config.js` or `jest.setup.js` |
| `Logger is not a function` | Unmocked `@adobe/aio-sdk` | Ensure `jest.setup.js` is loaded (check `setupFilesAfterEnv`) |
| HTML import fails | `.html` not transformed | Verify `transform` in `jest.config.js` includes `\\.html$` → `html-transform.js` |
| Coverage missing files | Path exclusions | Check `collectCoverageFrom` in `jest.config.js` |
