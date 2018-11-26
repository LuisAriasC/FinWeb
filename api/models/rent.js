//MODELO RENT
'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RentSchema = Schema({
  date_init: Date,
  date_end: Date,
  status: String,
  client:{
    type: Schema.ObjectId,
    ref: 'Client'
  },
  total_books: Number,
  books: {
      book1: {
        type: Schema.ObjectId,
        ref: 'Book'
      },
      book2: {
        type: Schema.ObjectId,
        ref: 'Book'
      },
      book3: {
        type: Schema.ObjectId,
        ref: 'Book'
      },
      book4: {
        type: Schema.ObjectId,
        ref: 'Book'
      },
      book5: {
        type: Schema.ObjectId,
        ref: 'Book'
      }
  }
});

module.exports = mongoose.model('Rent', RentSchema);
