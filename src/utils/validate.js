'use strict'

const bcrypt = require('bcrypt-nodejs');
const Company = require('../models/company.model');

exports.validateData = (data) =>
{
    let keys = Object.keys(data), msg = '';

    for(let key of keys)
    {
        if(data[key] !== null && data[key] !== undefined && data[key] !== '') continue;
        msg += `The params ${key} es obligatorio\n`
    }
    return msg.trim();
}

exports.alreadyCompany = async (username)=>{
   try{
    let exist = Company.findOne({username:username}).lean()
    return exist;
   }catch(err){
       return err;
   }
}

exports.encrypt = async (password) => {
    try{
        return bcrypt.hashSync(password);
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPassword = async (password, hash)=>{
    try{
        return bcrypt.compareSync(password, hash);
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkPermission = async (userId, sub)=>{
    try{
        if(userId != sub){
            return false;
        }else{
            return true;
        }
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.checkUpdate = async (user)=>{
    if(user.password || Object.entries(user).length === 0 || user.role){
        return false;
    }else{
        return true;
    }
}


exports.checkUpdated = async (user)=>{
    try{
        if(user.password || Object.entries(user).length === 0 || user.role ){
            return false;
        }else{
            return true; 
        }
    }catch(err){
        console.log(err); 
        return err; 
    }
}

