//CONTROLADOR CLIENT
'use strict'
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Client = require('../models/client');

//CRUD
var CClient = require('../models/c_client');
var UClient = require('../models/u_client');
var DClient = require('../models/d_client');
var jwt = require('../services/jwt');

var clientController = {};
var express = require('express');
var app = express();

app.use(express.static('FrontOfficeFront'));

app.get('/', function(req, res){
    res.sendfile('FrontOfficeFront/login.html');
});

//CREATE A NEW CLIENT
/*
Function used to create a client.
This function returns the created client (as a JSON OBJECT)

IMPLEMENTED WITH post
in header send the next params
  NO PARAMS IN HEADER

in the request parameters send the next atributes in the express url
  employee: id_of_the_employee_that_created_client (this is not mandatory)
*/
clientController.createClient = (req, res) => {

  if (req.params.employee) {
    if (!req.headers.role) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      if (req.headers.role != 'ROLE_ADMIN') {
        res.status(500).send({message: 'ERROR EN LA PETICION'});

      } else {
          var employeeId = req.params.employee;
          var client = new Client();
          var params = req.body;

          client.name = params.name;
          client.surname = params.surname;
          client.email = params.email;
          client.username = params.username;
          client.role = 'ROLE_USER';
          client.status = 'ACTIVE';
          client.image = 'null';
          client.balance = 0;


          if (params.password) {
            //Encriptar contraseña y guardar datos
            bcrypt.hash(params.password, null, null, function(err, hash){
              client.password = hash;
              if (client.name != null && client.surname != null && client.email != null) {

                //Guarar usuario en BD
                client.save((err, clientStored) => {
                  if (err) {
                    res.status(500).send({message: 'ERROR AL GUARDAR CLIENTE'});
                  }
                  else {
                    if (!clientStored) {
                      res.status(404).send({message: 'NO SE HA REGISTRADO EL CLIENTE'});
                    }
                    else {
                      var c_client = new CClient();
                      c_client.date = new Date();
                      c_client.client = clientStored._id;
                      c_client.employee = employeeId;

                      //Guarar registro de cliente borrado en BD
                      c_client.save((err, cclientStored) => {
                        if (err) {
                          res.status(500).send({message: 'ERROR AL GUARDAR REGISTRO DE CLIENTE CREADO'});
                        }
                        else {
                          if (!cclientStored) {
                            res.status(404).send({message: 'NO SE HA REGISTRADO LA CREACION DE CLIENTE'});
                          }
                          else {
                            res.status(200).send({client: clientStored});
                          }
                        }
                      });
                    }
                  }
                });
              }
              else {
                res.status(200).send({message: 'Introduce todos los campos'});
              }
            });
          }
          else{
            res.status(500).send({message: 'Introduce la contraseña'});
          }
      }
    }
  }
  else {
    var employeeId = null;
    var client = new Client();
    var params = req.body;

    client.name = params.name;
    client.surname = params.surname;
    client.email = params.email;
    client.username = params.username;
    client.role = 'ROLE_USER';
    client.status = 'ACTIVE';
    client.image = 'null';
    client.balance = 0;


    if (params.password) {
      //Encriptar contraseña y guardar datos
      bcrypt.hash(params.password, null, null, function(err, hash){
        client.password = hash;
        if (client.name != null && client.surname != null && client.email != null) {

          //Guarar usuario en BD
          client.save((err, clientStored) => {
            if (err) {
              res.status(500).send({message: 'ERROR AL GUARDAR CLIENTE'});
            }
            else {
              if (!clientStored) {
                res.status(404).send({message: 'NO SE HA REGISTRADO EL CLIENTE'});
              }
              else {
                var c_client = new CClient();
                c_client.date = new Date();
                c_client.client = clientStored._id;
                c_client.employee = employeeId;

                //Guarar registro de cliente borrado en BD
                c_client.save((err, cclientStored) => {
                  if (err) {
                    res.status(500).send({message: 'ERROR AL GUARDAR REGISTRO DE CLIENTE CREADO'});
                  }
                  else {
                    if (!cclientStored) {
                      res.status(404).send({message: 'NO SE HA REGISTRADO LA CREACION DE CLIENTE'});
                    }
                    else {
                      res.status(200).send({client: clientStored});
                    }
                  }
                });
              }
            }
          });
        }
        else {
          res.status(200).send({message: 'Introduce todos los campos'});
        }
      });
    }
    else{
      res.status(500).send({message: 'Introduce la contraseña'});
    }
  }
}


