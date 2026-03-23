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
 * Compare Plans Action
 *
 * Compares two or more Bitdefender security plans side by side.
 * Highlights differences in features, pricing, device coverage, and included components.
 */

const PLANS_COMPARISON = {
  "Total Security": {
    plan_name: "Bitdefender Total Security",
    price: "RON 199.99/year",
    devices: "5 devices",
    vpn: "200 MB/day",
    password_manager: true,
    scam_protection: "Standard",
    parental_controls: true,
    identity_protection: false
  },
  "Premium Security": {
    plan_name: "Bitdefender Premium Security",
    price: "RON 279.98/year",
    devices: "5 devices",
    vpn: "Unlimited",
    password_manager: true,
    scam_protection: "AI-powered",
    parental_controls: true,
    identity_protection: false
  },
  "Ultimate Security": {
    plan_name: "Bitdefender Ultimate Security",
    price: "RON 349.99/year",
    devices: "5 devices",
    vpn: "Unlimited",
    password_manager: true,
    scam_protection: "AI-powered",
    parental_controls: true,
    identity_protection: true
  },
  "Antivirus Plus": {
    plan_name: "Bitdefender Antivirus Plus",
    price: "RON 79.99/year",
    devices: "3 devices (Windows only)",
    vpn: "None",
    password_manager: false,
    scam_protection: "Standard",
    parental_controls: false,
    identity_protection: false
  },
  "Premium VPN": {
    plan_name: "Bitdefender Premium VPN",
    price: "RON 289.99/year",
    devices: "10 devices",
    vpn: "Unlimited",
    password_manager: false,
    scam_protection: "None",
    parental_controls: false,
    identity_protection: false
  },
  "Digital Identity Protection": {
    plan_name: "Bitdefender Digital Identity Protection",
    price: "RON 140.00/first year",
    devices: "1 identity",
    vpn: "None",
    password_manager: false,
    scam_protection: "None",
    parental_controls: false,
    identity_protection: true
  }
}

module.exports = async ({ plan_names = [] }) => {
  try {
    if (!plan_names || plan_names.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'Please provide at least one plan name to compare. Available plans: Total Security, Premium Security, Ultimate Security, Antivirus Plus, Premium VPN, Digital Identity Protection.'
          }
        ]
      }
    }

    // Find matching plans (case insensitive, partial match)
    const comparisonResults = []
    const notFound = []

    for (const requestedName of plan_names) {
      const matchedKey = Object.keys(PLANS_COMPARISON).find(key =>
        key.toLowerCase().includes(requestedName.toLowerCase()) ||
        PLANS_COMPARISON[key].plan_name.toLowerCase().includes(requestedName.toLowerCase())
      )

      if (matchedKey) {
        comparisonResults.push(PLANS_COMPARISON[matchedKey])
      } else {
        notFound.push(requestedName)
      }
    }

    if (comparisonResults.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No matching plans found for: ${plan_names.join(', ')}. Available plans: Total Security, Premium Security, Ultimate Security, Antivirus Plus, Premium VPN, Digital Identity Protection.`
          }
        ]
      }
    }

    const plansList = comparisonResults.map(p => p.plan_name).join(', ')
    let text = `Comparing ${comparisonResults.length} plan${comparisonResults.length !== 1 ? 's' : ''}: ${plansList}`

    if (notFound.length > 0) {
      text += `. Note: Could not find: ${notFound.join(', ')}`
    }

    return {
      content: [
        {
          type: 'text',
          text: text
        }
      ],
      structuredContent: {
        comparison: comparisonResults
      }
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error comparing plans: ${error.message}`
        }
      ]
    }
  }
}
