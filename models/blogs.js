const mongoose = require('mongoose');

// Define schema for blog posts
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    eventDate: { type: Date, default: Date.now },
    html: { type: String, required: true },
    css: { type: String, required: true},
    author: { type: String, required: true},
    date: { type: Date, default: Date.now },
    published: { type: Boolean, default: false}
});

// Create model from schema and export it
module.exports = mongoose.model('Blogs', blogSchema);