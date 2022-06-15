'use strict'


const mongoose = require('mongoose');
const companySchema = mongoose.Schema({
    name: String,
    username: String,
    password: String,
    email: String,
    phone: String,
    role: String,
    typeCompany: {type: mongoose.Schema.ObjectId, ref: 'TypeCompany'} ,
    image: String
});

module.exports = mongoose.model('Company', companySchema);

