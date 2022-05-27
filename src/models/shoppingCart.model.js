'use strict'

const mongoose = require('mongoose');

const shoppingCartSchema = mongoose.Schema(
{
    client: String,
    dpi: String,
    NIT: String,
    company: {type:mongoose.Schema.ObjectId, ref: 'Company'},
    products: 
    [{
            product: {type:mongoose.Schema.ObjectId, ref: 'CompanyProduct'}, 
            quantity: Number,
            price: Number,
            subTotalProduct: Number
    }],
    IVA: Number,
    subTotal: Number,
    total: Number,
});

module.exports = mongoose.model('ShoppingCart', shoppingCartSchema);