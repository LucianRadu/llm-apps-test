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
 * Adobe Shirts Action (tool + EDS widget)
 *
 * Returns the Adobe merchandise shirt catalog. The EDS widget renders
 * the product grid via aem-embed -- no widget.html needed, the loader
 * auto-generates it from eds_widget config in experiences.json.
 */

const SHIRTS = [
    { id: 'button-up-carly-berry', name: 'Button-up Shirt – Art by Carly Berry', price: '$60.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb454_1.jpg', description: 'Limited edition artist collaboration with Carly Berry. Lightweight cotton button-up features artwork by Carly Berry', color: 'Black', sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'] },
    { id: 'bezier-tee-black', name: 'Bezier Tee - Black', price: '$23.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb177_zfiimwyqm69pwqrd.jpg', description: 'Your look is always on point with this Bezier Adobe wordmark design. Black tee with gradient Bezier Adobe wordmark', color: 'Black', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
    { id: 'bezier-tee-vintage-red', name: 'Bezier Tee - Vintage Red', price: '$24.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb476-red-front.jpg', description: 'Vintage red tee with white Bezier Adobe wordmark. Relaxed, boxy fit and drop shoulders', color: 'Vintage Red', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
    { id: 'bezier-tee-white', name: 'Bezier Tee - White', price: '$27.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb450_ecelxyjdaldsfq7m.jpg', description: 'Heavyweight white tee with gradient Bezier Adobe wordmark. Relaxed, boxy fit with drop shoulders', color: 'White', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'] },
    { id: 'adobe-life-tee', name: 'Adobe Life Tee', price: '$28.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb215_kinxaaegmdzr4k09.jpg', description: 'The official uniform for your #AdobeLife. Black tee with Adobe Life graphic on the front', color: 'Black', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'] },
    { id: 'adobe-for-all-tee', name: 'Adobe for All Tee', price: '$16.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb256_ryzf3jgqxunmeu0t.jpg', description: 'See yourself in this tee featuring artwork by our creative director. Adobe for all printed on black tee', color: 'Black', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'] },
    { id: 'womens-bezier-tee-white', name: "Women's Bezier Tee - White", price: '$25.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb449_qqudowylp8rpebj1.jpg', description: 'Heavyweight white tee with gradient Bezier Adobe wordmark. Boxier, relaxed fit. Women\'s sizing', color: 'White', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'] },
    { id: 'travismathew-polo', name: 'TravisMathew Polo', price: '$72.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb157_zrcetzpl3odcrgrz.jpg', description: 'Wrinkle resistant with four-way stretch and quick-drying technology. Black polo with gray Adobe wordmark', color: 'Black', sizes: ['S', 'M', 'L', 'XL', 'XXL', '3X'] },
    { id: 'womens-bezier-tee-vintage-red', name: "Women's Bezier Tee - Vintage Red", price: '$22.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb448_wv3akhbcyxqihr7p.jpg', description: 'Vintage red tee with white Bezier Adobe wordmark. Boxier, relaxed fit. Women\'s sizing', color: 'Vintage Red', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'] },
    { id: 'brooks-brothers-polo', name: 'Brooks Brothers Long Sleeve Polo', price: '$72.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb445_xohzgg7qj7ljmxkv.jpg', description: 'Stylish and comfortable long-sleeve polo. Charcoal grey half-button knit with white Adobe wordmark embroidered', color: 'Charcoal Grey', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3X'] },
    { id: 'escape-artist-tee-sam-wilde', name: 'Escape Artist Tee - Art by Sam Wilde', price: '$26.25', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb385_n3wbaowuyczsjxtw.jpg', description: 'Limited edition artist collaboration with Sam Wilde. Features playful, brightly colored newts on gray sueded long-sleeve tee', color: 'Gray', sizes: ['XS', 'S', 'M', 'XL', 'XXL'] },
    { id: 'adobe-max-25-tee', name: "Adobe MAX '25 Tee", price: '$26.00', imageUrl: 'https://na1-static.api.commerce.adobe.com/VyumfC53bDYkVB6b8MXsJh/media/catalog/product/a/d/adb501-blk-front.jpg', description: 'You came, you saw, you played. Black tee with black flocked MAX illustration on the back, event info on front in red', color: 'Black', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] }
]

module.exports = async () => {
    try {
        return {
            content: [
                {
                    type: 'text',
                    text: `Found ${SHIRTS.length} Adobe shirts available. Browse the collection in the widget below.`
                }
            ],
            structuredContent: {
                shirts: SHIRTS
            }
        }
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error loading Adobe shirts: ${error.message}`
                }
            ]
        }
    }
}
