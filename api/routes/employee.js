//RUTAS CLIENT
'use strict'

var express = require('express');
var employeeController = require('../controllers/employee');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/employees'});

api.post('/employee/:m_id', md_auth.ensureAuth,employeeController.createEmployee);
api.post('/employee-login', employeeController.loginEmployee);
//api.get('/employee/:id', md_auth.ensureAuth, employeeController.readEmployee);
api.get('/employee/:id', employeeController.readEmployee);
api.get('/employees', employeeController.readEmployees);
api.put('/employee/:id/:admin', md_auth.ensureAuth, employeeController.updateEmployee);
api.delete('/employee/:id/:admin', md_auth.ensureAuth, employeeController.deleteEmployee);
api.post('/upload-image-employee/:id', [md_auth.ensureAuth, md_upload] , employeeController.uploadImage);
api.get('/get-image-employee/:imageFile', md_auth.ensureAuth, employeeController.getImageFile);

//GET REGISTERS DONE BY ADMIN
api.get('/ce-register/:id?', md_auth.ensureAuth, employeeController.readCreationsEmployee);
api.get('/ue-register/:id?', md_auth.ensureAuth, employeeController.readUpdatesEmployee);
api.get('/de-register/:id?', md_auth.ensureAuth, employeeController.readDeletionsEmployee);


api.post('/admin', employeeController.createAdmin);

module.exports = api;

// -ed, -io, -lt, -or
