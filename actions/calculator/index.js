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
 * Calculator Action (tool only, no widget)
 *
 * CUSTOMIZE: Replace with your preferred math library for production use.
 */

module.exports = async ({ expression = '', format = 'decimal' }) => {
    try {
        const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '')

        if (!sanitizedExpression) {
            throw new Error('Invalid expression')
        }

        // WARNING: eval() is dangerous - use a proper math parser in production
        // eslint-disable-next-line no-eval
        const result = eval(sanitizedExpression)
        let formattedResult
        switch (format) {
        case 'scientific':
            formattedResult = result.toExponential(6)
            break
        case 'fraction':
            formattedResult = `≈ ${result.toFixed(6)}`
            break
        default:
            formattedResult = result.toString()
        }

        return {
            content: [
                {
                    type: 'text',
                    text: `Calculation Result:\n\nExpression: ${expression}\nResult: ${formattedResult}`
                }
            ]
        }
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Calculation Error:\n\nExpression: ${expression}\nError: ${error.message}\n\nPlease check your expression and try again.`
                }
            ]
        }
    }
}
