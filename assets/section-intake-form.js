document.addEventListener('DOMContentLoaded', function() {
  const phoneInput = document.getElementById('IntakeForm-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
      if (value.length > 0) {
        // Format the number as xxx-xxx-xxxx
        if (value.length <= 3) {
          value = value;
        } else if (value.length <= 6) {
          value = value.slice(0, 3) + '-' + value.slice(3);
        } else {
          value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
        }
        e.target.value = value;
      }
    });
  }

  const intakeForm = document.getElementById('IntakeForm');
  if (intakeForm) {
    intakeForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Remove any existing messages
      const existingMessages = intakeForm.querySelectorAll('.form__message');
      existingMessages.forEach(msg => msg.remove());

      // Disable form submission while processing
      const submitButton = intakeForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      try {
        const formData = new FormData(intakeForm);
        
        // Get selected meal types
        const mealTypes = [];
        document.querySelectorAll('input[name="meal_types[]"]:checked').forEach(checkbox => {
          mealTypes.push(checkbox.value);
        });

        // Get selected delivery frequency
        const deliveryFrequency = document.querySelector('input[name="delivery_frequency"]:checked')?.value;

        // Prepare the data
        const orderData = {
          first_name: formData.get('customer[first_name]')?.trim(),
          last_name: formData.get('customer[last_name]')?.trim(),
          email: formData.get('customer[email]')?.trim(),
          phone: formData.get('customer[phone]')?.trim(),
          address1: formData.get('customer[address1]')?.trim(),
          note: {
            allergies: formData.get('customer[allergies]')?.trim() || 'None',
            restrictions: formData.get('customer[restrictions]')?.trim() || 'None',
            meal_types: mealTypes.length > 0 ? mealTypes : ['None selected'],
            frequency: deliveryFrequency || 'Not specified',
            additional_notes: formData.get('customer[note]')?.trim() || 'None'
          }
        };

        // Validate required fields
        if (!orderData.email) {
          throw new Error('Email is required');
        }

        console.log('Sending form data:', orderData);

        const response = await fetch('http://localhost:3001/create-draft-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(orderData)
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (data.error) {
          throw new Error(data.error);
        }

        // Show success message and scroll into view
        const successMessage = document.createElement('div');
        successMessage.className = 'form__message form__message--success';
        successMessage.setAttribute('tabindex', '-1');
        successMessage.setAttribute('autofocus', '');
        successMessage.innerHTML = `
          <div class="form__message-content">
            <h2>Thank you for submitting your intake form!</h2>
            <p>We have received your information and will contact you shortly to discuss your custom meal plan.</p>
          </div>
        `;
        intakeForm.insertBefore(successMessage, intakeForm.firstChild);
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Only reset form after successful submission
        intakeForm.reset();

      } catch (error) {
        console.error('Error:', error);
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'form__message';
        errorMessage.setAttribute('tabindex', '-1');
        errorMessage.setAttribute('autofocus', '');
        errorMessage.innerHTML = `<h2>There was an error submitting your form: ${error.message}</h2>`;
        intakeForm.insertBefore(errorMessage, intakeForm.firstChild);
      } finally {
        // Re-enable form submission
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Submit';
        }
      }
    });
  }
});
