let toolbaroptions = [
    //text style
    ["bold", "italic", "underline", "strike"],
    //headers
    [{header:[1,2,3,false]}],
    //bullet points stle
    [{list: "ordered"}, {list: "bullet"}],
    //identation
    [{indent:"+1"}, {indent:"-1"}],
    //alignments
    [{align:[]}],
    //text size
    [{size:["small", "medium", "large", "huge", false]}],
    //extra features
    ["image", "link", "video", "formula"],
    //adding text color and background color
    [{color:[]}, {background:[]}],
    //font family
    [{font:[]}],
    //code snippet
    ["code-block", "blockquote"],
    ['clean']
]

// Initialize Quill with custom toolbar options
var quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: {
        toolbar: toolbaroptions,
    }
});

// Add a form submit handler to get the Quill content
const addBlogForm = document.getElementById('addBlogForm');
addBlogForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the Quill content as HTML
    const blogContent = quill.root.innerHTML;

    // Set the blogContent value in the form
    const blogContentInput = document.createElement('input');
    blogContentInput.type = 'hidden';
    blogContentInput.name = 'blogContent';
    blogContentInput.value = blogContent;
    addBlogForm.appendChild(blogContentInput);

    // Submit the form
    addBlogForm.submit();
});