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
 * Start Free Trial Action
 *
 * Initiates a 30-day free trial of a specified Bitdefender plan.
 * Collects email and plan preference, returns confirmation.
 *
 * NOTE: This is a mock implementation. In production, integrate with
 * Bitdefender's trial signup API.
 */

const AVAILABLE_PLANS = [
  "Bitdefender Total Security",
  "Bitdefender Premium Security",
  "Bitdefender Ultimate Security",
  "Bitdefender Antivirus Plus"
]

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

module.exports = async ({ plan_name = '', email = '' }) => {
  try {
    // Validate inputs
    if (!plan_name) {
      return {
        content: [
          {
            type: 'text',
            text: `Please specify a plan name. Available trials: ${AVAILABLE_PLANS.join(', ')}`
          }
        ]
      }
    }

    if (!email) {
      return {
        content: [
          {
            type: 'text',
            text: 'Please provide your email address to start the free trial.'
          }
        ]
      }
    }

    if (!validateEmail(email)) {
      return {
        content: [
          {
            type: 'text',
            text: 'Please provide a valid email address.'
          }
        ]
      }
    }

    // Find matching plan (case insensitive, partial match)
    const matchedPlan = AVAILABLE_PLANS.find(plan =>
      plan.toLowerCase().includes(plan_name.toLowerCase())
    )

    if (!matchedPlan) {
      return {
        content: [
          {
            type: 'text',
            text: `Plan "${plan_name}" is not available for trial. Available plans: ${AVAILABLE_PLANS.join(', ')}`
          }
        ]
      }
    }

    // Mock trial activation
    // TODO: Replace with actual Bitdefender API integration
    const trialData = {
      status: 'activated',
      trial_plan: matchedPlan,
      trial_duration: '30 days',
      email: email,
      activation_date: new Date().toISOString(),
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      message: `Your 30-day free trial of ${matchedPlan} has been activated! Check your email (${email}) for download instructions and activation details. No credit card required.`
    }

    return {
      content: [
        {
          type: 'text',
          text: trialData.message
        }
      ],
      structuredContent: trialData
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error starting free trial: ${error.message}`
        }
      ]
    }
  }
}
