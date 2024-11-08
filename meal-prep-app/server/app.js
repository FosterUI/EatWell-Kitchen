// app.js
require('dotenv').config();
const express = require('express');
const { Shopify } = require('@shopify/shopify-api');
const app = express();

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOP_NAME,
  ACCESS_TOKEN
} = process.env;

// Initialize Shopify API client
const client = new Shopify.Clients.Rest(SHOP_NAME, ACCESS_TOKEN);

app.use(express.json());

// Menu approval endpoint
app.post('/apps/menu-approval', async (req, res) => {
  const { order_id } = req.body;
  
  try {
    // Update order
    const order = await client.put({
      path: `orders/${order_id}`,
      data: {
        order: {
          id: order_id,
          tags: ['menu-approved'],
          note_attributes: [
            { name: 'menu_status', value: 'approved' },
            { name: 'approval_date', value: new Date().toISOString() }
          ]
        }
      }
    });

    res.redirect(`/account/orders/${order_id}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing approval');
  }
});

app.listen(3000, () => {
  console.log('App running on port 3000');
});