const express = require('express');
const router = express.Router();
const Pages = require('../models/webpages');

// Middleware to fetch and cache all pages
const fetchPages = async (req, res, next) => {
  try {
    const pages = await Pages.find({ published: true })
    .select(['name','route','title','parent', 'html', 'css']);
    req.pages = pages;
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to handle page rendering
const renderPage = async (req, res, next) => {
  const page = await Pages.findOne({ route: req.originalUrl });
  if (page!=null) {
    res.render('frame', {
      title: page.title,
      css: page.css || '',
      webPages: req.pages,
      html: page.html || ''
    });
  } else {
    next();
  }
};

// Fetch all pages before rendering any page
router.use(fetchPages);

// Dynamic route for any page
router.get('*', renderPage);

module.exports = router;