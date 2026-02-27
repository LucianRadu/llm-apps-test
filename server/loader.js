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
 * Each action is a directory containing an index.js (handler) and an optional widget.html.
 *
 * Widget resolution priority:
 *   1. widget.html file in the action directory (self-contained HTML)
 *   2. EDS config in experiences.json (auto-generates aem-embed template)
 *   3. Tool-only (no widget)
 *
 * Supported export shapes:
 *   - Function:           module.exports = async (args) => ({ ... })
 *   - Object w/ handler:  module.exports = { handler: async (args) => ({ ... }) }
 *   - Object w/ schema:   module.exports = { schema: { ... }, handler: async (args) => ({ ... }) }
 *
 * Metadata (description, inputSchema, annotations, tool_meta, resource_meta) comes from
 * experiences.json (local dev) or the DB (production via repo-deploy). An inline `schema`
 * export is used as fallback when experiences.json doesn't provide inputSchema.
 *
 * Convention:
 *   actions/<name>/index.js   -> required: handler function
 *   actions/<name>/widget.html -> optional: self-contained HTML rendered in host iframe
 */

const fs = require('fs')
const path = require('path')
const { z } = require('zod')

const RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app'

/**
 * Normalize an action module into { handler, schema? } regardless of export shape.
 */
function normalizeAction (mod) {
    if (typeof mod === 'function') return { handler: mod }
    if (mod && typeof mod.handler === 'function') return mod
    if (mod && typeof mod.default === 'function') return { handler: mod.default }
    if (mod && mod.default && typeof mod.default.handler === 'function') return mod.default
    return null
}

/**
 * Validate that a normalized action has the required exports.
 */
function validateAction (mod, source) {
    const action = normalizeAction(mod)
    if (!action) {
        console.warn(`Skipping ${source}: must export a function, { handler }, or { schema, handler }`)
        return false
    }
    return true
}

/**
 * Convert a JSON Schema property to its Zod equivalent.
 * Handles the common types used in MCP tool input schemas.
 */
function jsonSchemaPropertyToZod (prop, isRequired) {
    let zodType
    if (prop.enum) {
        zodType = z.enum(prop.enum)
    } else {
        switch (prop.type) {
        case 'string':
            zodType = z.string()
            break
        case 'number':
            zodType = z.number()
            break
        case 'integer':
            zodType = z.number().int()
            break
        case 'boolean':
            zodType = z.boolean()
            break
        case 'array':
            zodType = z.array(z.any())
            break
        default:
            zodType = z.any()
        }
    }
    if (prop.description) zodType = zodType.describe(prop.description)
    if (!isRequired) zodType = zodType.optional()
    return zodType
}

/**
 * Convert a JSON Schema object to a Zod raw shape suitable for registerTool().
 * Returns undefined if the schema can't be converted.
 */
function jsonSchemaToZodShape (jsonSchema) {
    if (!jsonSchema || jsonSchema.type !== 'object' || !jsonSchema.properties) {
        return undefined
    }
    const required = new Set(jsonSchema.required || [])
    const shape = {}
    for (const [key, prop] of Object.entries(jsonSchema.properties)) {
        shape[key] = jsonSchemaPropertyToZod(prop, required.has(key))
    }
    return shape
}

/**
 * Build clean _meta.ui object for the resource content, omitting undefined fields.
 */
function buildResourceMeta (resourceMeta) {
    if (!resourceMeta) return undefined

    const ui = {}
    const src = resourceMeta.ui || resourceMeta
    if (src.csp) ui.csp = src.csp
    if (src.permissions) ui.permissions = src.permissions
    if (src.domain !== undefined) ui.domain = src.domain
    if (src.prefersBorder !== undefined) ui.prefersBorder = src.prefersBorder

    return Object.keys(ui).length > 0 ? { ui } : undefined
}

/**
 * Generate widget HTML for an EDS (Edge Delivery Services) action.
 * Produces a minimal template that loads aem-embed.js and renders AEM content.
 * Returns null if the config is missing required URLs.
 */
function generateEdsWidgetHtml (config) {
    if (config?.widget_type !== 'EDS') return null

    const edsWidget = config.eds_widget
    if (!edsWidget?.script_url || !edsWidget?.widget_embed_url) {
        if (config.widget_type === 'EDS') {
            console.warn(`  ⚠ EDS widget for "${config.name}": missing script_url or widget_embed_url in eds_widget config`)
        }
        return null
    }

    return `<script src="${edsWidget.script_url}" type="module"></script>\n<div>\n    <aem-embed url="${edsWidget.widget_embed_url}"></aem-embed>\n</div>\n`
}

/**
 * Register a single action with the MCP server.
 * Uses registerTool() for all actions (unified path).
 */
