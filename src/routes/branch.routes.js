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
api.post('/deleteProduct/:id', mdAuth.ensureAuth, branchController.deleteProductBranch);
api.put('/updateProduct/:id', mdAuth.ensureAuth, branchController.updateBranchProduct);
api.put('/salesProduct/:id', mdAuth.ensureAuth, branchController.salesProduct);
api.get('/mostSalesProducts/:id', mdAuth.ensureAuth, branchController.mostSalesProducts);
api.get('/getProductsBranch/:id', mdAuth.ensureAuth, branchController.getProductsBranch);
api.get('/getProductsBranchIsAdmin/:id', mdAuth.ensureAuth, branchController.getProductsBranchIsAdmin);
api.post('/getProductBranch/:id', mdAuth.ensureAuth, branchController.getProductBranch);
api.get('/getShoppingCarts', mdAuth.ensureAuth, branchController.getShoppingCart);


api.get('/getProductsBranchStockElder/:id', mdAuth.ensureAuth, branchController.getProductsBranchStockElder);
api.get('/getProductsBranchStockMinor/:id', mdAuth.ensureAuth, branchController.getProductsBranchStockMinor);
api.get('/getProductsBranchNameUp/:id', mdAuth.ensureAuth, branchController.getProductsOrderByUp);
api.get('/getProductsBranchNameDown/:id', mdAuth.ensureAuth, branchController.getProductsOrderByDown);


//Funciones del Admin//
api.post('/saveBranchIsAdmin', [mdAuth.ensureAuth, mdAuth.isAdmin], branchController.saveBranchIsAdmin);
api.delete('/deleteBranchIsAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], branchController.deleteBranchIsAdmin);
api.put('/updateBranchIsAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], branchController.updateBranchIsAdmin);
api.post('/addProductAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], branchController.addProductBranchAdmin);
api.put('/salesProductIsAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], branchController.salesProductIsAdmin);


module.exports = api; 