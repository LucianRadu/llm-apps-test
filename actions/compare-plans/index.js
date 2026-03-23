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

// Feature mappings for comparison
const PLAN_COMPARISON_DATA = {
  'Bitdefender Total Security': {
    vpn: '200 MB/day',
    scam_protection: 'Standard',
    password_manager: true,
    identity_protection: false,
    parental_controls: true,
    devices: '5'
  },
  'Bitdefender Premium Security': {
    vpn: 'Unlimited',
    scam_protection: 'AI-powered',
    password_manager: true,
    identity_protection: false,
    parental_controls: true,
    devices: '5'
  },
  'Bitdefender Ultimate Security': {
    vpn: 'Unlimited',
    scam_protection: 'AI-powered',
    password_manager: true,
    identity_protection: true,
    parental_controls: true,
    devices: '5'
  },
  'Bitdefender Antivirus Plus': {
    vpn: 'Not included',
    scam_protection: 'Standard',
    password_manager: false,
    identity_protection: false,
    parental_controls: false,
    devices: '3'
  },
  'Bitdefender Premium VPN': {
    vpn: 'Unlimited',
    scam_protection: 'Not included',
    password_manager: false,
    identity_protection: false,
    parental_controls: false,
    devices: 'All devices'
  },
  'Bitdefender Digital Identity Protection': {
    vpn: 'Not included',
    scam_protection: 'Not included',
    password_manager: false,
    identity_protection: true,
    parental_controls: false,
    devices: 'All devices'
  }
};

module.exports = async ({ plan_names }) => {
  try {
    if (!plan_names || !Array.isArray(plan_names) || plan_names.length === 0) {
      return {
        content: [
          { type: 'text', text: 'Please provide at least one plan name to compare.' }
        ],
        structuredContent: []
      };
    }

    const comparisonData = [];
    const notFound = [];

    for (const planName of plan_names) {
      // Find plan by partial name match
      const plan = PLANS.find(p =>
        p.name.toLowerCase().includes(planName.toLowerCase()) ||
        planName.toLowerCase().includes(p.name.toLowerCase().replace('bitdefender ', ''))
      );

      if (plan) {
        const features = PLAN_COMPARISON_DATA[plan.name] || {
          vpn: 'Unknown',
          scam_protection: 'Unknown',
          password_manager: false,
          identity_protection: false,
          parental_controls: false,
          devices: 'Unknown'
        };

        comparisonData.push({
          plan_name: plan.name,
          price: plan.price,
          devices: features.devices,
          vpn: features.vpn,
          scam_protection: features.scam_protection,
          password_manager: features.password_manager,
          identity_protection: features.identity_protection,
          parental_controls: features.parental_controls
        });
      } else {
        notFound.push(planName);
      }
    }

    const summary = notFound.length > 0
      ? `Comparing ${comparisonData.length} plan${comparisonData.length !== 1 ? 's' : ''}. Not found: ${notFound.join(', ')}.`
      : `Comparing ${comparisonData.length} plan${comparisonData.length !== 1 ? 's' : ''} side by side.`;

    return {
      content: [
        { type: 'text', text: summary }
      ],
      structuredContent: comparisonData
    };
  } catch (error) {
    return {
      content: [
        { type: 'text', text: `Error comparing plans: ${error.message}` }
      ],
      structuredContent: []
    };
  }
};
