'use strict'

const express = require('express');
const townshipController = require('../controllers/township.controller');
const api = express.Router();
const mdAuth = require('../services/authenticated');

//FUNCIÓN PÚBLICA
api.get('/townshipTest', mdAuth.ensureAuth, mdAuth.isAdmin, townshipController.testTownship);


//FUNCIONES PRIVADAS//
//TOWNSHIP//
api.post('/saveTownship', [mdAuth.ensureAuth, mdAuth.isAdmin], townshipController.saveTownship);
api.put('/updateTownship/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], townshipController.updateTownship);
api.get('/getTownships', [mdAuth.ensureAuth, mdAuth.isAdmin], townshipController.getTownships);
api.delete('/deleteTownship/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], townshipController.deleteTownship);


module.exports = api;