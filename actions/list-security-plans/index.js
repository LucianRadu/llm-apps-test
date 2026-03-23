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
 * List Security Plans Action
 *
 * Retrieves all available Bitdefender consumer security subscription plans.
 * Supports optional filtering by category (All-in-One, Device Security, Privacy, Identity Protection).
 */

const PLANS = [
  {
    category: "All-in-One",
    description: "Award-winning antivirus, anti-malware and anti-ransomware protection for up to 5 devices (Windows, macOS, Android, iOS) with Password Manager and 200 MB/day VPN.",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_1f7211670a76d505f7f2270ba9d070ec66ef20866.png?width=1200&format=pjpg&optimize=medium",
    name: "Bitdefender Total Security",
    price: "RON 199.99/year"
  },
  {
    category: "All-in-One",
    description: "Complete security and enhanced privacy with unlimited VPN, AI-powered Scam Protection, Anti-tracker, email protection, and Password Manager for up to 5 devices.",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_1ccdcc217e7bfcf08e76a61cdc33bf215941bcf72.jpg?width=1200&format=pjpg&optimize=medium",
    name: "Bitdefender Premium Security",
    price: "RON 279.98/year"
  },
  {
    category: "All-in-One",
    description: "The most comprehensive suite with all Premium Security features plus Digital Identity Protection, continuous Dark Web monitoring, and real-time breach notifications.",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_10c4872a79f57d7245660dc9f8bd7455ad0dbea48.jpg?width=1200&format=pjpg&optimize=medium",
    name: "Bitdefender Ultimate Security",
    price: "RON 349.99/year"
  },
  {
    category: "Device Security",
    description: "Essential antivirus protection for up to 3 Windows devices with multi-layered ransomware protection, anti-phishing, and anti-fraud features.",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_1574abaa0bf90cc5df3ccb6ba8d7a4b7875c232d1.jpg?width=1200&format=pjpg&optimize=medium",
    name: "Bitdefender Antivirus Plus",
    price: "RON 79.99/year"
  },
  {
    category: "Privacy",
    description: "Ultra-fast, secure VPN service with unlimited encrypted traffic for complete online anonymity across all devices.",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_136904bddcf087babb6d5ca9076f0cc7173b505b7.png?width=1200&format=pjpg&optimize=medium",
    name: "Bitdefender Premium VPN",
    price: "RON 289.99/year"
  },
  {
    category: "Identity Protection",
    description: "Monitors your personal data across the web and Dark Web, providing identity protection score, real-time breach alerts, and expert security recommendations.",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_1c073a4933ce3c5dc161c823f02caa166a4f1148c.png?width=1200&format=pjpg&optimize=medium",
    name: "Bitdefender Digital Identity Protection",
    price: "RON 140.00/first year"
  }
]

module.exports = async ({ category = '' }) => {
  try {
    // Filter by category if provided
    let filteredPlans = PLANS
    if (category) {
      filteredPlans = PLANS.filter(plan =>
        plan.category.toLowerCase() === category.toLowerCase()
      )
    }

    const categoryText = category ? ` in category "${category}"` : ''

    return {
      content: [
        {
          type: 'text',
          text: `Found ${filteredPlans.length} Bitdefender security plan${filteredPlans.length !== 1 ? 's' : ''}${categoryText}.`
        }
      ],
      structuredContent: {
        plans: filteredPlans
      }
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error retrieving security plans: ${error.message}`
        }
      ]
    }
  }
}
