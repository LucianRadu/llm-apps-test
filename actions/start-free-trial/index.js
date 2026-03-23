/**
 * start_free_trial
 * Initiates a 30-day free trial of a specified Bitdefender consumer security plan.
 */

const AVAILABLE_PLANS = [
  "Bitdefender Total Security",
  "Bitdefender Premium Security",
  "Bitdefender Ultimate Security",
  "Bitdefender Antivirus Plus",
  "Bitdefender Premium VPN"
];

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async ({ plan_name, email }) => {
  try {
    // Validate required parameters
    if (!plan_name) {
      return {
        content: [
          { type: 'text', text: 'Error: plan_name is required.' }
        ],
        structuredContent: {
          status: 'error',
          error: 'Missing required parameter: plan_name'
        }
      };
    }

    if (!email) {
      return {
        content: [
          { type: 'text', text: 'Error: email is required.' }
        ],
        structuredContent: {
          status: 'error',
          error: 'Missing required parameter: email'
        }
      };
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return {
        content: [
          { type: 'text', text: 'Error: Invalid email format.' }
        ],
        structuredContent: {
          status: 'error',
          error: 'Invalid email format'
        }
      };
    }

    // Check if plan exists (case-insensitive)
    const normalizedSearch = plan_name.toLowerCase();
    const matchedPlan = AVAILABLE_PLANS.find(plan =>
      plan.toLowerCase().includes(normalizedSearch) ||
      normalizedSearch.includes(plan.toLowerCase().replace('bitdefender ', ''))
    );

    if (!matchedPlan) {
      return {
        content: [
          { type: 'text', text: `Error: Plan "${plan_name}" is not available for trial.` }
        ],
        structuredContent: {
          status: 'error',
          error: 'Plan not found',
          availablePlans: AVAILABLE_PLANS
        }
      };
    }

    // Mock successful trial activation
    const confirmationMessage = `Your 30-day free trial for ${matchedPlan} has been activated! We've sent confirmation and download instructions to ${email}. No credit card required during the trial period.`;

    return {
      content: [
        { type: 'text', text: confirmationMessage }
      ],
      structuredContent: {
        status: 'activated',
        trial_plan: matchedPlan,
        trial_duration: '30 days',
        email: email,
        message: confirmationMessage,
        next_steps: [
          'Check your email for download links',
          'Install Bitdefender on your devices',
          'Activate using the trial license key',
          'Explore all premium features'
        ]
      }
    };
  } catch (error) {
    return {
      content: [
        { type: 'text', text: `Error starting trial: ${error.message}` }
      ],
      structuredContent: {
        status: 'error',
        error: error.message
      }
    };
  }
};
