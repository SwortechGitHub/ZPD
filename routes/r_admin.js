const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('../models/User');
const Blogs = require('../models/blogs');
const Pages = require('../models/webpages');

const path = require('path');
const fs = require('fs');
const url = require('url');

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

// Premission middleware
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (req.session.user && req.session.user.permissions && req.session.user.permissions[permission]) {
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  };
};

// Dashboard homepage
router.get('/', isAuthenticated, (req, res) => {
  res.render('admin2', { content: "admin/dashboard", session: req.session});
});

/*---------------------------------------------------Files------------------------------------------------------*/

// Multer setup with configurations
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const directory = file.mimetype.startsWith('image/') ? 'Public/uploads/images' : 'Public/uploads/documents';
    cb(null, directory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage})

// Middleware for uploading file
router.post('/upload', upload.single('file'), function (req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' });
  }
  res.status(200).json({ message: 'File uploaded successfully' });
})

// Middleware for deleting file
router.delete('/files', (req, res) => {
  let x = url.parse(req.url, true)
  fs.unlinkSync("Public/uploads/"+x.query.type+"/"+x.query.file)
});

// Function to get list of files in a directory
function getFileList(folder) {
  const directoryPath = path.join(__dirname,"../Public/uploads", folder);
  return fs.readdirSync(directoryPath);
}

// Middleware for file page
router.get('/files', isAuthenticated, hasPermission('uploadFiles'), async(req, res) => {
  const images = getFileList('images');
  const documents = getFileList('documents');
  res.render('admin2', { content: "admin/files", session: req.session, images, documents });
});

/*---------------------------------------------------Blogs------------------------------------------------------*/

// Middleware for blogs webpage
router.get('/blogs', isAuthenticated, hasPermission('postBlogs'), async (req, res) => {
  const blogs = await Blogs.find().limit(20).exec();
  res.render('admin2', { content: "admin/blogs", session: req.session, blogs});
});

// Middleware with request publishes blogs
router.post('/blogs/publish', isAuthenticated, hasPermission('postBlogs'), (req, res) => {
  const ids = req.body
  Blogs.updateMany(
    { _id: { $in: ids } },
    { $set: { published: true } }
  )
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Couldnt publish' });
  });
  res.json({ message: 'Checked rows received' });
});

// Middleware with request unpublishes blogs
router.post('/blogs/unpublish', isAuthenticated, hasPermission('postBlogs'), (req, res) => {
  const ids = req.body
  Blogs.updateMany(
    { _id: { $in: ids } },
    { $set: { published: false } }
  )
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Couldnt unpublish' });
  });
  res.json({ message: 'Checked rows received' });
});

// Middleware with request deletes blogs
router.delete('/blogs/delete', isAuthenticated, hasPermission('postBlogs'), (req, res) => {
  const ids = req.body
  Blogs.deleteMany({_id: {$in: ids}})
  .catch((err) => {
    console.log(err)
    res.status(500).json({ message: 'Couldnt delete' });
  });
  res.json({ message: 'Checked rows received' });
});

// Middleware for webpages creating webpage
router.get('/blogs/create', isAuthenticated, hasPermission('postBlogs'), (req, res) => {
  res.render('admin/add_blog')
});

// Middleware creates webpage and stores it in the database
router.post('/blogs/create', isAuthenticated, hasPermission('postBlogs'), (req, res) => {
  const { html, css, title, eventDate, finished} = req.body;
  var blog = new Blogs({ html: html, css: css ,author: req.session.username,eventDate: eventDate, title: title, published: finished === 'on' });
  blog.save()
    .then(() => {
      res.redirect("/admin/blogs");
    })
    .catch(error => {
      console.error('Error saving page:', error);
      res.status(500).send('Error saving blog');
    });
});

/*---------------------------------------------------Pages------------------------------------------------------*/

// Middleware for pages webpage
router.get('/pages', isAuthenticated, hasPermission('makePages'), async (req, res) => {
  const pages = await Pages.find().exec();
  res.render('admin2', { content: "admin/pages", session: req.session, pages});
});

// Middleware with request publishes webpages
router.post('/pages/publish', isAuthenticated, hasPermission('makePages'), (req, res) => {
  const ids = req.body
  Pages.updateMany(
    { _id: { $in: ids } },
    { $set: { published: true } }
  )
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Couldnt publish' });
  });
  res.json({ message: 'Checked rows received' });
});

// Middleware with request unpublishes webpages
router.post('/pages/unpublish', isAuthenticated, hasPermission('makePages'), (req, res) => {
  const ids = req.body
  Pages.updateMany(
    { _id: { $in: ids } },
    { $set: { published: false } }
  )
  .catch((err) => {
    console.error(err);
    res.status(500).json({ message: 'Couldnt unpublish' });
  });
  res.json({ message: 'Checked rows received' });
});

// Middleware with request deletes webpages
router.delete('/pages/delete', isAuthenticated, hasPermission('makePages'), (req, res) => {
  const ids = req.body
  Pages.deleteMany({_id: {$in: ids}})
  .catch((err) => {
    console.log(err)
    res.status(500).json({ message: 'Couldnt delete' });
  });
  res.json({ message: 'Checked rows received' });
});

// Middleware for webpages creating webpage
router.get('/pages/create', isAuthenticated, hasPermission('makePages'), (req, res) => {
  res.render('admin/add_page')
});

// Middleware creates webpage and stores it in the database
router.post('/pages/create', isAuthenticated, hasPermission('makePages'), (req, res) => {
  const { html, css, title, name, route, finished, parent } = req.body;
  var page = new Pages({ html: html, css: css, route: '/' + route, author: req.session.username, name: name, title: title, parent: parent, published: finished === 'on' });
  page.save()
    .then(() => {
      res.redirect("/admin/pages");
    })
    .catch(error => {
      console.error('Error saving page:', error);
      res.status(500).send('Error saving page');
    });
});

/*---------------------------------------------------Users------------------------------------------------------*/

// Middlware to create user
router.post('/create-user', async (req, res) => {
  const { username, password, makePages, postBlogs, manageProfiles } = req.body;

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

    user.save();
    res.redirect("/admin/profiles")
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'An error occurred while creating the user' });
  }
});

// Middleware for profiles webpage
router.get('/profiles', isAuthenticated, hasPermission('manageProfiles'), async(req, res) => {
    try {
        const users = await User.find();
        res.render('admin2', { content: "admin/profiles", users: users, session: req.session});
    } catch (err) {
        res.status(500).send(err.message);
    }
});

/*---------------------------------------------------Login------------------------------------------------------*/

// Middleware for login webpage
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/admin');
  } else {
    res.render('login', { message: '' });
  }
});

// Middleware for login
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

// Middleware for logout
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
