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

      // Disable form submission while processing
      const submitButton = intakeForm.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
      }

      // Remove any existing messages
      const existingMessages = intakeForm.querySelectorAll('.form__message');
      existingMessages.forEach(msg => msg.remove());

      const formData = new FormData(intakeForm);
      
      // Get selected meal types
      const mealTypes = [];
      document.querySelectorAll('input[name="meal_types[]"]:checked').forEach(checkbox => {
        mealTypes.push(checkbox.value);
      });

      // Get selected delivery frequency
      const deliveryFrequency = document.querySelector('input[name="delivery_frequency"]:checked')?.value;

      // Prepare the data in the format expected by the GraphQL mutation
      const orderData = {
        first_name: formData.get('customer[first_name]'),
        last_name: formData.get('customer[last_name]'),
        email: formData.get('customer[email]'),
        phone: formData.get('customer[phone]'),
        address1: formData.get('customer[address1]'),
        note: {
          allergies: formData.get('customer[allergies]') || 'None',
          restrictions: formData.get('customer[restrictions]') || 'None',
          meal_types: mealTypes,
          frequency: deliveryFrequency,
          additional_notes: formData.get('customer[note]') || ''
        }
      };

      try {
        console.log('Sending form data:', orderData);

        const response = await fetch('http://localhost:3001/create-draft-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        const data = await response.json();
        console.log('Server response:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Server error occurred');
        }

        if (data.error || (data.data && data.data.draftOrderCreate.userErrors.length > 0)) {
          const errorMessage = data.error || 
                             data.data?.draftOrderCreate.userErrors[0]?.message ||
                             'Failed to submit form';
          throw new Error(errorMessage);
        }

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form__message';
        successMessage.setAttribute('tabindex', '-1');
        successMessage.setAttribute('autofocus', '');
        successMessage.innerHTML = '<h2>Thank you for submitting your intake form! We will contact you shortly.</h2>';
        intakeForm.insertBefore(successMessage, intakeForm.firstChild);

        // Only reset the form after successful submission
        intakeForm.reset();

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth' });

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
