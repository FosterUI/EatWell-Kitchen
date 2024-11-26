// Meal Prep Intake Form Submission Handler

// This script handles the submission of the meal prep intake form.
// It collects form data, processes it, and sends it to a server endpoint.

// Event listener for when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Get the form element
    const form = document.getElementById('meal-prep-intake-form');

    // Exit if the form is not found
    if (!form) return;

    // Add submit event listener to the form
    form.addEventListener('submit', async function (e) {
        // Prevent the default form submission
        e.preventDefault();

        // Collect and process form data
        const formData = new FormData(form);
        const data = {};

        // Convert FormData to a plain object, cleaning up field names
        for (const [key, value] of formData.entries()) {
            const cleanKey = key.replace('contact[', '').replace(']', '');
            data[cleanKey] = value;
        }

        // Collect selected meal types from checkboxes
        const meals = [];
        ['breakfast', 'lunch', 'dinner', 'snack'].forEach(meal => {
            const checkbox = document.getElementById(`ContactForm-meals-${meal}`);
            if (checkbox && checkbox.checked) {
                meals.push(meal);
            }
        });
        data.meals = meals;

        try {
            // Attempt to send data to the server

            // Removed duplicate code block

            try {
                // Send data to your server endpoint
                const response = await fetch('/apps/meal-prep/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    // Clear form
                    form.reset();

                    // Show success message
                    alert('Thank you! Your meal preferences have been submitted successfully.');
                } else {
                    throw new Error('Failed to submit form');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Sorry, there was an error submitting your preferences. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Sorry, there was an error submitting your preferences. Please try again.');
        }
    }); // Close submit event listener
}); // Close DOMContentLoaded event listener