'use strict'

const branchController = require('../controllers/branch.controller');
const express = require('express');
const api = express.Router();
const mdAuth = require('../services/authenticated');


api.get('/testBranch', branchController.branchTest);
api.post('/saveBranch', mdAuth.ensureAuth, branchController.saveBranch);
api.post('/addProduct/:id', mdAuth.ensureAuth, branchController.addProductBranch);
api.put('/updateBranch/:id', mdAuth.ensureAuth, branchController.updateBranch);
api.delete('/deleteBranch/:id', mdAuth.ensureAuth, branchController.deleteBranch);
api.delete('/deleteProduct/:id', mdAuth.ensureAuth, branchController.deleteProductBranch);
api.put('/updateProduct/:id', mdAuth.ensureAuth, branchController.updateBranchProduct);
api.put('/salesProduct/:id', mdAuth.ensureAuth, branchController.salesProduct);
api.get('/mostSalesProducts/:id', mdAuth.ensureAuth, branchController.mostSalesProducts);
api.get('/getProductsBranch/:id', mdAuth.ensureAuth, branchController.getProductsBranch);

//Funciones del Admin//
api.post('/saveBranchIsAdmin', [mdAuth.ensureAuth, mdAuth.isAdmin], branchController.saveBranchIsAdmin);
api.delete('/deleteBranchIsAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], branchController.deleteBranchIsAdmin);
api.put('/updateBranchIsAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], branchController.updateBranchIsAdmin);

module.exports = api; 