'use strict'

const companyProductController = require('../controllers/companyProduct.controller');
const express = require('express');
const api = express.Router();
const mdAuth = require('../services/authenticated');


api.get('/testProduct', companyProductController.testProduct);

api.post('/saveProduct', mdAuth.ensureAuth, companyProductController.addProduct);
api.get('/getProducts', mdAuth.ensureAuth, companyProductController.getProducts);
api.post('/getProduct/:id', mdAuth.ensureAuth, companyProductController.getProduct);
api.put('/updateProduct/:id', mdAuth.ensureAuth, companyProductController.updateProduct);
api.delete('/deleteProduct/:id', mdAuth.ensureAuth, companyProductController.deleteProduct);


api.post('/getProductName', mdAuth.ensureAuth, companyProductController.searchProductName);
api.post('/getProductProvider', mdAuth.ensureAuth, companyProductController.searchProductProvider);
api.get('/getProductStockElder', mdAuth.ensureAuth, companyProductController.GetProductStockElder);
api.get('/getProductStock', mdAuth.ensureAuth, companyProductController.GetProductStock);

module.exports = api; 