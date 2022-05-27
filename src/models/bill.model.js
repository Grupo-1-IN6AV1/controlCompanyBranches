'use strict'

const mongoose = require('mongoose');

const billSchema = mongoose.Schema(
{
    date: String,
    numberBill: String,
    client: String,
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

module.exports = mongoose.model('Bill', billSchema);