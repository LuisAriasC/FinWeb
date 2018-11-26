//MODELO BOOK
'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookSchema = Schema({
  title: String,
  description: String,
  genre: String,
  year: Number,
  pages: Number,
  editorial: String,
  total: Number,
  onloan: Number,
  inhouse: Number,
  image: String,
  type: String,
  file: String,
  author:{
    type: Schema.ObjectId,
    ref: 'Author'
  },
  status: String
});

module.exports = mongoose.model('Book', BookSchema);
