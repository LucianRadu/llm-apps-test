/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Test suite for MCP Apps Server
 *
 * Tests action discovery, tool registration, widget resource serving,
 * and MCP protocol compliance.
 */

const { main } = require('../server/index.js')

// Helper to make MCP POST requests
function mcpPost (body) {
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

describe('MCP Apps Server', () => {
    // --- Health Check ---

    describe('Health Check', () => {
        test('should respond to GET with health status', async () => {
            const result = await main({
                __ow_method: 'get',
                __ow_path: '/',
                LOG_LEVEL: 'info'
            })

            expect(result.statusCode).toBe(200)
            expect(result.headers['Content-Type']).toBe('application/json')

            const body = JSON.parse(result.body)
            expect(body.status).toBe('healthy')
            expect(body.server).toBe('llm-apps-poc')
            expect(body.version).toBe('1.0.0')
        })
    })

    // --- CORS ---

    describe('CORS Support', () => {
        test('should handle OPTIONS for CORS preflight', async () => {
            const result = await main({
                __ow_method: 'options',
                LOG_LEVEL: 'info'
            })

            expect(result.statusCode).toBe(200)
            expect(result.headers['Access-Control-Allow-Origin']).toBe('*')
            expect(result.headers['Access-Control-Allow-Methods']).toContain('POST')
        })
    })

    // --- MCP Protocol ---

    describe('MCP Protocol', () => {
        test('should handle initialize request', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: '2024-11-05',
                    capabilities: {},
                    clientInfo: { name: 'test-client', version: '1.0.0' }
                }
            })

            expect(result.statusCode).toBe(200)
            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.id).toBe(1)
            expect(body.result.protocolVersion).toBe('2024-11-05')
            expect(body.result.serverInfo.name).toBe('llm-apps-poc')
        })

        test('should list all actions as tools', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/list',
                params: {}
            })

            expect(result.statusCode).toBe(200)
            const body = JSON.parse(result.body)
            expect(body.result.tools).toBeDefined()

            const toolNames = body.result.tools.map(t => t.name)
            expect(toolNames).toContain('echo')
            expect(toolNames).toContain('calculator')
            expect(toolNames).toContain('weather')
            expect(toolNames).toHaveLength(3)
        })

        test('weather tool should have _meta.ui linking to widget resource', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 3,
                method: 'tools/list',
                params: {}
            })

            const body = JSON.parse(result.body)
            const weatherTool = body.result.tools.find(t => t.name === 'weather')
            expect(weatherTool).toBeDefined()

            // Check _meta.ui.resourceUri
            expect(weatherTool._meta).toBeDefined()
            expect(weatherTool._meta.ui).toBeDefined()
            expect(weatherTool._meta.ui.resourceUri).toBe('ui://weather/widget.html')

            // Check legacy key
            expect(weatherTool._meta['ui/resourceUri']).toBe('ui://weather/widget.html')

            // Check visibility
            expect(weatherTool._meta.ui.visibility).toEqual(['model', 'app'])
        })

        test('echo and calculator tools should NOT have _meta.ui', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 4,
                method: 'tools/list',
                params: {}
            })

            const body = JSON.parse(result.body)
            const echoTool = body.result.tools.find(t => t.name === 'echo')
            const calcTool = body.result.tools.find(t => t.name === 'calculator')

            // Plain tools should not have UI metadata
            expect(echoTool._meta?.ui?.resourceUri).toBeUndefined()
            expect(calcTool._meta?.ui?.resourceUri).toBeUndefined()
        })
    })

    // --- Tool Calls ---

    describe('Tool Calls', () => {
        test('echo tool should return echoed message', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 10,
                method: 'tools/call',
                params: { name: 'echo', arguments: { message: 'Hello, test!' } }
            })

            expect(result.statusCode).toBe(200)
            const body = JSON.parse(result.body)
            expect(body.result.content[0].text).toContain('Hello, test!')
        })

        test('calculator tool should evaluate expressions', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 11,
                method: 'tools/call',
                params: { name: 'calculator', arguments: { expression: '2 + 3 * 4' } }
            })

            expect(result.statusCode).toBe(200)
            const body = JSON.parse(result.body)
            expect(body.result.content[0].text).toContain('14')
        })

        test('weather tool should return content and structuredContent', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 12,
                method: 'tools/call',
                params: { name: 'weather', arguments: { city: 'San Francisco' } }
            })

            expect(result.statusCode).toBe(200)
            const body = JSON.parse(result.body)

            // Should have text content for LLM
            expect(body.result.content).toBeDefined()
            expect(body.result.content[0].text).toContain('Weather for San Francisco')
            expect(body.result.content[0].text).toContain('Temperature:')
            expect(body.result.content[0].text).toContain('°C')

            // Should have structuredContent for widget
            expect(body.result.structuredContent).toBeDefined()
            expect(body.result.structuredContent.city).toBe('San Francisco')
            expect(typeof body.result.structuredContent.temperature).toBe('number')
            expect(typeof body.result.structuredContent.humidity).toBe('number')
            expect(typeof body.result.structuredContent.windSpeed).toBe('number')
        })

        test('unknown tool should return error', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 13,
                method: 'tools/call',
                params: { name: 'nonexistent_tool', arguments: {} }
            })

            expect(result.statusCode).toBe(200)
            const body = JSON.parse(result.body)
            expect(body.result.isError).toBe(true)
            expect(body.result.content[0].text).toContain('Tool nonexistent_tool not found')
        })
    })

    // --- Widget Resources ---

    describe('Widget Resources', () => {
        test('should list widget resources', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 20,
                method: 'resources/list',
                params: {}
            })

            expect(result.statusCode).toBe(200)
            const body = JSON.parse(result.body)
            expect(body.result.resources).toBeDefined()

            const weatherResource = body.result.resources.find(
                r => r.uri === 'ui://weather/widget.html'
            )
            expect(weatherResource).toBeDefined()
            expect(weatherResource.mimeType).toBe('text/html;profile=mcp-app')
        })

        test('should serve widget HTML via resources/read', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 21,
                method: 'resources/read',
                params: { uri: 'ui://weather/widget.html' }
            })

            expect(result.statusCode).toBe(200)
            const body = JSON.parse(result.body)
            expect(body.result.contents).toBeDefined()
            expect(body.result.contents.length).toBe(1)

            const content = body.result.contents[0]
            expect(content.uri).toBe('ui://weather/widget.html')
            expect(content.mimeType).toBe('text/html;profile=mcp-app')
            expect(content.text).toContain('<!DOCTYPE html>')
            expect(content.text).toContain('McpApp')
            expect(content.text).toContain('Weather Widget')
        })

        test('widget resource should include _meta.ui with prefersBorder', async () => {
            const result = await mcpPost({
                jsonrpc: '2.0',
                id: 22,
                method: 'resources/read',
                params: { uri: 'ui://weather/widget.html' }
            })

            const body = JSON.parse(result.body)
            const content = body.result.contents[0]
            expect(content._meta).toBeDefined()
            expect(content._meta.ui).toBeDefined()
            expect(content._meta.ui.prefersBorder).toBe(true)
        })
    })

    // --- Error Handling ---

    describe('Error Handling', () => {
        test('should handle invalid JSON body', async () => {
            const result = await main({
                __ow_method: 'post',
                __ow_body: 'invalid json',
                __ow_headers: {
                    'content-type': 'application/json',
                    accept: 'application/json;q=1.0, text/event-stream;q=0.5'
                },
                LOG_LEVEL: 'info'
            })

            expect(result.statusCode).toBe(500)
            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.error).toBeDefined()
        })

        test('should reject unsupported HTTP method', async () => {
            const result = await main({
                __ow_method: 'put',
                LOG_LEVEL: 'info'
            })

            expect(result.statusCode).toBe(405)
        })
    })
})
