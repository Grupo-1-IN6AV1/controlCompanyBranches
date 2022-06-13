'use strict'

const companyProductController = require('../controllers/companyProduct.controller');
const express = require('express');
const api = express.Router();
const mdAuth = require('../services/authenticated');


api.get('/testProduct', companyProductController.testProduct);

api.post('/saveProduct', mdAuth.ensureAuth, companyProductController.addProduct);
api.get('/getProductsCompany', mdAuth.ensureAuth, companyProductController.getProducts);
api.get('/getProduct/:id', mdAuth.ensureAuth, companyProductController.getProduct);
api.put('/updateProduct/:id', mdAuth.ensureAuth, companyProductController.updateProduct);
api.delete('/deleteProduct/:id', mdAuth.ensureAuth, companyProductController.deleteProduct);

//GETS DE COMPANY//
api.post('/getProductName', mdAuth.ensureAuth, companyProductController.searchProductName);
api.post('/getProductProvider', mdAuth.ensureAuth, companyProductController.searchProductProvider);
api.get('/getProductStockElder', mdAuth.ensureAuth, companyProductController.GetProductStockElder);
api.get('/getProductStockMinor', mdAuth.ensureAuth, companyProductController.GetProductStock);
api.get('/getProductsOrderByUp', mdAuth.ensureAuth, companyProductController.getProductsOrderByUp);
api.get('/getProductsOrderByDown', mdAuth.ensureAuth, companyProductController.getProductsOdernByDown);
api.get('/getProductsOdernByProviderUp', mdAuth.ensureAuth, companyProductController.getProductsOdernByProviderUp);
api.get('/getProductsOdernByProviderDown', mdAuth.ensureAuth, companyProductController.getProductsOdernByProviderDown);

//GETS DE ADMIN//
api.get('/getProductStockElderAdmin', mdAuth.ensureAuth, companyProductController.GetProductStockElderIsAdmin);
api.get('/getProductStockAdmin', mdAuth.ensureAuth, companyProductController.GetProductStockIsAdmin);
api.get('/getProductsOrderByUpAdmin', mdAuth.ensureAuth, companyProductController.getProductsOrderByUpIsAdmin);
api.get('/getProductsOrderByDownAdmin', mdAuth.ensureAuth, companyProductController.getProductsOderByDownIsAdmin);

api.post('/saveProductIsAdmin', [mdAuth.ensureAuth, mdAuth.isAdmin], companyProductController.addProductisAdmin);
api.put('/updateProductIsAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], companyProductController.updateProductIsAdmin);
api.delete('/deleteProductIsAdmin/:id', [mdAuth.ensureAuth, mdAuth.isAdmin], companyProductController.deleteProductIsAdmin);
api.get('/getProducts', mdAuth.ensureAuth, companyProductController.getProductsIsAdmin);

module.exports = api;