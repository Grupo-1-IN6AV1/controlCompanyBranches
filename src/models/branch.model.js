'use strict'


const mongoose = require('mongoose');
const branchSchema = mongoose.Schema({

    name: String,
    phone: String, 
    address: String,
    company: {type: mongoose.Schema.ObjectId, ref : 'Company'},
    township: {type: mongoose.Schema.ObjectId, ref : 'Township'},
    branchProducts: [{
        product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
        stock: Number,
        sales: Number
    }]

});

module.exports = mongoose.model('Branch', branchSchema);