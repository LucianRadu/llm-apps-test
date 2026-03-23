/**
 * get_current_promotions
 * Retrieves all active promotional offers and discounts on Bitdefender consumer security plans.
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
];

module.exports = async () => {
  try {
    // Filter products that are currently on promotion
    const promotions = PRODUCTS.filter(product => product.is_deal === "true");

    const summary = promotions.length > 0
      ? `Found ${promotions.length} active promotion(s) with discounts up to 50% off.`
      : 'No active promotions at this time.';

    return {
      content: [
        { type: 'text', text: summary }
      ],
      structuredContent: {
        promotions: promotions.map(promo => ({
          name: promo.name,
          description: promo.description,
          original_price: promo.original_price,
          discounted_price: promo.price,
          discount_percentage: promo.discount_percentage,
          image_url: promo.image_url,
          category: promo.category
        }))
      }
    };
  } catch (error) {
    return {
      content: [
        { type: 'text', text: `Error retrieving promotions: ${error.message}` }
      ],
      structuredContent: { promotions: [], error: error.message }
    };
  }
};
