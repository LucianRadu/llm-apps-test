// Embedded data from discovery JSON
const PLANS = [
  {
    "category": "All-in-One",
    "description": "Award-winning antivirus, anti-malware and anti-ransomware protection for up to 5 devices (Windows, macOS, Android, iOS) with Password Manager and 200 MB/day VPN.",
    "image_url": "https://www.bitdefender.com/ro-ro/consumer/media_1f7211670a76d505f7f2270ba9d070ec66ef20866.png?width=1200&format=pjpg&optimize=medium",
    "name": "Bitdefender Total Security",
    "price": "RON 199.99/year"
  },
  {
    "category": "All-in-One",
    "description": "Complete security and enhanced privacy with unlimited VPN, AI-powered Scam Protection, Anti-tracker, email protection, and Password Manager for up to 5 devices.",
    "image_url": "https://www.bitdefender.com/ro-ro/consumer/media_1ccdcc217e7bfcf08e76a61cdc33bf215941bcf72.jpg?width=1200&format=pjpg&optimize=medium",
    "name": "Bitdefender Premium Security",
    "price": "RON 279.98/year"
  },
  {
    "category": "All-in-One",
    "description": "The most comprehensive suite with all Premium Security features plus Digital Identity Protection, continuous Dark Web monitoring, and real-time breach notifications.",
    "image_url": "https://www.bitdefender.com/ro-ro/consumer/media_10c4872a79f57d7245660dc9f8bd7455ad0dbea48.jpg?width=1200&format=pjpg&optimize=medium",
    "name": "Bitdefender Ultimate Security",
    "price": "RON 349.99/year"
  },
  {
    "category": "Device Security",
    "description": "Essential antivirus protection for up to 3 Windows devices with multi-layered ransomware protection, anti-phishing, and anti-fraud features.",
    "image_url": "https://www.bitdefender.com/ro-ro/consumer/media_1574abaa0bf90cc5df3ccb6ba8d7a4b7875c232d1.jpg?width=1200&format=pjpg&optimize=medium",
    "name": "Bitdefender Antivirus Plus",
    "price": "RON 79.99/year"
  },
  {
    "category": "Privacy",
    "description": "Ultra-fast, secure VPN service with unlimited encrypted traffic for complete online anonymity across all devices.",
    "image_url": "https://www.bitdefender.com/ro-ro/consumer/media_136904bddcf087babb6d5ca9076f0cc7173b505b7.png?width=1200&format=pjpg&optimize=medium",
    "name": "Bitdefender Premium VPN",
    "price": "RON 289.99/year"
  },
  {
    "category": "Identity Protection",
    "description": "Monitors your personal data across the web and Dark Web, providing identity protection score, real-time breach alerts, and expert security recommendations.",
    "image_url": "https://www.bitdefender.com/ro-ro/consumer/media_1c073a4933ce3c5dc161c823f02caa166a4f1148c.png?width=1200&format=pjpg&optimize=medium",
    "name": "Bitdefender Digital Identity Protection",
    "price": "RON 140.00/first year"
  }
];

// Feature mappings for each plan
const PLAN_FEATURES = {
  'Bitdefender Total Security': [
    'Award-winning antivirus and anti-malware protection',
    'Multi-layered ransomware protection',
    'Password Manager',
    'VPN (200 MB/day)',
    'Anti-phishing and anti-fraud',
    'Parental Controls (Family tier)',
    'Supports Windows, macOS, Android, iOS'
  ],
  'Bitdefender Premium Security': [
    'All Total Security features',
    'Unlimited VPN',
    'AI-powered Scam Protection',
    'Anti-tracker browser extension',
    'Email protection',
    'Enhanced privacy controls',
    'Priority support'
  ],
  'Bitdefender Ultimate Security': [
    'All Premium Security features',
    'Digital Identity Protection',
    'Dark Web monitoring',
    'Real-time breach notifications',
    'Identity protection score',
    'Expert security recommendations',
    'Data leak alerts'
  ],
  'Bitdefender Antivirus Plus': [
    'Essential antivirus protection',
    'Multi-layered ransomware protection',
    'Anti-phishing and anti-fraud',
    'Safe Files protection',
    'Windows only',
    'Up to 3 devices'
  ],
  'Bitdefender Premium VPN': [
    'Unlimited encrypted traffic',
    'Ultra-fast connection speeds',
    'Complete online anonymity',
    'No activity logs',
    'Kill switch protection',
    'Supports all major platforms',
    'Multiple server locations'
  ],
  'Bitdefender Digital Identity Protection': [
    'Personal data monitoring',
    'Dark Web scanning',
    'Identity protection score',
    'Real-time breach alerts',
    'Expert security recommendations',
    'Data leak notifications',
    'Credit monitoring assistance'
  ]
};

module.exports = async ({ plan_name }) => {
  try {
    // Find plan by partial name match (case-insensitive)
    const plan = PLANS.find(p =>
      p.name.toLowerCase().includes(plan_name.toLowerCase()) ||
      plan_name.toLowerCase().includes(p.name.toLowerCase().replace('bitdefender ', ''))
    );

    if (!plan) {
      return {
        content: [
          { type: 'text', text: `Plan "${plan_name}" not found. Available plans: ${PLANS.map(p => p.name).join(', ')}.` }
        ],
        structuredContent: null
      };
    }

    // Build detailed response matching output schema
    const details = {
      name: plan.name,
      description: plan.description,
      image_url: plan.image_url,
      price_individual: plan.price,
      price_family: plan.category === 'All-in-One' ? plan.price.replace(/\d+\.\d+/, match => (parseFloat(match) * 1.3).toFixed(2)) : plan.price,
      devices_individual: plan.name.includes('Antivirus Plus') ? '3' : '5',
      devices_family: plan.category === 'All-in-One' ? '10' : '5',
      platforms: plan.description.includes('Windows, macOS, Android, iOS') ? 'Windows, macOS, Android, iOS' :
                 plan.description.includes('Windows') ? 'Windows' : 'All major platforms',
      features: PLAN_FEATURES[plan.name] || []
    };

    return {
      content: [
        { type: 'text', text: `Retrieved details for ${plan.name}. Price: ${plan.price}.` }
      ],
      structuredContent: details
    };
  } catch (error) {
    return {
      content: [
        { type: 'text', text: `Error retrieving plan details: ${error.message}` }
      ],
      structuredContent: null
    };
  }
};
