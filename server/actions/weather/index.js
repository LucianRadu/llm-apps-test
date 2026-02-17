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

const { z } = require('zod')

/**
 * Weather Action (tool + widget)
 *
 * Get current weather information for any city.
 * This action demonstrates how to build an MCP App -- a tool with an interactive widget.
 *
 * The handler returns both:
 *   - content: concise text for the LLM context (low token cost)
 *   - structuredContent: rich data for the widget UI to render
 *
 * The sibling widget.html is auto-discovered by the loader and registered as a
 * ui:// resource. Hosts that support MCP Apps render the widget in a sandboxed iframe.
 *
 * CUSTOMIZE: Replace mock data with actual API calls (OpenWeatherMap, WeatherAPI.com, etc.)
 */

function generateWeatherData (city) {
    const baseTemp = 18
    const tempVariation = (Math.random() - 0.5) * 20
    const temperature = Math.round((baseTemp + tempVariation) * 10) / 10

    const conditions = [
        'Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain',
        'Scattered Showers', 'Clear', 'Overcast', 'Drizzle'
    ]
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    const humidity = Math.floor(Math.random() * 40) + 40
    const windSpeed = Math.floor(Math.random() * 15) + 5
    const pressure = Math.floor(Math.random() * 30) + 1000
    const visibility = Math.floor(Math.random() * 5) + 10
    const uvIndex = Math.floor(Math.random() * 8) + 1

    return {
        city,
        temperature,
        condition,
        humidity,
        windSpeed,
        pressure,
        visibility,
        uvIndex,
        timestamp: new Date().toISOString(),
        source: 'Mock Weather Service (replace with real API)'
    }
}

function formatWeatherText (data) {
    let text = `Weather for ${data.city}\n`
    text += `Temperature: ${data.temperature}°C\n`
    text += `Conditions: ${data.condition}\n`
    text += `Humidity: ${data.humidity}%\n`
    text += `Wind: ${data.windSpeed} km/h\n`
    text += `Pressure: ${data.pressure} hPa\n`
    text += `Visibility: ${data.visibility} km\n`
    text += `UV Index: ${data.uvIndex}\n`
    text += `\nLast Updated: ${data.timestamp}`
    return text
}

module.exports = {
    name: 'weather',
    description: 'Get current weather information for any city. Demonstrates an MCP App action with an interactive widget.',
    schema: {
        city: z.string().describe('Name of the city to get weather for (e.g., "San Francisco", "New York", "London")')
    },
    handler: async ({ city = 'Unknown City' }) => {
        try {
            const data = generateWeatherData(city)

            return {
                // Concise text for the LLM context (small token footprint)
                content: [
                    {
                        type: 'text',
                        text: formatWeatherText(data)
                    }
                ],
                // Rich data for the widget to render (no token cost)
                structuredContent: data
            }
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Weather Error: Unable to fetch weather data for ${city}. Error: ${error.message}`
                    }
                ]
            }
        }
    },

    // Widget configuration (used by the loader when widget.html is present)
    // All fields are optional -- see TEMPLATE-FEATURES.md for the full reference.
    widget: {
        // Who can see/call this tool. Default: ['model', 'app']
        // 'model' = visible to and callable by the LLM
        // 'app'   = callable by the widget (e.g., refresh button)
        visibility: ['model', 'app'],

        // No external domains needed for this example (all data comes from the tool handler).
        // Uncomment and configure if your widget needs external network access:
        // csp: {
        //     connectDomains: ['https://api.openweathermap.org'],
        //     resourceDomains: [],
        //     frameDomains: [],
        //     baseUriDomains: []
        // },

        // No special browser permissions needed for this example.
        // Uncomment if your widget needs device access:
        // permissions: {
        //     camera: {},
        //     microphone: {},
        //     geolocation: {},
        //     clipboardWrite: {}
        // },

        // Stable sandbox origin for OAuth/CORS (host-dependent format).
        // domain: undefined,

        // Request a visible border around the widget.
        prefersBorder: true
    }
}
