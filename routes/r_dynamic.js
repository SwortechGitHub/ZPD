const express = require('express');
const router = express.Router();
const Pages = require('../models/webpages');
const NodeCache = require("node-cache");
const myCache = new NodeCache();

// Custom error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error: page not found');
};

// Middleware to fetch and cache all pages
const fetchPages = async (req, res, next) => {
  try {
    let pages = myCache.get("allPages");
    if (!pages) {
      pages = await Pages.find({});
      myCache.set("allPages", pages, 300); // Cache for 5 minutes
    }
    req.pages = pages; // Attach pages to the request object
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to handle page rendering
const renderPage = (req, res, next) => {
  const page = req.pages.find(p => p.route === req.path);
  if (page) {
    res.render('frame', {
      title: page.title,
      css: page.css || '',
      webPages: req.pages,
      content: page.content || ''
    });
  } else {
    next();
  }
};

// Fetch all pages before rendering any page
router.use(fetchPages);

// Dynamic route for any page
router.get('*', renderPage);

router.use(errorHandler);

module.exports = router;