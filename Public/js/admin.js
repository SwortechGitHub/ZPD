// admin.js
document.addEventListener('DOMContentLoaded', function() {
    var uploadModal = document.getElementById('uploadModal');
    var uploadBtn = document.getElementById('uploadBtn');
    var uploadCloseBtn = uploadModal.getElementsByClassName('close')[0];
    var fileInput = document.getElementById('fileInput');
    var filePreview = document.getElementById('filePreview');

    // Function to open upload modal
    uploadBtn.onclick = function() {
        uploadModal.style.display = 'block';
    }

    // Function to close upload modal
    uploadCloseBtn.onclick = function() {
        uploadModal.style.display = 'none';
    }

    // Close modal when clicked outside
    window.onclick = function(event) {
        if (event.target == uploadModal) {
            uploadModal.style.display = 'none';
        }
    }

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

    // Add Blog Modal
    var addBlogModal = document.getElementById('addBlogModal');
    var addBlogBtn = document.getElementById('addBlogBtn');
    var addBlogCloseBtn = addBlogModal.getElementsByClassName('close')[0];

    // Function to open add blog modal
    addBlogBtn.onclick = function() {
        addBlogModal.style.display = 'block';
    }

    // Function to close add blog modal
    addBlogCloseBtn.onclick = function() {
        addBlogModal.style.display = 'none';
    }

    // Close modal when clicked outside
    window.onclick = function(event) {
        if (event.target == addBlogModal) {
            addBlogModal.style.display = 'none';
        }
    }
});


