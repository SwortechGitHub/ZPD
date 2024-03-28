const mongoose = require('mongoose');

// Define schema for blog posts
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    eventDate: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model's ID
    submissionDate: { type: Date, default: Date.now }
});

// Create model from schema and export it
module.exports = mongoose.model('Blogs', blogSchema);