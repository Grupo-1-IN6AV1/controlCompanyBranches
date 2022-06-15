'use strict'

const bcrypt = require('bcrypt-nodejs');
const Company = require('../models/company.model');
const fs = require('fs');

exports.validateData = (data) => {
    let keys = Object.keys(data), msg = '';

    for (let key of keys) {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '' && data[key] !== "null" && data[key] !== "undefined") continue;
        msg += `The params ${key} is required.\n`
    }
    return msg.trim();
}

exports.alreadyCompany = async (username) => {
    try {
        let exist = Company.findOne({ username: username }).lean()
        return exist;
    } catch (err) {
        return err;
    }
}

exports.encrypt = async (password) => {
    try {
        return bcrypt.hashSync(password);
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkPassword = async (password, hash) => {
    try {
        return bcrypt.compareSync(password, hash);
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkPermission = async (userId, sub) => {
    try {
        if (userId != sub) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

exports.checkUpdate = async (user) => {
    if (user.password || Object.entries(user).length === 0 || user.role) {
        return false;
    } else {
        return true;
    }
}

exports.checkUpdateAdmin = async (user) => {
    if (user.password || Object.entries(user).length === 0) {
        return false;
    } else {
        return true;
    }
}


exports.checkUpdated = async (user) => {
    try {
        if (user.password || Object.entries(user).length === 0 || user.role) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
}

//Eliminación de Datos Innecesarios Carrito de Compras//
exports.detailsShoppingCart = async (shoppingCartId) => {
    const searchShoppingCart = await ShoppingCart.findOne({ _id: shoppingCartId })
        .populate('user')
        .populate('products.product')
        .lean();

    for (var key = 0; key < searchShoppingCart.products.length; key++) {
        delete searchShoppingCart.user.password;
        delete searchShoppingCart.user.role;
        delete searchShoppingCart.products[key].product.stock;
        delete searchShoppingCart.products[key].product.price;
        delete searchShoppingCart.products[key].product.sales;
        delete searchShoppingCart.products[key].product.category;
    }
    return searchShoppingCart;
}

//Validaciones de Imagenes//
exports.validExtension = async (ext, filePath) => {
    try {
        if (ext == 'png' ||
            ext == 'jpg' ||
            ext == 'jpeg' ||
            ext == 'gif') {
            return true;

        } else {

            fs.unlinkSync(filePath);

            return false;

        }
    } catch (err) {
        console.log(err);
        return err;
    }
}
