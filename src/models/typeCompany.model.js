'use strict'

const mongoose = require('mongoose');
const typeCompanySchema = mongoose.Schema({
    name: String,
    description: String
});


module.exports = mongoose.model('TypeCompany', typeCompanySchema);