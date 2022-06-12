'use strict'

const express = require('express');
const typeCompanyController = require('../controllers/typeCompany.controller');
const api = express.Router();
const mdAuth = require('../services/authenticated');

//FUNCIÓN PÚBLICA
api.get('/typeCompanyTest',  mdAuth.ensureAuth, mdAuth.isAdmin, typeCompanyController.testTypeCompany);


//FUNCIONES PRIVADAS//
//Type Copmany//
api.post('/saveTypeCompany', [mdAuth.ensureAuth, mdAuth.isAdmin], typeCompanyController.saveTypeCompany);
api.put('/updateTypeCompany/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typeCompanyController.updateTypeCompany);
api.get('/getTypeCompany', typeCompanyController.getTypeCompany);
api.get('/getTypeCompanies/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typeCompanyController.getTypeCompanies);
api.delete('/deleteTypeCompany/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], typeCompanyController.deleteTypeCompany);


module.exports = api;