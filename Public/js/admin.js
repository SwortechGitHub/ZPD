document.addEventListener('DOMContentLoaded', function() {
    var fileInput = document.getElementById('fileInput');
    var filePreview = document.getElementById('filePreview');

    // Update file preview when file input changes
    fileInput.addEventListener('change', function() {
        while (filePreview.firstChild) {
            filePreview.removeChild(filePreview.firstChild);
        }

        if (fileInput.files && fileInput.files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
                if (fileInput.files[0].type.startsWith('image/')) {
                    var img = document.createElement('img');
                    img.src = e.target.result;
                    filePreview.appendChild(img);
                } else {
                    var p = document.createElement('p');
                    p.textContent = fileInput.files[0].name;
                    filePreview.appendChild(p);
                }
            }

            reader.readAsDataURL(fileInput.files[0]);
        }
    });
});

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

//webpages code part ----------------------------------------------------------------

function deletePage(pageId) {
    if (confirm("Are you sure you want to delete this page?")) {
        fetch(`/admin/pages/${pageId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                // If page deleted successfully, remove the row from the table
                document.getElementById(pageId).remove();
            } else {
                console.error('Failed to delete page');
            }
        })
        .catch(error => {
            console.error('Error deleting page:', error);
        });
    }
}
