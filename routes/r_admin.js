const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Pages = require('../models/webpages');
const Blogs = require('../models/blogs');

// Hardcoded admin credentials (for demo purposes)
const adminCredentials = {
    username: 'admin',
    password: '123'
};

const session = require('express-session');
    // Session
    router.use(session({
        secret: 'secret', // Replace with a long, randomly generated string
        resave: false, // Prevents unnecessary session updates
        saveUninitialized: true, // Allows uninitialized sessions to be saved
        cookie: {
            maxAge: 24 * 60 * 60 * 1000 // Set the session duration to 24 hours
            // Add 'secure: true' if serving over HTTPS
        }
    }));


// Inside your Express route for rendering admin.ejs
router.get('/', async (req, res) => {
    try {
        // Check if the admin is logged in
        if (req.session.loggedIn) {
            // Query MongoDB to retrieve pages
            const pages = await Pages.find();
            const imageNames = req.session.files || [];
            res.render('admin', { imageNames, pages });
        } else {
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login route
router.get('/login', (req, res) => {
    res.render('login', {message: ''}); // Render the login form
});

// POST request to handle login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the credentials are correct
    if (username === adminCredentials.username && password === adminCredentials.password) {
        req.session.loggedIn = true; // Set loggedIn flag in session

        // Retrieve image names from the 'images' folder
        const imagesFolder = path.join(__dirname, '..','Public', 'uploads' ,'images');
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
        res.redirect('/admin/login');
    }
});

// Logout route
router.get('/logout', (req, res) => {
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
router.post('/add-blog', async (req, res) => {
    const { blogTitle, blogContent, imageSelect, blogDate } = req.body;

    try {
        // Create a new blog post object
        const newBlog = new Blogs({
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

// Define route to handle form submission
router.post('/add-page', async (req, res) => {
    try {
        const { name, title, parent, finished } = req.body;

        // Create a new page object with the submitted values
        const page = new Pages({
            name,
            route: '/'+name,
            title,
            parent,
            finished: !!finished // Convert string to boolean
        });

        // Save the page object to the database
        await page.save();

        // Redirect to some page after successfully adding the page
        res.redirect('/admin');
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Upload route
router.post('/upload', (req, res) => {
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

// Define route to handle DELETE requests to delete a page
router.delete('/pages/:pageId', async (req, res) => {
    const { pageId } = req.params;

    try {
        // Check if page exists
        const page = await Pages.findById(pageId);
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }

        // Delete page from database
        await Pages.findByIdAndDelete(pageId);

        // Send success response
        res.status(200).json({ message: 'Page deleted successfully' });
    } catch (error) {
        console.error('Error deleting page:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;