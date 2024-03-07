// blog.js

const mongoose = require('mongoose');

// Define schema for blog posts
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageNames: [{ type: String }],
    submissionDate: { type: Date, default: Date.now }
});

// Create model from schema and export it
module.exports = mongoose.model('Blogs', blogSchema);