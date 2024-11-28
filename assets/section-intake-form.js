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
});
