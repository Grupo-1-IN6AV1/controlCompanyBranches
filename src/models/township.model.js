'use strict';

const mongoose = require('mongoose');
const townshipSchema = mongoose.Schema({ 
    name: String
});

module.exports = mongoose.model('Township', townshipSchema);