//LOGIN AS AN CLIENT
/*
Function used to login as an employee (ADMIN or normal employee).
This function returns a token if the login was correct and the logged client JSON object

IMPLEMENTED WITH post

in header send the next params
  NO PARAMS IN HEADER

in the request parameters send the next atributes in the express url
  NO PARAMS IN URL

in the request body send the next atributes
  email: email_of_the_user (this is mandatory)
  password: password_of_the_user (this is mandatory)
  gethash: true (this is mandatory and with this you reciebe the token, if not, just reciebe employee)
*/
clientController.loginClient = (req, res) => {
  var params = req.body;
  var email = params.email;
  var password = params.password;

  Client.findOne({email: email.toLowerCase()}, (err, client) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    }
    else {
      if (!client) {
        res.status(404).send({message: 'EL CLIENTE NO EXISTE'});
      }
      else {
        //Comprobar contraseña
        bcrypt.compare(password, client.password, (err, check) => {
          if (check) {
            //Devolver los datos del usuario logeado
            if (params.gethash) { //Generar token con objeto del usuario
                //devolver token de jwt
                res.status(200).send({
                  client: client,
                  token: jwt.createToken(client)
                });
            }
            else {
              res.status(200).send({client});
            }
          }
          else {
            res.status(404).send({message: 'EL CLIENTE NO HA PODIDO LOGUEARSE'});
          }
        });
      }
    }
  });
}



//GET CLIENT
/*
Function that returns an employee (as a JSON object) with a given id of the employee

IMPLEMENTED WITH get

in header send the next params
  Authorization: token (this is mandatory)
  role: ROLE_ADMIN this is mandatory) //Just the admin can get user

in the request parameters send the next atributes in the express url
  id: employee_id (this is mandatory)
*/
clientController.readClient = (req, res) => {

  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION_'});

  } else {
    if (req.headers.role != 'ROLE_ADMIN') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      var clientId = req.params.id;

      Client.findById(clientId, (err, client) => {
        if (err) {
          res.status(500).send({message: 'ERROR EN LA PETICION'});
        } else {
          if (!client) {
            res.status(404).send({message: 'EL CLIENTE NO EXISTE'});
          } else {
            res.status(200).send({client: client});
          }
        }
      });
    }
  }
}


//GET CLIENTS
/*
Function that returns the number and a lsit of active clients in a page (as a JSON object)

IMPLEMENTED WITH get

in header send the next params
  Authorization: token (this is mandatory)
  role: ROLE_ADMIN (this is mandatory) just the admin can get the list of clients

in the request parameters send the next atributes in the express url
  page: number of the page (this is not mandatory)
*/
clientController.readClients = (req, res) => {

  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION_'});

  } else {
    if (req.headers.role != 'ROLE_ADMIN') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      if (req.params.page) {
        var page = req.params.page;
      } else {
        var page = 1;
      }
      var itemsPerPage = 10;

      Client.find({status: 'ACTIVE'}).sort('name').paginate(page, itemsPerPage, (err, clients, total) => {
        if (err) {
          res.status(500).send({message: 'ERROR EN LA PETICION'});
        }
        else {
          if (clients) {
            return res.status(500).send({
              total_items: total,
              clients: clients
            });
          }
          else {
            res.status(404).send({message: 'NO HAY CLIENTES'});
          }
        }
      });
    }
  }
}


