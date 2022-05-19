'use strict'


const mongoose = require('mongoose');
const branchSchema = mongoose.Schema({

    name: String,
    phone: String, 
    address: String,
    company: {type: mongoose.Schema.ObjectId, ref : 'Company'},
    township: {type: mongoose.Schema.ObjectId, ref : 'Township'},
    products : [{
            price: Number,
            stock: Number,
            sales: Number,
            companyProduct: {type: mongoose.Schema.ObjectId, ref: 'CompanyProduct'}, 
    }],

});

module.exports = mongoose.model('Branch', branchSchema);

