'use strict';

/*----------- Modulo intermediario de Express |Router| ----------- */

//Importación del Controlador -Usuario-
const billController = require('../controllers/bill.controller');

//Constante del Servidor de Express
const express = require('express');

//API enrutador de Express
const api = express.Router();

//Variable de Autenticación - MiddleWare
const mdAuth = require('../services/authenticated');


/*----------- R U T A S -----------*/

//P Ú B L I C A S//
api.get('/testBill', billController.testBill);

//Usuarios//
api.post('/createBill', mdAuth.ensureAuth, billController.createBill);

module.exports = api;