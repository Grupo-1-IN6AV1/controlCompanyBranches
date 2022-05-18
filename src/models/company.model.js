'use strict'


const mongoose = require('mongoose');
const companySchema = mongoose.Schema({

    name: String,
    username: String,
    password: String,
    email: String,
    typeCompany: {type: mongoose.Schema.ObjectId, ref: 'TypeCompany'},
    email: String,
    phone: String,
    role: String, 

});

module.exports = mongoose.model('Company', companySchema);