'use strict';

const mongoose = require('mongoose');

const userSchema = mongoose.Schema
(
    {
        username: String,
        password: String,
        name: String,
        surname: String,
        email: String,
        phone: String,
        role: String
    }
);

module.exports = mongoose.model('User', userSchema);