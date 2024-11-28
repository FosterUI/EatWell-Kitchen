const express = require('express');
const router = express.Router();
const Shopify = require('@shopify/shopify-api').default;

router.post('/create', async (req, res) => {
  try {
    const { draft_order } = req.body;

    // Initialize Shopify client
    const client = new Shopify.Clients.Rest(
      process.env.SHOP_URL,
      process.env.SHOPIFY_ACCESS_TOKEN
    );

    // Create draft order
    const response = await client.post({
      path: 'draft_orders',
      data: draft_order
    });

    res.json(response.body);
  } catch (error) {
    console.error('Error creating draft order:', error);
    res.status(500).json({ error: 'Failed to create draft order' });
  }
});

module.exports = router;
