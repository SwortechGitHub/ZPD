const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');

// Import the mongodb models
const Blogs = require('./models/blogs');
const Pages = require('./models/webpages');

// Sets new view engine
app.set('view engine', 'ejs');

// Make static files public
app.use(express.static('Public'));

// Serve images from the specified directory
app.use('/images', express.static('Public/uploads/images'));
// API endpoint to get list of image URLs from a folder
app.get('/api/images', (req, res) => {
  const imageFolder = 'Public/uploads/images'; // Path to your image folder
  fs.readdir(imageFolder, (err, files) => {
    if (err) {
      console.error('Error reading image folder:', err);
      res.status(500).send('Error reading image folder');
      return;
    }

    const imageUrls = files
      .filter(file => file.match(/\.(jpg|jpeg|png|webp)$/)) // Filter out non-image files
      .map(file => `/images/${file}`); // Convert file names to image URLs
    res.json(imageUrls);
  });
});

// Extract data from form
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB database
mongoose.connect('mongodb+srv://Server:D9sI5OujpRS3dMuu@schoolwen.ow8o4jw.mongodb.net/JVG?')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((e) => {
    console.error('Error connecting to MongoDB:', e);
    server.close();
  });

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
};

const dynRouter = require('./routes/r_dynamic');
app.use(dynRouter);

const adminRouter = require('./routes/r_admin');
app.use('/admin', adminRouter);

app.get('/news', async (req, res) => {
  try {
    const pages = await Pages
      .find({ published: true })
      .select(['name', 'route', 'title', 'parent']);

    const blogs = await Blogs
      .find({ published: true })
      .sort({ eventDate: -1 })
      .limit(2)
      .select(['_id', 'title', 'eventDate', 'date']);

    res.render('news', {
      title: 'Ziņas',
      webPages: pages,
      blogs: blogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});
app.get('/news/more', async (req, res) => {
  const currentPage = req.query.page
  const limit = 2
  const blogs = await Blogs
    .find({ published: true })
    .skip(currentPage * limit)
    .limit(limit)
    .select(['_id', 'title', 'eventDate', 'date']);
  res.send(blogs)
})

// 404 Error handler
app.use((req, res) => {
  res.status(404)
  .render('frame', {
    html: `<h1>404 Kļūda</h1><p>Jūsu meklētā lapaspuse nav bijusi vai vairs nav pieejama.</p>`,
    css: '',
    title: '404',
    webPages: req.pages });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
