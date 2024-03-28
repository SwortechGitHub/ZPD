const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('../models/User');
const Blogs = require('../models/blogs');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder;
        if (file.mimetype.startsWith('image/')) {
            folder = 'Media_images';
        } else if (file.mimetype.startsWith('application/pdf') || file.mimetype.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            folder = 'Documents';
        } else {
            folder = 'Profile_images';
        }
        cb(null, `Public/uploads/${folder}/`);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename
    }
});

const upload = multer({ storage: storage });


// Middleware
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json());
router.use(express.static('Public'));

// Session configuration
router.use(session({
    secret: process.env.SESSION_SECRET || 'long_random_string_here',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production', // Enable secure cookie in production
        sameSite: 'strict' // Mitigate CSRF attacks by setting strict same-site policy
    }
}));

// Authorization middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

const hasPermission = (permission) => {
    return (req, res, next) => {
        if (req.session.user && req.session.user.permissions && req.session.user.permissions[permission]) {
            next();
        } else {
            res.status(403).send('Forbidden');
        }
    };
};

// Routes
router.get('/', isAuthenticated, (req, res) => {
    res.render('admin2', { content: "admin/dashboard", session: req.session});
});

// Route to handle the creation of a new blog
router.post('/blogs', isAuthenticated, hasPermission('postBlogs'), async (req, res, next) => {
    try {
      // Extract the blog data from the request body
      const { title, content, eventDate } = req.body;
  
      // Create a new blog document
      const newBlog = new Blogs({
        title,
        content,
        eventDate,
        author: req.session.userId // Assuming you have a way to get the current user's ID from the session
      });
  
      // Save the new blog to the database
      await newBlog.save();
  
      // Redirect back to the list of blogs or to the newly created blog's page
      res.redirect('/admin/blogs');
    } catch (error) {
      // Pass the error to the next middleware for error handling
      next(error);
    }
  });

router.get('/blogs', isAuthenticated, hasPermission('postBlogs'), async (req, res, next) => {
    try {
      // Fetch all blogs from the database
      const blogs = await Blogs.find({});
  
      // Render the 'admin2' view and pass the blogs and session data
      res.render('admin2', { content: "admin/blogs", session: req.session, blogs });
    } catch (error) {
      // Pass the error to the next middleware for error handling
      next(error);
    }
  });
router.get('/pages', isAuthenticated, hasPermission('makePages'), (req, res) => {
    res.render('admin2', { content: "admin/pages", session: req.session});
});

router.get('/files', isAuthenticated, hasPermission('uploadFiles'), async (req, res) => {
    try {
        // Example: Get list of files from specific folders
        const mediaImages = await readFilesFromFolder('Media_images');
        const profileImages = await readFilesFromFolder('Profile_images');
        const documents = await readFilesFromFolder('Documents');

        res.render('admin2', { content: "admin/files", session: req.session, mediaImages, profileImages, documents });
    } catch (err) {
        console.error('Error reading files:', err);
        res.status(500).send('Error reading files');
    }
});

async function readFilesFromFolder(folderName) {
    return new Promise((resolve, reject) => {
        const folderPath = path.join(__dirname, '..', 'Public', 'uploads', folderName);

        fs.readdir(folderPath, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

// File Upload Route
router.post('/upload', upload.single('file'), (req, res) => {
    // Handle file upload
    const file = req.file;
    // Process and store the file
    // You may want to save file metadata in a database
    res.redirect('/admin/files');
});

// File Deletion Route
router.delete('/files/:folder/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'Public', 'uploads', filename); // Construct the full file path

    // Delete file from storage directory
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
            res.status(500).json({ error: 'Error deleting file', message: err.message });
        } else {
            console.log('File deleted successfully:', filename);
            // Fetch the updated list of files
            fs.readdir(path.join(__dirname, '..', 'Public', 'uploads'), (err, files) => {
                if (err) {
                    console.error('Error reading files:', err);
                    res.status(500).json({ error: 'Error reading files', message: err.message });
                } else {
                    // Render the admin files page with the updated file list
                    res.render('admin2', { content: "admin/files", files: files });
                }
            });
        }
    });
});

router.post('/create-user', async (req, res) => {
    const { username, password, uploadFiles, makePages, postBlogs, manageProfiles } = req.body;

    // Validate input data
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
  
    try {
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const userPermissions = {
        uploadFiles: uploadFiles || false,
        makePages: makePages || false,
        postBlogs: postBlogs || false,
        manageProfiles: manageProfiles || false,
      };
  
      const user = new User({
        username,
        password: hashedPassword,
        permissions: userPermissions,
        profilePicture: 'uploads/images/profile_picture.webp', // Update this if you want to handle profile picture uploads
      });
  
      const savedUser = await user.save();
      res.redirect("/admin/profiles")
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'An error occurred while creating the user' });
    }
  });

router.get('/profiles', isAuthenticated, hasPermission('manageProfiles'), async(req, res) => {
    try {
        const users = await User.find();
        res.render('admin2', { content: "admin/profiles", users: users, session: req.session});
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/admin');
    } else {
        res.render('login', { message: '' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.loggedIn = true;
            req.session.user = {
                username: user.username,
                permissions: user.permissions // Store user permissions in the session
            };

            // Store username and image path in the session
            req.session.username = user.username;
            req.session.imagePath = user.profilePicture;

            req.session.save(() => {
                res.redirect('/admin');
            });
        } else {
            res.render('login', { message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/admin/login');
        }
    });
});

module.exports = router;
