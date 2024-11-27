require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create draft order endpoint
app.post('/create-draft-order', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address1, note } = req.body;

    const draft_order = {
      line_items: [
        {
          title: "Custom Meal Plan",
          price: "0.00", // Set your default price or calculate based on selections
          quantity: 1
        }
      ],
      customer: {
        first_name,
        last_name,
        email,
        phone,
        addresses: [{
          address1,
          default: true
        }]
      },
      note_attributes: [
        {
          name: "Food Allergies",
          value: note.allergies
        },
        {
          name: "Dietary Restrictions",
          value: note.restrictions
        },
        {
          name: "Meal Types",
          value: note.meal_types.join(", ")
        },
        {
          name: "Frequency",
          value: note.frequency
        },
        {
          name: "Additional Notes",
          value: note.additional_notes
        }
      ]
    };

    // Make request to Shopify Admin API
    const response = await fetch(`https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/draft_orders.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
      },
      body: JSON.stringify({ draft_order })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error creating draft order:', error);
    res.status(500).json({ error: 'Failed to create draft order' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
