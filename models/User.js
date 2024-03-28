//User.js
const mongoose = require('mongoose');

// Define schema for users
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Username (required, unique)
    password: { type: String, required: true }, // Password (required)
    permissions: {
        uploadFiles: { type: Boolean, default: false },
        makePages: { type: Boolean, default: false },
        postBlogs: { type: Boolean, default: false },
        manageProfiles: { type: Boolean, default: false },
        // Add other permissions as needed
    },
    profilePicture: { type: String }, // URL or path to profile picture
});

// Create model from schema and export it
module.exports = mongoose.model('User', userSchema);