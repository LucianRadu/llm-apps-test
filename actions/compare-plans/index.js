/**
 * compare_plans
 * Compares two or more Bitdefender consumer security plans side by side.
 */

const PLANS_COMPARISON = {
  "Bitdefender Total Security": {
    plan_name: "Bitdefender Total Security",
    price: "RON 199.99/year",
    devices: "Up to 5 devices (Individual) / 10 devices (Family)",
    vpn: "200 MB/day per device",
    scam_protection: "Standard",
    password_manager: true,
    identity_protection: false,
    parental_controls: true
  },
  "Bitdefender Premium Security": {
    plan_name: "Bitdefender Premium Security",
    price: "RON 279.98/year",
    devices: "Up to 5 devices (Individual) / 10 devices (Family)",
    vpn: "Unlimited",
    scam_protection: "AI-powered",
    password_manager: true,
    identity_protection: false,
    parental_controls: true
  },
  "Bitdefender Ultimate Security": {
    plan_name: "Bitdefender Ultimate Security",
    price: "RON 349.99/year",
    devices: "Up to 5 devices (Individual) / 10 devices (Family)",
    vpn: "Unlimited",
    scam_protection: "AI-powered",
    password_manager: true,
    identity_protection: true,
    parental_controls: true
  },
  "Bitdefender Antivirus Plus": {
    plan_name: "Bitdefender Antivirus Plus",
    price: "RON 79.99/year",
    devices: "Up to 3 devices (Individual) / 5 devices (Family)",
    vpn: "Not included",
    scam_protection: "Standard",
    password_manager: false,
    identity_protection: false,
    parental_controls: false
  },
  "Bitdefender Premium VPN": {
    plan_name: "Bitdefender Premium VPN",
    price: "RON 289.99/year",
    devices: "Up to 10 devices",
    vpn: "Unlimited",
    scam_protection: "Not included",
    password_manager: false,
    identity_protection: false,
    parental_controls: false
  },
  "Bitdefender Digital Identity Protection": {
    plan_name: "Bitdefender Digital Identity Protection",
    price: "RON 140.00/first year",
    devices: "1 identity",
    vpn: "Not included",
    scam_protection: "Not included",
    password_manager: false,
    identity_protection: true,
    parental_controls: false
  }
};

module.exports = async ({ plan_names }) => {
  try {
    if (!plan_names || !Array.isArray(plan_names) || plan_names.length === 0) {
      return {
        content: [
          { type: 'text', text: 'Error: plan_names must be a non-empty array.' }
        ],
        structuredContent: { error: 'Invalid or missing plan_names parameter' }
      };
    }

    const comparisonResults = [];
    const notFound = [];

    for (const planName of plan_names) {
      // Case-insensitive search
      const normalizedSearch = planName.toLowerCase();
      const matchedKey = Object.keys(PLANS_COMPARISON).find(key =>
        key.toLowerCase().includes(normalizedSearch) ||
        normalizedSearch.includes(key.toLowerCase().replace('bitdefender ', ''))
      );

      if (matchedKey) {
        comparisonResults.push(PLANS_COMPARISON[matchedKey]);
      } else {
        notFound.push(planName);
      }
    }

    let summary = `Comparing ${comparisonResults.length} plan(s).`;
    if (notFound.length > 0) {
      summary += ` Note: Could not find ${notFound.join(', ')}.`;
    }

    return {
      content: [
        { type: 'text', text: summary }
      ],
      structuredContent: {
        comparison: comparisonResults,
        notFound
      }
    };
  } catch (error) {
    return {
      content: [
        { type: 'text', text: `Error comparing plans: ${error.message}` }
      ],
      structuredContent: { comparison: [], error: error.message }
    };
  }
};