//UPDATE CLIENT
/*
Function that updates and returns the updated client (as a JSON object)

IMPLEMENTED WITH put

in header send the next params
  Authorization: token (this is mandatory)
  role: ROLE_ADMIN or ROLE_USER(this is mandatory)

in the request parameters send the next atributes in the express url
  id: id_of_client_to_update (this is mandatory)
  employee: id_of_admin (this is not mandatory)
*/
clientController.updateClient = (req, res) => {

  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION_'});

  } else {
    if (req.headers.role != 'ROLE_ADMIN' && req.headers.role != 'ROLE_USER') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      var clientId = req.params.id;
      var update = req.body;

      Client.findByIdAndUpdate(clientId, update, (err, clientUpdated) => {
        if (err) {
          res.status(500).send({message: 'Error al actualizar cliente'});
        }
        else {
          if (!clientUpdated) {
            res.status(404).send({message: 'No se ha podido actualizar al cliente'});
          }
          else {
            var u_client = new UClient();
            u_client.date = new Date();
            u_client.before = clientUpdated;
            u_client.client = clientId;
            if (req.params.employee) {
              u_client.employee = req.params.employee;
            }
            else {
              u_client.employee = null;
            }

            Client.findOne({_id: clientId}, (err, upClient) => {
              if (err) {
                res.status(500).send({message: 'ERROR EN LA PETICION'});
              }
              else {
                if (!upClient) {
                  res.status(404).send({message: 'EL CLIENTE NO EXISTE'});
                }
                else {
                  u_client.after = upClient;

                  //Guarar registro de cliente borrado en BD
                  u_client.save((err, uclientStored) => {
                    if (err) {
                      res.status(500).send({message: 'ERROR AL GUARDAR REGISTRO DE CLIENTE ACTUALIZADO'});
                    }
                    else {
                      if (!uclientStored) {
                        res.status(404).send({message: 'NO SE HA REGISTRADO LA ACTUALIZACION DEL CLIENTE'});
                      }
                      else {
                        res.status(200).send({upClient});
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
  }
}



//DELETE CLIENT
/*
Function that deletes (not really delete, just deactivastes) and returns the deactivated client (as a JSON object)

IMPLEMENTED WITH delete

in header send the next params
  Authorization: token (this is mandatory)
  role: ROLE_ADMIN (this is mandatory) //just admin can delete clients

in the request parameters send the next atributes in the express url
  id: id_of_employee_to_deactivate (this is mandatory)
  employee: id_of_admin_who_deletes_client (this is mandatory)
*/
clientController.deleteClient = (req,res) => {

  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION_'});

  } else {
    if (req.headers.role != 'ROLE_ADMIN') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      var clientId = req.params.id;
      var update = {status: 'INACTIVE'};

      Client.findByIdAndUpdate(clientId, update, (err, clientUpdated) => {
        if (err) {
          res.status(500).send({message: 'Error al actualizar cliente'});
        }
        else {
          if (!clientUpdated) {
            res.status(404).send({message: 'No se ha podido actualizar al cliente'});
          }
          else {
            var d_client = new DClient();
            d_client.date = new Date();
            if (req.params.employee) {
              d_client.employee = req.params.employee;
            }
            else {
              d_client.employee = null;
            }

            Client.findOne({_id: clientId}, (err, upClient) => {
              if (err) {
                res.status(500).send({message: 'ERROR EN LA PETICION'});
              }
              else {
                if (!upClient) {
                  res.status(404).send({message: 'EL CLIENTE NO EXISTE'});
                }
                else {
                  d_client.client = upClient;

                  //Guarar registro de cliente borrado en BD
                  d_client.save((err, dclientStored) => {
                    if (err) {
                      res.status(500).send({message: 'ERROR AL GUARDAR REGISTRO DE CLIENTE INACTIVO'});
                    }
                    else {
                      if (!dclientStored) {
                        res.status(404).send({message: 'NO SE HA REGISTRADO DEL CLIENTE DESACTIVADO'});
                      }
                      else {
                        res.status(200).send({upClient});
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
  }
}


//UPLOAD CLIENTS IMAGE
/*
Function that uploads an image to an employee and returns the employee (as a JSON object)

IMPLEMENTED WITH post

in header send the next params
  Authorization: token (this is mandatory)

in the request parameters send the next atributes in the express url
  id: id_of_client (this is mandatory)
*/
clientController.uploadImage = (req, res) => {

  var clientId = req.params.id;
  var file_name = 'null';

  if (req.files) {
    var file_path = req.files.image.path;
    var file_split = file_path.split('/');
    var file_name = file_split[2];
    var ext_split = file_path.split('.');
    var file_ext = ext_split[1];

    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif') {
      Client.findByIdAndUpdate(clientId, {image: file_name}, (err, clientUpdated) => {
        if (err) {
          res.status(500).send({message: 'Error al actualizar cliente'});
        }
        else {
          if (!clientUpdated) {
            res.status(404).send({message: 'No se ha podido actualizar al cliente'});
          }
          else {
            res.status(200).send({image: file_name, user: clientUpdated});
          }
        }
      });
    }
    else {
      res.status(200).send({message: 'Extensión no valida'});
    }
  }
  else {
    res.status(200).send({message: 'No se ha subido ninguna imagen'});
  }
}



//GET CLIENTS IMAGE
/*
Function that returns a clients image file

IMPLEMENTED WITH get

in header send the next params
  Authorization: token (this is mandatory)

in the request parameters send the next atributes in the express url
  id: imageFile (this is mandatory, is the name of the image in the clients image: attribute)
*/
clientController.getImageFile = (req, res) => {
  var imageFile = req.params.imageFile;
  var path_file = './uploads/clients/' + imageFile;
  fs.exists(path_file, function(exists){
    if (exists) {
      res.sendFile(path.resolve(path_file));
    }
    else {
      res.status(200).send({message: 'No existe la imagen'});
    }
  });
}


//**********************  GET REGISTERS *************************
//GET CREATED EMPLOYEES REGISTERS
/*
Function that returns the register of the created client or clients, returns the list of the creation of clients with its info

IMPLEMENTED WITH get

in header send the next params
  Autorization: token_of_the_user

in the request parameters send the next atributes in the express url
  e_id: id_of_the_client (this is not mandatory and is used to get the clients creation info, if not exist, then return all registers)
*/
clientController.readCreationsClient = (req, res) => {

  var clientId = req.params.id;

  if (!clientId) { //Sacar todos las rentas de BD
    var find = CClient.find({}).sort('date');
  } else { //Saca rentas del cliente
    var find = CClient.find({client: clientId}).sort('date');
  }

  find.populate([{path: 'employee'},{path: 'client'}]).exec((err, client_creations) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    } else {
      if (!client_creations) {
        res.status(404).send({message: 'NO HAY REGISTROS'});
      } else {
        res.status(200).send({client_creations});
      }
    }
  });
}

/*
Function that returns the updates over a client or clients

IMPLEMENTED WITH get

in header send the next params
  Autorization: token_of_the_user

in the request parameters send the next atributes in the express url
  id: id_of_the_client (this is not mandatory and is used to get the client's updates info, if not exist, then return all registers)
*/
clientController.readUpdatesClient = (req, res) => {

  var clientId = req.params.id;

  if (!clientId) { //Sacar todos las rentas de BD
    var find = UClient.find({}).sort('date');
  } else { //Saca rentas del cliente
    var find = UClient.find({client: clientId}).sort('date');
  }

  find.populate([{path: 'employee'},{path: 'client'}]).exec((err, client_updates) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    } else {
      if (!client_updates) {
        res.status(404).send({message: 'NO HAY REGISTROS'});
      } else {
        res.status(200).send({client_updates});
      }
    }
  });
}



/*
Function that returns the deletion(s) of a client

IMPLEMENTED WITH get

in header send the next params
  Autorization: token_of_the_user

in the request parameters send the next atributes in the express url
  id: id_of_the_client (this is not mandatory and is used to get the client's deletion info, if not exist, then return all registers)
*/
clientController.readDeletionsClient = (req, res) => {

  var clientId = req.params.id;

  if (!clientId) { //Sacar todos las rentas de BD
    var find = DClient.find({}).sort('date');
  } else { //Saca rentas del cliente
    var find = DClient.find({client: clientId}).sort('date');
  }

  find.populate([{path: 'employee'},{path: 'client'}]).exec((err, client_deletions) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    } else {
      if (!client_deletions) {
        res.status(404).send({message: 'NO HAY REGISTROS'});
      } else {
        res.status(200).send({client_deletions});
      }
    }
  });
}

module.exports = clientController
