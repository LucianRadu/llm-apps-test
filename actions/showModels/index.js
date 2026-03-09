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
 * Show Models Action (EDS widget)
 *
 * Displays Kawasaki Motocross & Enduro motorcycle models using an EDS widget.
 * The widget is rendered via aem-embed from the linked EDS project.
 */

const MODELS = [
    {
        name: 'KX450',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_320467_26KX450M_201GN1DRF3CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KX450_2026.html',
        features: ['Factory-style engine components & tuning', 'Factory-style chassis tuning', 'Advanced tech at your fingertips'],
        isNew: false
    },
    {
        name: 'KX450X',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_320471_26KX450N_201GN1DRF3CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KX450X_2026.html',
        features: ['Factory-style engine components & tuning', 'Factory-style chassis advantage', 'Advanced tech at your fingertips'],
        isNew: false
    },
    {
        name: 'KX250',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_320462_26KX252E_201GN1DRF3CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KX250_2026.html',
        features: ['Even more powerful engine', 'Slim, ergonomic bodywork', 'Fine-tuned suspension & brake components'],
        isNew: false
    },
    {
        name: 'KX250X',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_320464_26KX252F_201GN1DRF3CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KX250X_2026.html',
        features: ['Factory-style engine components & tuning', 'Factory-style chassis advantage', 'Advanced tech at your fingertips'],
        isNew: false
    },
    {
        name: 'KX112',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_326633_26KX112B_201AGN1DRF3CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KX112_2026.html',
        features: ['Lightweight competition machine', 'Race-ready performance', 'New 2-stroke power'],
        isNew: true
    },
    {
        name: 'KX85 L',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_326691_26KX85F_201AGN1DRF3CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KX85_II_2026.html',
        features: ['Advanced cooling system', 'More efficient transmission', '6-position handlebar'],
        isNew: true
    },
    {
        name: 'KX85',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_326677_26KX85E_201AGN1DRF3CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KX85_I_2026.html',
        features: ['New design', 'Advanced cooling system', 'Factory-inspired styling'],
        isNew: true
    },
    {
        name: 'KX65',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_320428_26KX65C_201GN1DRF1CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KX65_2026.html',
        features: ['Power & technology to train winners', 'Effective brake pads', 'New graphics'],
        isNew: false
    },
    {
        name: 'KLX230R S',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_320455_26KLX232P_271GN1DRF3CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KLX230R_S_2026.html',
        features: ['Versatile trail performance', 'Electric start convenience', 'Fuel-injected reliability'],
        isNew: false
    },
    {
        name: 'KLX140R',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_320436_26KLX140A_271GN1DRF1CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KLX140R_2026.html',
        features: ['Smooth power delivery', 'Reliable braking system', 'Easy to handle'],
        isNew: false
    },
    {
        name: 'KLX110R',
        year: 2026,
        image: 'https://www.kawasaki.ro/content/dam/products/pim/studio/Resource_320434_26KLX110C_271GN1DRF1CG_A.jpg',
        url: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro/KLX110R_2026.html',
        features: ['Compact, reliable engine', 'Factory styling', 'Easy to handle'],
        isNew: false
    }
]

module.exports = async () => {
    try {
        const newCount = MODELS.filter(m => m.isNew).length
        return {
            content: [
                {
                    type: 'text',
                    text: `Found ${MODELS.length} Kawasaki Motocross & Enduro models for 2026 (${newCount} new). Browse the collection in the widget below.`
                }
            ],
            structuredContent: {
                category: 'Motocross / Enduro',
                year: 2026,
                sourceUrl: 'https://www.kawasaki.ro/ro_ro/Motorcycles/Motocross-Enduro.html',
                models: MODELS
            }
        }
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Error loading models: ${error.message}`
                }
            ]
        }
    }
}
