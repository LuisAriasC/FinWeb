//CONTROLADOR RENT
var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Rent = require('../models/rent');
var Book = require('../models/book');
var Client = require('../models/client');

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

var rentController = {};



//CREATE A RENT
/*
in header send the next params
  Autorization: token_of_the_user
  role: ROLE_USER (It is stored in the client or employee atributes as role: )

in the request parameters send the next atributes in the express url
    c_id: id_of_the_client (this is mandatory)

in the request body send the next atributes in the body of the request
  book1: id_of_book (this is not mandatory)
  book2: id_of_book (this is not mandatory)
  book3: id_of_book (this is not mandatory)
  book4: id_of_book (this is not mandatory)
  book5: id_of_book (this is not mandatory)
*/
rentController.createRent = (req, res) => {

  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION'});

  } else {
    if (req.headers.role != 'ROLE_USER') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {

      var total = 0;
      var params = req.body;
      var rent = new Rent();
      rent.date_init = new Date();
      rent.date_end = rent.date_init.addDays(7)
      rent.status = 'ON_LOAN';
      rent.client = req.params.c_id;;
      rent.books.book1 = params.book1;
      rent.books.book2 = params.book2;
      rent.books.book3 = params.book3;
      rent.books.book4 = params.book4;
      rent.books.book5 = params.book5;

      if (rent.books.book1)
        total = total + 1;
      if (rent.books.book2)
        total = total + 1;
      if (rent.books.book3)
        total = total + 1;
      if (rent.books.book4)
        total = total + 1;
      if (rent.books.book2)
        total = total + 1;

      if (total === 0) {
        res.status(500).send({message: 'RENTA AL MENOS UN LIBRO'});
      }

      rent.save((err, rentStored) => {
        if (err) {
          res.status(500).send({message: 'ERROR AL GUARDAR RENTA'});

        } else {
          if (!rentStored) {
            res.status(404).send({message: 'LA RENTA NO HA SIDO GUARDADA'});

          } else {
            res.status(200).send({rent: rentStored});
          }
        }
      });
    }
  }
}



//GET A RENT INFO
/*
in header send the next params
  Autorization: token_of_the_user
  role: ROLE_USER OR ROLE_ADMIN (It is stored in the client or employee atributes as role: )

in the request parameters send the next atributes in the express url
  id: id_of_the_rent (this is mandatory)
*/
rentController.readRent = (req, res) => {

  var rentId = req.params.id;

  Rent.findById(rentId).populate([{path: 'client'}]).exec((err, rent) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      if (!rent) {
        res.status(404).send({message: 'LA RENTA'});
      } else {
        res.status(200).send({rent: rent});
      }
    }
  });
}



//GET RENTS
/*
Used to get the list of active rents of a user or all the stored rents in the db

in header send the next params
  Autorization: token_of_the_user
  role: ROLE_USER OR ROLE_ADMIN (It is stored in the client or employee atributes as role: )

in the request parameters send the next atributes in the express url
  status: ALL or ON_LOAN to get all the rents or just the current active rents
  c_id: id_of_the_client (this is not mandatory, it is used to return the clients rents, if it does not exist, the function will return the complete list of rents in the database)
*/
rentController.readRents = (req, res) => {

  var clientId = req.params.c_id;
  var status = req.params.status;

  if (!clientId) { //Sacar todos las rentas de BD
    if (status === 'ALL') {
      var find = Rent.find({}).sort('date_init');
    } else if (status === 'ON_LOAN') {
      var find = Rent.find({status: status}).sort('date_init');
    } else {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    }
  } else { //Saca rentas del cliente
    if (status === 'ALL') {
      var find = Rent.find({client: clientId}).sort('date_init');
    } else if (status === 'ON_LOAN') {
      var find = Rent.find({client: clientId, status: status}).sort('date_init');
    } else {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    }
  }

  find.populate({path: 'client'}).exec((err, rents) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    } else {
      if (!rents) {
        res.status(404).send({message: 'NO HAY RENTAS'});
      } else {
        res.status(200).send({rents});
      }
    }
  });
}



//Deactivate RENT
/*
Used to set a rent as RETURNED

in header send the next params
  Autorization: token_of_the_user
  role: ROLE_ADMIN (It is stored in employee atributes as role: )

in the request parameters send the next atributes in the express url
  r_id: id_of_the_client (this is mandatory and is the id of a rent, it is used to modify a rent with the given id)
*/
rentController.deactivateRent = (req, res) => {

  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION'});

  } else {
    if (req.headers.role != 'ROLE_ADMIN' && req.headers.role != 'ROLE_USER') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      var rentId = req.params.r_id;
      var update = {
        status: 'RETURNED'
      };

      Rent.findByIdAndUpdate(rentId, update, (err, rentUpdated) => {
        if (err) {
          res.status(500).send({message: 'ERROR AL ACTUALIZAR RENTA'});

        } else {
          if (!rentUpdated) {
            res.status(404).send({message: 'LA RENTA NO HA SIDO ACTUALIZADA'});

          } else {
            //RETURN UPDATED EMPLOYEE
            res.status(200).send({rentUpdated});
          }
        }
      });
    }
  }
}

module.exports = rentController;
