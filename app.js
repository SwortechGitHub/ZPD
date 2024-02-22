const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');

// Import the Blog model
const Blog = require('./models/blog');

// MongoDB connection URI
const dbURI = 'mongodb+srv://Server:D9sI5OujpRS3dMuu@schoolwen.ow8o4jw.mongodb.net/JVG?'

// Connect to MongoDB database
mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const app = express();

// Register view engine
app.set('view engine', 'ejs');

// Middleware to make static files public
app.use(express.static('Public'));
app.use(express.urlencoded({ extended: true })); // Middleware to parse POST request body

// Middleware for session
app.use(session({
    secret: 'secret', // Replace with a long, randomly generated string
    resave: false, // Prevents unnecessary session updates
    saveUninitialized: true, // Allows uninitialized sessions to be saved
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // Set the session duration to 24 hours
        // Add 'secure: true' if serving over HTTPS
    }
}));

// Middleware for file uploads
app.use(fileUpload());

// Hardcoded admin credentials (for demo purposes)
const adminCredentials = {
    username: 'admin',
    password: '123'
};

// Inside your Express route for rendering admin.ejs
app.get('/admin', (req, res) => {
    // Check if the admin is logged in
    if (req.session.loggedIn) {
        // Assuming imageNames is populated correctly in your route handler
        const imageNames = req.session.files || [];
        res.render('admin', { imageNames });
    } else {
        res.redirect('/admin/login');
    }
});


// Login route
app.get('/admin/login', (req, res) => {
    res.render('frame', { content: 'partials/login', style: 'login.css', message: '' }); // Render the login form
});

// POST request to handle login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the credentials are correct
    if (username === adminCredentials.username && password === adminCredentials.password) {
        req.session.loggedIn = true; // Set loggedIn flag in session

        // Retrieve image names from the 'images' folder
        const imagesFolder = path.join(__dirname, 'Public', 'uploads' ,'images');
        fs.readdir(imagesFolder, (err, files) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal Server Error');
            }
            // Store file names in session storage
            req.session.files = files;
            req.session.save(() => {
                req.session.touch();
                res.redirect('/admin'); // Redirect to admin panel
            });
        });
    } else {
        res.render('frame', { content: 'partials/login', style: 'login.css', message: 'Invalid username or password' }); // Render login form with error message
    }
});

// Logout route
app.get('/admin/logout', (req, res) => {
    // Destroy session and remove stored files
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/admin/login'); // Redirect to login page
    });
});

// Handle form submission for adding a blog post
app.post('/admin/add-blog', async (req, res) => {
    const { blogTitle, blogContent, imageSelect, blogDate } = req.body;

    try {
        // Create a new blog post object
        const newBlog = new Blog({
            title: blogTitle,
            content: blogContent,
            imageNames: imageSelect, // Assuming imageSelect is an array of image names
            submissionDate: blogDate || Date.now() // Use provided date or today's date if not provided
        });

        // Save the new blog post to the database
        await newBlog.save();

        // Redirect to admin page or display a success message
        res.redirect('/admin');
    } catch (error) {
        // Handle errors, such as validation errors or database connection issues
        console.error('Error adding blog post:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Upload route
app.post('/admin/upload', (req, res) => {
    const folder = req.body.folder; // Get the selected folder
    const file = req.files.file; // Get the uploaded file
    const originalFileName = file.name; // Get the original file name

    // Extract the file name and extension
    const fileExtension = path.extname(originalFileName); // Get file extension
    const fileNameWithoutExtension = path.basename(originalFileName, fileExtension); // Get file name without extension

    // Get the new name from the request body or use the original name
    const newName = req.body.newName || fileNameWithoutExtension;

    // Create the upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, 'Public', 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Construct the new file path with the new name and original extension
    const newFilePath = path.join(uploadDir, newName + fileExtension);

    // Move the uploaded file to the upload directory with the new name
    file.mv(newFilePath, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            // Retrieve file names from the upload directory
            fs.readdir(uploadDir, (err, files) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Internal Server Error');
                }
                // Update stored files in session storage
                req.session.files = files;
                req.session.save(() => {
                    req.session.touch();
                    res.redirect('/admin'); // Redirect to admin panel
                });
            });
        }
    });
});

// Define your other routes here
app.get('/', (req, res) => {
    res.render('frame', { content: 'partials/home', style: '' });
});

app.get('/join', (req, res) => {
    res.render('frame', { content: 'partials/join', style: 'join.css' });
});

app.get('/news', (req, res) => {
    res.render('frame', { content: 'partials/news', style: 'news.css' });
});

// 404 Error handler
app.use((req, res) => {
    res.status(404).render('frame', { content: 'partials/404', style: '' });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
