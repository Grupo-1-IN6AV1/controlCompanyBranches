'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secretKey = 'SecretKeyToExample';

exports.createToken = async (user)=>{
    try{
        const payload = {
            sub: user._id,
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.emai,
            role: user.role,
            iat: moment().unix(),
            exp: moment().add(3, 'hour').unix()
        }
        return jwt.encode(payload, secretKey);
    }catch(err){
        console.log(err);
        return err
    }
}