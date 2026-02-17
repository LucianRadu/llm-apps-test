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
 * Action Loader for MCP Apps
 *
 * Discovers actions from the actions/ directory and registers them with the MCP server.
 * Each action is a directory containing an index.js (tool definition) and an optional
 * widget.html (interactive UI). When widget.html is present, the loader registers both
 * the tool (with _meta.ui metadata) and a ui:// resource (the HTML widget).
 *
 * Convention:
 *   actions/<name>/index.js   -> required: { name, description, schema, handler }
 *   actions/<name>/widget.html -> optional: self-contained HTML rendered in host iframe
 *   actions/<name>/index.js widget export -> optional: { visibility, csp, permissions, domain, prefersBorder }
 */

const fs = require('fs')
const path = require('path')

const RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app'

/**
 * Build clean _meta.ui object for the resource content, omitting undefined fields.
 */
function buildResourceMeta (widgetConfig) {
    if (!widgetConfig) return undefined

    const ui = {}
    if (widgetConfig.csp) ui.csp = widgetConfig.csp
    if (widgetConfig.permissions) ui.permissions = widgetConfig.permissions
    if (widgetConfig.domain !== undefined) ui.domain = widgetConfig.domain
    if (widgetConfig.prefersBorder !== undefined) ui.prefersBorder = widgetConfig.prefersBorder

    return Object.keys(ui).length > 0 ? { ui } : undefined
}

/**
 * Register a plain tool (no widget) with the MCP server.
 */
function registerPlainTool (server, action) {
    server.tool(action.name, action.description, action.schema, action.handler)
}

/**
 * Register a widget-enabled action with the MCP server.
 * This registers both the tool (with _meta.ui) and the ui:// resource.
 */
function registerWidgetAction (server, action, widgetHtml) {
    const resourceUri = `ui://${action.name}/widget.html`
    const widgetConfig = action.widget || {}

    // Build tool _meta with UI linkage
    const toolMeta = {
        ui: {
            resourceUri
        },
        'ui/resourceUri': resourceUri // legacy key for older host compatibility
    }

    // Add optional visibility
    if (widgetConfig.visibility) {
        toolMeta.ui.visibility = widgetConfig.visibility
    }

    // Register tool with UI metadata using registerTool (lower-level API)
    server.registerTool(action.name, {
        description: action.description,
        inputSchema: action.schema,
        _meta: toolMeta
    }, action.handler)

    // Build resource _meta.ui from widget config
    const resourceMeta = buildResourceMeta(widgetConfig)

    // Register the widget HTML as a ui:// resource
    server.registerResource(
        `${action.name}-widget`,
        resourceUri,
        { mimeType: RESOURCE_MIME_TYPE },
        async () => ({
            contents: [{
                uri: resourceUri,
                mimeType: RESOURCE_MIME_TYPE,
                text: widgetHtml,
                ...(resourceMeta ? { _meta: resourceMeta } : {})
            }]
        })
    )
}

/**
 * Load all actions from the actions/ directory and register them with the MCP server.
 *
 * Uses webpack's require.context at build time, with a fs-based fallback for Jest.
 *
 * @param {McpServer} server - The MCP server instance
 * @param {string} actionsDir - Directory containing action subdirectories
 */
function loadActions (server, actionsDir) {
    try {
        // Webpack build path: use require.context for static bundling
        const moduleContext = require.context('./actions', true, /index\.js$/)
        const htmlContext = require.context('./actions', true, /widget\.html$/)

        // Build a map of available widget HTML strings keyed by action directory
        const widgetMap = {}
        for (const key of htmlContext.keys()) {
            // key format: "./weather/widget.html" -> extract "weather"
            const actionName = key.split('/')[1]
            widgetMap[actionName] = htmlContext(key)
        }

        const modules = moduleContext.keys()
        console.log(`Loading ${modules.length} action(s)`)

        for (const key of modules) {
            try {
                const action = moduleContext(key)
                // key format: "./echo/index.js" -> extract "echo"
                const dirName = key.split('/')[1]

                if (!validateAction(action, key)) continue

                const widgetHtml = widgetMap[dirName]

                if (widgetHtml) {
                    registerWidgetAction(server, action, widgetHtml)
                    console.log(`  ✓ Loaded action: ${action.name} (tool + widget)`)
                } else {
                    registerPlainTool(server, action)
                    console.log(`  ✓ Loaded action: ${action.name} (tool only)`)
                }
            } catch (error) {
                console.error(`Error loading action from ${key}:`, error.message)
            }
        }
    } catch (error) {
        // Fallback: fs-based loading for non-webpack environments (Jest, local dev)
        loadActionsFromFs(server, actionsDir)
    }
}

/**
 * Filesystem-based action loading (used in Jest tests and local development).
 */
function loadActionsFromFs (server, actionsDir) {
    if (!fs.existsSync(actionsDir)) {
        console.warn(`Actions directory not found: ${actionsDir}`)
        return
    }

    const dirs = fs.readdirSync(actionsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)

    console.log(`Loading ${dirs.length} action(s) from ${actionsDir}`)

    for (const dirName of dirs) {
        try {
            const indexPath = path.join(actionsDir, dirName, 'index.js')
            if (!fs.existsSync(indexPath)) {
                console.warn(`Skipping ${dirName}: no index.js found`)
                continue
            }

            const action = require(indexPath)

            if (!validateAction(action, dirName)) continue

            // Check for widget.html
            const widgetPath = path.join(actionsDir, dirName, 'widget.html')
            const hasWidget = fs.existsSync(widgetPath)

            if (hasWidget) {
                const widgetHtml = fs.readFileSync(widgetPath, 'utf-8')
                registerWidgetAction(server, action, widgetHtml)
                console.log(`  ✓ Loaded action: ${action.name} (tool + widget)`)
            } else {
                registerPlainTool(server, action)
                console.log(`  ✓ Loaded action: ${action.name} (tool only)`)
            }
        } catch (error) {
            console.error(`Error loading action from ${dirName}:`, error.message)
        }
    }
}

/**
 * Validate that an action module has the required exports.
 */
function validateAction (action, source) {
    if (!action.name || typeof action.name !== 'string') {
        console.warn(`Skipping ${source}: missing or invalid 'name' property`)
        return false
    }
    if (!action.description || typeof action.description !== 'string') {
        console.warn(`Skipping ${source}: missing or invalid 'description' property`)
        return false
    }
    if (!action.schema || typeof action.schema !== 'object') {
        console.warn(`Skipping ${source}: missing or invalid 'schema' property`)
        return false
    }
    if (!action.handler || typeof action.handler !== 'function') {
        console.warn(`Skipping ${source}: missing or invalid 'handler' function`)
        return false
    }
    return true
}

module.exports = {
    loadActions,
    RESOURCE_MIME_TYPE
}
