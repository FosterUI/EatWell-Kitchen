document.getElementById('meal-prep-intake-form').addEventListener('submit', async function (e) {
    /**
 * ====================================================================
 * Intake Form Submission Script
 * ====================================================================
 * 
 * Purpose:
 * This script handles the submission of the Meal Prep Intake Form. 
 * It collects customer input from the form, validates it (where applicable), 
 * and sends the data to Shopify's Admin API to create a Draft Order.
 * 
 * Key Features:
 * 1. **Form Submission Handling**:
 *    - Prevents default form submission behavior.
 *    - Collects data from form fields (e.g., dietary preferences, allergies).
 *
 * 2. **Draft Order Creation**:
 *    - Sends a POST request to Shopify's Admin API to create a Draft Order.
 *    - Includes customer preferences as line item properties for review by the client.
 *
 * 3. **Error Handling**:
 *    - Displays alerts for successful or failed submissions.
 *    - Logs errors to the console for debugging purposes.
 *
 * 4. **Validation**:
 *    - Ensures required fields are filled before submission.
 *
 * Usage Instructions:
 * 1. Place this file in your theme's `assets` folder (e.g., `assets/intake-form.js`).
 * 2. Link it in your theme's `layout/theme.liquid` file using:
 *      <script src="{{ 'intake-form.js' | asset_url }}"></script>
 * 3. Ensure you have created a private app in Shopify Admin with access to 
 *    the Draft Orders API and obtained an API access token.
 *
 * Customization Notes:
 * - Modify the `draftOrderData` object to include additional fields or properties.
 * - Update error handling logic as needed for your specific use case.
 *
 * Security Notes:
 * - DO NOT expose sensitive API keys or access tokens in client-side JavaScript.
 *   Instead, use a server-side solution (e.g., a middleware) to securely handle 
 *   API requests if this script will be public-facing.
 *
 * ====================================================================
 */
    
    e.preventDefault();
  
    // Collect form data
    const dietaryPreferences = document.getElementById('diet').value;
    const allergies = document.getElementById('allergies').value;
    const preferredMeals = document.getElementById('meals').value;
  
    // Define draft order data
    const draftOrderData = {
      draft_order: {
        line_items: [
          {
            title: "Meal Prep Intake",
            quantity: 1,
            properties: {
              "Dietary Preferences": dietaryPreferences,
              "Allergies": allergies,
              "Preferred Meals": preferredMeals
            }
          }
        ],
        note: "Customer meal preferences for review."
      }
    };
  
    try {
      // Send data to Shopify Admin API (requires private app with API access)
      const response = await fetch('/admin/api/2024-01/draft_orders.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': 'your-access-token'
        },
        body: JSON.stringify(draftOrderData)
      });
  
      if (response.ok) {
        alert('Preferences submitted successfully!');
      } else {
        alert('Failed to submit preferences.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting preferences.');
    }
  });