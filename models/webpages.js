// webpages.js
const mongoose = require('mongoose');

const partialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: { type: String, required: true }
});

const pageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    route: { type: String, required: true },
    title: { type: String, required: true },
    parent: { type: String, required: true },
    finished: { type: Boolean, default: false },
    deletable: { type: Boolean, default: true },
    partials: [partialSchema] // Array of partials
});

module.exports = mongoose.model('Pages', pageSchema);

