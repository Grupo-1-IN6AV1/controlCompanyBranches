'use strict'

const branchController = require('../controllers/branch.controller');
const express = require('express');
const api = express.Router();
const mdAuth = require('../services/authenticated');


api.get('/testBranch', branchController.branchTest);
api.post('/saveBranch', mdAuth.ensureAuth, branchController.saveBranch);
api.post('/addProduct/:id', mdAuth.ensureAuth, branchController.addProductBranch);
api.delete('/deleteProduct/:id', mdAuth.ensureAuth, branchController.deleteProductBranch);


module.exports = api; 