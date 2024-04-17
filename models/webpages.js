// webpages.js
const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  route: { type: String, required: true },
  title: { type: String, required: true },
  parent: { type: String, required: true },
  published: { type: Boolean, default: false},
  author: { type: String, required: true},
  date: { type: Date, default: Date.now},
  html: {type: String},
  css: {type: String}
});

pageSchema.pre('save', function(next) {
    this.date = new Date();
    next();
  });

module.exports = mongoose.model('Pages', pageSchema);