function registerAction (server, name, action, widgetHtml, config) {
    const toolMeta = {}

    // Schema precedence: experiences.json inputSchema (JSON Schema) > inline schema export (Zod) > none
    let inputSchema
    if (config?.inputSchema) {
        inputSchema = jsonSchemaToZodShape(config.inputSchema)
    } else if (action.schema) {
        inputSchema = action.schema
    }

    if (widgetHtml) {
        const resourceUri = `ui://${name}/widget.html`
        const resourceMeta = buildResourceMeta(config?.resource_meta)

        server.registerResource(
            `${name}-widget`,
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

        // MCP Apps keys
        toolMeta.ui = { resourceUri, ...(config?.tool_meta?.ui || {}) }
        toolMeta['ui/resourceUri'] = resourceUri

        // OpenAI keys (always emit for dual-host compatibility)
        toolMeta['openai/outputTemplate'] = resourceUri
        toolMeta['openai/resultCanProduceWidget'] = true
    }

    // Merge any additional tool_meta from config
    if (config?.tool_meta) {
        for (const [key, value] of Object.entries(config.tool_meta)) {
            if (key !== 'ui') {
                toolMeta[key] = value
            }
        }
    }

    server.registerTool(name, {
        title: config?.title || name,
        description: config?.description || name,
        inputSchema,
        annotations: config?.annotations || undefined,
        _meta: Object.keys(toolMeta).length > 0 ? toolMeta : undefined
    }, action.handler)
}

/**
 * Load experiences config from experiences.json, keyed by action name.
 */
function loadExperiencesConfig (actionsDir) {
    const configPath = path.resolve(actionsDir, '..', 'experiences.json')
    try {
        if (fs.existsSync(configPath)) {
            const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
            const map = {}
            for (const exp of raw.experiences || []) {
                if (exp.name) map[exp.name] = exp
            }
            console.log(`Loaded experiences.json with ${Object.keys(map).length} experience(s)`)
            return map
        }
    } catch (e) {
        console.warn('Failed to load experiences.json:', e.message)
    }
    return {}
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
        const moduleContext = require.context('../actions', true, /index\.js$/)
        const htmlContext = require.context('../actions', true, /widget\.html$/)

        // Load bundled experiences config (webpack resolves at build time).
        // In production deploys, repo-deploy generates experiences.json from DB
        // before building, so the bundled config has full metadata.
        let experiencesConfig = {}
        try {
            const rawConfig = require('../experiences.json')
            for (const exp of rawConfig.experiences || []) {
                if (exp.name) experiencesConfig[exp.name] = exp
            }
            if (Object.keys(experiencesConfig).length > 0) {
                console.log(`Loaded bundled experiences config with ${Object.keys(experiencesConfig).length} experience(s)`)
            }
        } catch (e) { /* empty or not bundled */ }

        const widgetMap = {}
        for (const key of htmlContext.keys()) {
            const actionName = key.split('/')[1]
            widgetMap[actionName] = htmlContext(key)
        }

        const modules = moduleContext.keys()
        console.log(`Loading ${modules.length} action(s)`)

        for (const key of modules) {
            try {
                const mod = moduleContext(key)
                const dirName = key.split('/')[1]

                if (!validateAction(mod, key)) continue

                const action = normalizeAction(mod)
                const config = experiencesConfig[dirName]
                const widgetHtml = widgetMap[dirName] || generateEdsWidgetHtml(config)

                registerAction(server, dirName, action, widgetHtml, config)

                if (widgetMap[dirName]) {
                    console.log(`  ✓ Loaded action: ${dirName} (tool + widget)`)
                } else if (widgetHtml) {
                    console.log(`  ✓ Loaded action: ${dirName} (tool + EDS widget)`)
                } else {
                    console.log(`  ✓ Loaded action: ${dirName} (tool only)`)
                }
            } catch (error) {
                console.error(`Error loading action from ${key}:`, error.message)
            }
        }
    } catch (error) {
        // Fallback: fs-based loading for non-webpack environments (Jest, local dev)
        const experiencesConfig = loadExperiencesConfig(actionsDir)
        loadActionsFromFs(server, actionsDir, experiencesConfig)
    }
}

/**
 * Filesystem-based action loading (used in Jest tests and local development).
 */
function loadActionsFromFs (server, actionsDir, experiencesConfig) {
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

            const mod = require(indexPath)

            if (!validateAction(mod, dirName)) continue

            const action = normalizeAction(mod)
            const config = experiencesConfig[dirName]

            // Widget resolution: widget.html file > EDS config > tool-only
            const widgetPath = path.join(actionsDir, dirName, 'widget.html')
            const hasWidgetFile = fs.existsSync(widgetPath)

            if (hasWidgetFile) {
                const widgetHtml = fs.readFileSync(widgetPath, 'utf-8')
                registerAction(server, dirName, action, widgetHtml, config)
                console.log(`  ✓ Loaded action: ${dirName} (tool + widget)`)
            } else {
                const edsHtml = generateEdsWidgetHtml(config)
                registerAction(server, dirName, action, edsHtml, config)
                if (edsHtml) {
                    console.log(`  ✓ Loaded action: ${dirName} (tool + EDS widget)`)
                } else {
                    console.log(`  ✓ Loaded action: ${dirName} (tool only)`)
                }
            }
        } catch (error) {
            console.error(`Error loading action from ${dirName}:`, error.message)
        }
    }
}

module.exports = {
    loadActions,
    generateEdsWidgetHtml,
    RESOURCE_MIME_TYPE
}
