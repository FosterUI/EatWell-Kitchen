require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Test endpoint for draft orders
app.get('/test-draft-order', (req, res) => {
  res.json({
    shopify_domain: process.env.SHOPIFY_SHOP_DOMAIN,
    has_token: !!process.env.SHOPIFY_ACCESS_TOKEN
  });
});

// GraphQL mutation for creating draft order
const CREATE_DRAFT_ORDER_MUTATION = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        order {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Create draft order endpoint
app.post('/create-draft-order', async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));

    const { first_name, last_name, email, phone, address1, note } = req.body;

    if (!email) {
      throw new Error('Email is required');
    }

    const variables = {
      input: {
        lineItems: [{
          title: "Custom Meal Plan",
          originalUnitPrice: "0.00",
          quantity: 1
        }],
        email,
        note: JSON.stringify({
          allergies: note.allergies,
          restrictions: note.restrictions,
          meal_types: note.meal_types,
          frequency: note.frequency,
          additional_notes: note.additional_notes
        }),
        customAttributes: [
          { key: "Food Allergies", value: note.allergies },
          { key: "Dietary Restrictions", value: note.restrictions },
          { key: "Meal Types", value: note.meal_types.join(", ") },
          { key: "Frequency", value: note.frequency },
          { key: "Additional Notes", value: note.additional_notes }
        ],
        shippingAddress: {
          address1,
          firstName: first_name,
          lastName: last_name,
          phone
        }
      }
    };

    console.log('GraphQL variables:', JSON.stringify(variables, null, 2));

    if (!process.env.SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      throw new Error('Missing Shopify credentials in environment variables');
    }

    const shopifyUrl = `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`;
    console.log('Shopify URL:', shopifyUrl);

    // Make request to Shopify Admin GraphQL API
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
      },
      body: JSON.stringify({
        query: CREATE_DRAFT_ORDER_MUTATION,
        variables
      })
    });

    const data = await response.json();
    console.log('Shopify API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    if (data.data.draftOrderCreate.userErrors.length > 0) {
      throw new Error(data.data.draftOrderCreate.userErrors[0].message);
    }

    res.json(data.data.draftOrderCreate);
  } catch (error) {
    console.error('Error creating draft order:', error);
    res.status(500).json({ error: error.message || 'Failed to create draft order' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables:');
  console.log('- SHOPIFY_SHOP_DOMAIN:', process.env.SHOPIFY_SHOP_DOMAIN ? '✓ Set' : '✗ Missing');
  console.log('- SHOPIFY_ACCESS_TOKEN:', process.env.SHOPIFY_ACCESS_TOKEN ? '✓ Set' : '✗ Missing');
});
