const express = require('express');
const router = express.Router();
const Pages = require('../models/webpages');
  
  router.get('*', async (req, res, next) => {
    try {
      const page = await Pages.findOne({ route: req.path });
  
      if (page) {
        const pages = await Pages.find({ finished: true });
        res.render('frame', {title: page.title, css:'', webPages: pages, content: ''})
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error: page not found');
    }
  });

module.exports = router;