//CONTROLADOR EMPLOYEE
'use strict'
var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Employee = require('../models/employee');

//CRUD
var CEmployee = require('../models/c_employee');
var UEmployee = require('../models/u_employee');
var DEmployee = require('../models/d_employee');
var jwt = require('../services/jwt');

var employeeController = {};


//CREATE A NEW EMPLOYEE
/*
Function used to create an employee (normal employee).
This function returns the created employee (as a JSON OBJECT)

IMPLEMENTED WITH post
in header send the next params
  Autorization: token_of_the_user
  role: ROLE_ADMIN (It is stored in the client or employee atributes as role: )

in the request parameters send the next atributes in the express url
  m_id: id_of_the_admin (this is mandatory)
*/
employeeController.createEmployee = (req, res) => {

  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICIO'});

  } else {
    if (req.headers.role === 'ROLE_ADMIN') {
      var mannagerId = req.params.m_id;

      var employee = new Employee();
      var params = req.body;

      employee.name = params.name;
      employee.surname = params.surname;
      employee.email = params.email.toLowerCase();
      employee.username = params.username;
      employee.role = 'ROLE_EMPLOYEE';
      employee.image = 'null';
      employee.status = 'ACTIVE_EMPLOYEE';

      if (params.password) {
        //Encriptar contraseña y guardar datos
        bcrypt.hash(params.password, null, null, function(err, hash){
          employee.password = hash;
          if (employee.name != null && employee.surname != null && employee.email != null) {

            //Guarar usuario en BD
            employee.save((err, employeeStored) => {
              if (err) {
                res.status(500).send({message: 'ERROR AL GUARDAR EMPLEADO'});

              }  else {
                if (!employeeStored) {
                  res.status(404).send({message: 'NO SE HA REGISTRADO AL EMPLEADO'});

                } else {
                  var c_employee = new CEmployee();
                  c_employee.date = new Date();
                  //c_employee.mannager = mannagerId;
                  c_employee.employee = employeeStored._id;
                  c_employee.mannager = req.params.m_id;

                  //Guarar registro de mng en BD
                  c_employee.save((err, cemployeeStored) => {
                    if (err) {
                      res.status(500).send({message: 'ERROR AL GUARDAR REGISTRO EMPLEADO'});

                    } else {
                      if (!cemployeeStored) {
                        res.status(404).send({message: 'NO SE HA REGISTRADO EMPLEADO'});

                      } else {
                        res.status(200).send({employee: employeeStored});
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
    } else {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    }
  }
}



//LOGIN AS AN EMPLOYEE
/*
Function used to login as an employee (ADMIN or normal employee).
This function returns a token if the login was correct and the logged employee JSON object

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
employeeController.loginEmployee = (req, res) => {

  var params = req.body;
  var email = params.email;
  var password = params.password;

  Employee.findOne({email: email.toLowerCase()}, (err, employee) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      if (!employee) {
        res.status(404).send({message: 'EL EMPLEADO NO EXISTE'});

      } else {
        //Comprobar contraseña
        bcrypt.compare(password, employee.password, (err, check) => {
          if (check) {
            //Devolver los datos del usuario logeado
            if (params.gethash) { //Generar token con objeto del usuario
                //devolver token de jwt
                res.status(200).send({
                  employee: employee,
                  token: jwt.createToken(employee)
                });
            }
            else {
              res.status(200).send({employee});
            }
          }
          else {
            res.status(404).send({message: 'EL EMPLEADO NO HA PODIDO LOGUEARSE'});
          }
        });
      }
    }
  });
}



//READ EMPLOYEE
/*
Function that returns an employee (as a JSON object) with a given id of the employee

IMPLEMENTED WITH get

in header send the next params
  Authorization: token (this is mandatory)
  role: ROLE_ADMIN (this is mandatory)

in the request parameters send the next atributes in the express url
  id: employee_id (this is mandatory)
*/
employeeController.readEmployee = (req, res) => {

  var employeeId = req.params.id;

  Employee.findById(employeeId, (err, employee) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      if (!employee) {
        res.status(404).send({message: 'EL CLIENTE NO EXISTE'});

      } else {
        res.status(200).send({employee: employee});
      }
    }
  });
/*
  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION_'});

  } else {
    if (req.headers.role != 'ROLE_ADMIN') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
        var employeeId = req.params.id;

        Employee.findById(employeeId, (err, employee) => {
          if (err) {
            res.status(500).send({message: 'ERROR EN LA PETICION'});

          } else {
            if (!employee) {
              res.status(404).send({message: 'EL CLIENTE NO EXISTE'});

            } else {
              res.status(200).send({employee: employee});
            }
          }
        });
    }
  }*/
}


//READ EMPLOYEES
/*
Function that returns the number and a lsit of active employees in a page (as a JSON object)

IMPLEMENTED WITH get

in header send the next params
  Authorization: token (this is mandatory)
  role: ROLE_ADMIN (this is mandatory)

in the request parameters send the next atributes in the express url
  page: number of the page (this is not mandatory)
*/
employeeController.readEmployees = (req, res) => {
  console.log('EMPLOYEES REQ');

  Employee.find({status: 'ACTIVE_EMPLOYEE'}).sort('name').exec(function(err, employees){
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      if (employees) {
        res.json(employees);
        //res.status(404).send({message: 'HOLI'});

      } else {
        res.status(404).send({message: 'NO HAY EMPLEADOS'});
      }
    }
  });
  /*
  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION'});

  } else {
    if (req.headers.role != 'ROLE_ADMIN') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      if (req.params.page) {
        var page = req.params.page;
      } else {
        var page = 1;
      }
      var itemsPerPage = 3;

      Employee.find({status: 'ACTIVE_EMPLOYEE'}).sort('name').exec(function(err, employees){
        if (err) {
          res.status(500).send({message: 'ERROR EN LA PETICION'});

        } else {
          if (employees) {
            Employee.count({status: 'ACTIVE_EMPLOYEE'}, function(err, count) {
               if (err) {
                 res.status(500).send({message: 'ERROR EN LA PETICION'});

               } else {
                 return res.status(500).send({
                   total: count,
                   employees: employees
                 });
               }
            });
          } else {
            res.status(404).send({message: 'NO HAY ARTISTAS'});
          }
        }
      });
    }
  }
  */
}



//UPDATE EMPLOYEE
/*
Function that updates and returns the updated employee (as a JSON object)

IMPLEMENTED WITH put

in header send the next params
  Authorization: token (this is mandatory)
  role: ROLE_ADMIN (this is mandatory)

in the request parameters send the next atributes in the express url
  id: id_of_employee_to_update (this is mandatory)
  admin: id_of_admin (this is mandatory)
*/
employeeController.updateEmployee = (req, res) => {

  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION'});

  } else {
    if (req.headers.role != 'ROLE_ADMIN') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      var employeeId = req.params.id;
      var adminId = req.params.admin;
      var update = req.body;

      Employee.findByIdAndUpdate(employeeId, update, (err, employeeUpdated) => {
        if (err) {
          res.status(500).send({message: 'Error al actualizar empleado'});

        } else {
          if (!employeeUpdated) {
            res.status(404).send({message: 'No se ha podido actualizar al empleado'});
          } else {

            var u_employee = new UEmployee();
            u_employee.date = new Date();
            u_employee.before = employeeUpdated;
            u_employee.employee = employeeUpdated._id;
            u_employee.mannager = adminId;


            Employee.findOne({_id: employeeId}, (err, upEmployee) => {
              if (err) {
                res.status(500).send({message: 'ERROR EN LA PETICION'});

              } else {
                if (!upEmployee) {
                  res.status(404).send({message: 'EL EMPLEADO NO EXISTE'});

                } else {
                  u_employee.after = upEmployee;

                  //Guarar registro de cliente borrado en BD
                  u_employee.save((err, uemployeeStored) => {
                    if (err) {
                      res.status(500).send({message: 'ERROR AL GUARDAR REGISTRO DE CLIENTE ACTUALIZADO'});

                    } else {
                      if (!uemployeeStored) {
                        res.status(404).send({message: 'NO SE HA REGISTRADO LA ACTUALIZACION DEL CLIENTE'});

                      } else {
                        //RETURN UPDATED EMPLOYEE
                        res.status(200).send({upEmployee});
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



//DELETE EMPLOYEE
/*
Function that deletes (not really delete, just deactivastes) and returns the deactivated employee (as a JSON object)

IMPLEMENTED WITH delete

in header send the next params
  Authorization: token (this is mandatory)
  role: ROLE_ADMIN (this is mandatory)

in the request parameters send the next atributes in the express url
  id: id_of_employee_to_deactivate (this is mandatory)
  admin: id_of_admin (this is mandatory)
*/
employeeController.deleteEmployee = (req,res) => {

  if (!req.headers.role) {
    res.status(500).send({message: 'ERROR EN LA PETICION'});

  } else {
    if (req.headers.role != 'ROLE_ADMIN') {
      res.status(500).send({message: 'ERROR EN LA PETICION'});

    } else {
      var employeeId = req.params.id;
      var update = {status: 'INACTIVE_EMPLOYEE'};

      Employee.findByIdAndUpdate(employeeId, update, (err, employeeIdUpdated) => {
        if (err) {
          res.status(500).send({message: 'Error al eliminar empleado'});

        } else {
          if (!employeeIdUpdated) {
            res.status(404).send({message: 'No se ha podido eliminar al cliente'});

          } else {
            var d_employee = new DEmployee();
            d_employee.date = new Date();
            d_employee.employee = employeeId;
            d_employee.mannager = req.params.admin;

            Employee.findOne({_id: employeeId}, (err, delEmployee) => {
              if (err) {
                res.status(500).send({message: 'ERROR EN LA PETICION'});

              } else {
                if (!delEmployee) {
                  res.status(404).send({message: 'EL EMPLEADO NO EXISTE'});

                } else {
                  d_employee.client = delEmployee;

                  //Guarar registro de empleado eliminado en BD
                  d_employee.save((err, demployeeStored) => {
                    if (err) {
                      res.status(500).send({message: 'ERROR AL GUARDAR REGISTRO DE EMPLEADO INACTIVO'});

                    } else {
                      if (!demployeeStored) {
                        res.status(404).send({message: 'NO SE HA REGISTRADO DEL EMPLEADO INACTIVO'});

                      } else {
                        res.status(200).send({delEmployee});
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


//UPLOAD EMPLOYEE IMAGE
/*
Function that uploads an image to an employee and returns the employee (as a JSON object)

IMPLEMENTED WITH post

in header send the next params
  Authorization: token (this is mandatory)

in the request parameters send the next atributes in the express url
  id: id_of_employee (this is mandatory)
*/
employeeController.uploadImage = (req, res) => {

  var employeeId = req.params.id;
  var file_name = 'null';

  if (req.files) {
    var file_path = req.files.image.path;
    var file_split = file_path.split('/');
    var file_name = file_split[2];
    var ext_split = file_path.split('.');
    var file_ext = ext_split[1];

    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif') {
      Employee.findByIdAndUpdate(employeeId, {image: file_name}, (err, employeeUpdated) => {
        if (err) {
          res.status(500).send({message: 'Error al subir imagen del empleado'});

        } else {
          if (!employeeUpdated) {
            res.status(404).send({message: 'No se ha podido actualizar al empleado'});

          } else {
            res.status(200).send({image: file_name, employee: employeeUpdated});
          }
        }
      });

    } else {
      res.status(200).send({message: 'Extensión no valida'});
    }

  } else {
    res.status(200).send({message: 'No se ha subido ninguna imagen'});
  }
}



//GET EMPLOYEE IMAGE
/*
Function that returns an employee image file

IMPLEMENTED WITH get

in header send the next params
  Authorization: token (this is mandatory)

in the request parameters send the next atributes in the express url
  id: imageFile (this is mandatory, is the name of the image in the users image: attribute)
*/
employeeController.getImageFile = (req, res) => {
  var imageFile = req.params.imageFile;
  var path_file = './uploads/employees/' + imageFile;
  fs.exists(path_file, function(exists){
    if (exists) {
      res.sendFile(path.resolve(path_file));

    } else {
      res.status(200).send({message: 'No existe la imagen'});
    }
  });
}

//**********************  GET REGISTERS *************************
//GET CREATED EMPLOYEES REGISTERS
/*
Function that returns the register of the created employee or employees, returns the list of the creation of employees with its info

IMPLEMENTED WITH get

in header send the next params
  Autorization: token_of_the_user

in the request parameters send the next atributes in the express url
  e_id: id_of_the_employee (this is not mandatory and is used to get the employee's creation info, if not exist, then return all registers)
*/
employeeController.readCreationsEmployee = (req, res) => {

  var employeeId = req.params.id;

  if (!employeeId) { //Sacar todos las rentas de BD
    var find = CEmployee.find({}).sort('date');
  } else { //Saca rentas del cliente
    var find = CEmployee.find({employee: employeeId}).sort('date');
  }

  find.populate([{path: 'mannager'},{path: 'employee'}]).exec((err, employee_creations) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    } else {
      if (!employee_creations) {
        res.status(404).send({message: 'NO HAY REGISTROS'});
      } else {
        res.status(200).send({employee_creations});
      }
    }
  });
}

/*
Function that returns the updates over an employee

IMPLEMENTED WITH get

in header send the next params
  Autorization: token_of_the_user

in the request parameters send the next atributes in the express url
  id: id_of_the_employee (this is not mandatory and is used to get the employees's updates info, if not exist, then return all registers)
*/
employeeController.readUpdatesEmployee = (req, res) => {

  var employeeId = req.params.id;

  if (!employeeId) { //Sacar todos las rentas de BD
    var find = UEmployee.find({}).sort('date');
  } else { //Saca rentas del cliente
    var find = UEmployee.find({employee: employeeId}).sort('date');
  }

  find.populate([{path: 'mannager'},{path: 'employee'}]).exec((err, employee_updates) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    } else {
      if (!employee_updates) {
        res.status(404).send({message: 'NO HAY REGISTROS'});
      } else {
        res.status(200).send({employee_updates});
      }
    }
  });
}



/*
Function that returns the deletion(s) of an employee

IMPLEMENTED WITH get

in header send the next params
  Autorization: token_of_the_user

in the request parameters send the next atributes in the express url
  id: id_of_the_employee (this is not mandatory and is used to get the employees's deletion info, if not exist, then return all registers)
*/
employeeController.readDeletionsEmployee = (req, res) => {

  var employeeId = req.params.id;

  if (!employeeId) { //Sacar todos las rentas de BD
    var find = DEmployee.find({}).sort('date');
  } else { //Saca rentas del cliente
    var find = DEmployee.find({employee: employeeId}).sort('date');
  }

  find.populate([{path: 'mannager'},{path: 'employee'}]).exec((err, employee_deletions) => {
    if (err) {
      res.status(500).send({message: 'ERROR EN LA PETICION'});
    } else {
      if (!employee_deletions) {
        res.status(404).send({message: 'NO HAY REGISTROS'});
      } else {
        res.status(200).send({employee_deletions});
      }
    }
  });
}





employeeController.createAdmin = (req, res) => {

  var employee = new Employee();
  var params = req.body;

  employee.name = "Admin";
  employee.surname = "Admin";
  employee.email = "admin@admin.com"
  employee.username = "Admin";
  employee.role = 'ROLE_ADMIN';
  employee.image = 'null';
  employee.status = 'ACTIVE_ADMIN';

  bcrypt.hash(params.password, null, null, function(err, hash){
    employee.password = hash;
    employee.save((err, adminStored) => {
      if (err) {
        res.status(500).send({message: 'ERROR AL GUARDAR EMPLEADO'});
      }  else {
        if (!adminStored) {
          res.status(404).send({message: 'NO SE HA REGISTRADO AL EMPLEADO'});
        } else {
          res.status(200).send({admin: adminStored});
        }
      }
    });
  });
}


module.exports = employeeController
