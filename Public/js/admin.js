// Function to open a popup
function openPopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.showModal();
  }

  // Get all the close buttons inside the popups
  const closeButtons = document.querySelectorAll('.popup-close');

  // Loop through the close buttons and add an event listener to each one
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Find the parent dialog and close it
      const dialog = button.closest('dialog');
      dialog.close();
    });
  });
