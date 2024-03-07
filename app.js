const express = require('express');
    const app = express();
    // Sets new view engine
    app.set('view engine', 'ejs');
    // Make static files public
    app.use(express.static('Public'));
    // Extract data from form
    app.use(express.urlencoded({ extended: true }));

const mongoose = require('mongoose');
    // Import the mongodb models
    const Blogs = require('./models/blogs');
    const Pages = require('./models/webpages');

    // Connect to MongoDB database
    mongoose.connect('mongodb+srv://Server:D9sI5OujpRS3dMuu@schoolwen.ow8o4jw.mongodb.net/JVG?')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((e) => {
        console.error('Error connecting to MongoDB:', e);
    });

//sends all blogs
    app.get('/news', async (req, res) => {
        try {
            const blogs = await Blogs.find({}); // Retrieve all blogs from the database
            const pages = await Pages.find({ finished: true }); // Retrieve all pages from the database
            const news = await Pages.findOne({ route: '/news' });//gets news page info
    
            // Transform HTML content to plain text for each blog
            blogs.forEach(blog => {
                // Remove HTML tags using regex
                blog.textContent = blog.content.replace(/<[^>]*>/g, '');
            });
    
            res.render('frame', {title: news.title, content: 'partials/news', css: 'news.css', blogs: blogs , webPages:pages});
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    });

// Server-side route to serve full blog content
    app.get('/blogs/:id', async (req, res) => {
        try {
            const pages = await Pages.find({ finished: true }); // Retrieve all pages from the database
            const blog = await Blogs.findById(req.params.id);
            res.render('frame', { title:'Blog' ,content: 'partials/full_blog',  blog: blog, css:'', webPages:pages});
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    });

//join route
    app.get('/join', async (req, res) => {
        try{
            const pages = await Pages.find({ finished: true }); // Retrieve all pages from the database
            const join = await Pages.findOne({ route: '/join' });//gets news page info
            res.render('frame', {title: join.title, content: 'partials/join', css: 'join.css', webPages:pages});
        } catch(err){
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    });

//routers
    const dynRouter = require('./routes/r_dynamic');
        app.use(dynRouter);

    const adminRouter = require('./routes/r_admin');
        app.use('/admin', adminRouter);
    
    app.get('/editor', (req, res) => {
        res.render('editor2');
    })
// 404 Error handler
    app.use( async( req, res) => {
        try {
            const pages = await Pages.find({ finished: true });
            res.status(404).render('frame', { content: 'partials/404', css: '', title: '404', webPages: pages});
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    });

// Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
        
    });
/*
const fileUpload = require('express-fileupload');
    // Middleware for file uploads
    app.use(fileUpload());
*/


