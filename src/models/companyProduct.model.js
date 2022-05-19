'use strict'


const mongoose = require('mongoose');
const companyProductSchema = mongoose.Schema({
    name: String,
    description: String,
    price: String,  
    providerName: String,
    stock: Number,
    sales: Number,
    company: { type: mongoose.Schema.ObjectId, ref: 'Company' }
});

module.exports = mongoose.model('CompanyProduct', companyProductSchema);

