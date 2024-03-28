const express = require('express');
const app = express();
const mongoose = require('mongoose');
const NodeCache = require("node-cache");
const myCache = new NodeCache();

// Import the mongodb models
const Blogs = require('./models/blogs');
const Pages = require('./models/webpages');

// Sets new view engine
app.set('view engine', 'ejs');

// Make static files public
app.use(express.static('Public'));

// Extract data from form
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB database
mongoose.connect('mongodb+srv://Server:D9sI5OujpRS3dMuu@schoolwen.ow8o4jw.mongodb.net/JVG?')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((e) => {
    console.error('Error connecting to MongoDB:', e);
  });

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
};

// Middleware to fetch and cache all pages
const fetchPages = async (req, res, next) => {
  try {
    let pages = myCache.get("finishedPages");
    if (!pages) {
      pages = await Pages.find({ finished: true });
      myCache.set("finishedPages", pages, 300); // Cache for 5 minutes
    }
    req.pages = pages; // Attach pages to the request object
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to render a page with the given title, content, and CSS
const renderPage = (title, content, css) => async (req, res, next) => {
    try {
      // Set the Cache-Control header to cache the HTML for 1 year
      res.set('Cache-Control', 'public, max-age=31536000');
  
      res.render('frame', {
        title: title,
        content: content,
        css: css,
        webPages: req.pages
      });
    } catch (err) {
      next(err);
    }
  };

  app.get('/editor', (req, res) => {
    res.render('editor2');
})

// Fetch all pages before rendering any page
app.use(fetchPages);

const dynRouter = require('./routes/r_dynamic');
app.use(dynRouter);

const adminRouter = require('./routes/r_admin');
app.use('/admin', adminRouter);

// Routes
app.get('/news', renderPage('News', 'partials/news', 'news.css'));
app.get('/blogs/:id', renderPage('Blog', 'partials/full_blog', ''));
app.get('/join', renderPage('Join', 'partials/join', 'join.css'));

// 404 Error handler
app.use((req, res) => {
  res.status(404).render('frame', { content: 'partials/404', css: '', title: '404', webPages: req.pages });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
