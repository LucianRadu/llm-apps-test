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
 * Get Current Promotions Action
 *
 * Retrieves all active promotional offers and discounts on Bitdefender plans.
 * Returns deals with original prices, discounted prices, and savings percentages.
 */

const PRODUCTS = [
  {
    category: "All-in-One",
    description: "Award-winning device protection with Password Manager and VPN.",
    discount_percentage: "50% OFF",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_1f7211670a76d505f7f2270ba9d070ec66ef20866.png?width=1200&format=pjpg&optimize=medium",
    is_deal: "true",
    name: "Bitdefender Total Security",
    original_price: "RON 399.99",
    price: "RON 199.99/year"
  },
  {
    category: "All-in-One",
    description: "Complete security with unlimited VPN and AI Scam Protection.",
    discount_percentage: "49% OFF",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_1ccdcc217e7bfcf08e76a61cdc33bf215941bcf72.jpg?width=1200&format=pjpg&optimize=medium",
    is_deal: "true",
    name: "Bitdefender Premium Security",
    original_price: "RON 544.99",
    price: "RON 279.98/year"
  },
  {
    category: "All-in-One",
    description: "Most comprehensive suite with identity protection and Dark Web monitoring.",
    discount_percentage: "48% OFF",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_10c4872a79f57d7245660dc9f8bd7455ad0dbea48.jpg?width=1200&format=pjpg&optimize=medium",
    is_deal: "true",
    name: "Bitdefender Ultimate Security",
    original_price: "RON 669.99",
    price: "RON 349.99/year"
  },
  {
    category: "Device Security",
    description: "Essential antivirus for Windows with ransomware protection.",
    discount_percentage: "47% OFF",
    image_url: "https://www.bitdefender.com/ro-ro/consumer/media_1574abaa0bf90cc5df3ccb6ba8d7a4b7875c232d1.jpg?width=1200&format=pjpg&optimize=medium",
    is_deal: "true",
    name: "Bitdefender Antivirus Plus",
    original_price: "RON 149.99",
    price: "RON 79.99/year"
  }
]

module.exports = async () => {
  try {
    // Filter products that are on promotion
    const promotions = PRODUCTS.filter(product => product.is_deal === "true")

    return {
      content: [
        {
          type: 'text',
          text: `Found ${promotions.length} active promotion${promotions.length !== 1 ? 's' : ''} on Bitdefender security plans. Save up to 50% on select products.`
        }
      ],
      structuredContent: {
        promotions: promotions.map(promo => ({
          name: promo.name,
          category: promo.category,
          description: promo.description,
          original_price: promo.original_price,
          discounted_price: promo.price,
          discount_percentage: promo.discount_percentage,
          image_url: promo.image_url
        }))
      }
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error retrieving current promotions: ${error.message}`
        }
      ]
    }
  }
}
