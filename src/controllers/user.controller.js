'use strict'

const User = require('../models/user.model');
const {validateData, encrypt, alreadyUser, 
    checkPassword, checkUpdate, checkPermission,
    checkUpdateAdmin} = require('../utils/validate');
const jwt = require('../services/jwt');

//FUNCIONES PÚBLICAS
exports.userTest = async (req, res)=>{
    await res.send({message: 'User Test is running.'})
}

//FUNCIONES PRIVADAS
//ADMIN

exports.saveUser = async(req, res)=>{
    try{
        const params = req.body;
        const data = {
            name: params.name,
            username: params.username,
            email: params.email,
            password: params.password,
            role: params.role
        };
        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);
        const userExist = await alreadyUser(params.username);
        if(userExist) return res.send({message: 'Username already in use'});
        if(params.role != 'ADMIN' && params.role != 'CLIENT') return res.status(400).send({message: 'Invalid role'});
        
        data.surname = params.surname;
        data.phone = params.phone;
        data.password = await encrypt(params.password);

        const user = new User(data);
        await user.save();
        return res.send({message: 'User saved successfully', user});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error saving user'});
    }
}

exports.updateUser = async(req, res)=>{
    try{
        const userId = req.params.id;
        const params = req.body;

        const userExist = await User.findOne({_id: userId});
        if(!userExist) return res.send({message: 'User not found'});
        const emptyParams = await checkUpdateAdmin(params);
        if(emptyParams === false) return res.status(400).send({message: 'Empty params or params not update'});
        if(userExist.role === 'ADMIN') return res.send({message: 'User with ADMIN role cant update'});
        const alreadyUsername = await alreadyUser(params.username);
        if(alreadyUsername && userExist.username != alreadyUsername.username) return res.send({message: 'Username already taken'});
        if(params.role != 'ADMIN' && params.role != 'CLIENT') return res.status(400).send({message: 'Invalid role'});
        const userUpdated = await User.findOneAndUpdate({_id: userId}, params, {new: true});
        if(!userUpdated) return res.send({message: ' User not updated'});
        return res.send({message: 'User updated successfully', username: userUpdated.username});

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error updating user'});
    }
}

exports.deleteUser = async(req, res)=>{
    try{
        const userId = req.params.id;

        const userExist = await User.findOne({_id: userId});
        if(!userExist) return res.send({message: 'User not found'});
        if(userExist.role === 'ADMIN') return res.send({message: ' Could not deleted User with ADMIN role'});
        const userDeleted = await User.findOneAndDelete({_id: userId});
        if(!userDeleted) return res.send({message: 'User not deleted'});
        return res.send({message: 'Account deleted successfully', userDeleted})
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error removing account'});
    }
}

exports.getUser = async (req, res) => {
    try{
        const userId = req.params.id;

        const user = await User.findOne({ _id: userId});
        if (!user){
            return res.status(400).send({ message: 'This user does not exist.' })
        }else {
            return res.send({message:'User Found:', user});
        }}catch (err) 
    {
        console.log(err)
        return res.status(500).send({ message: 'Error getting User.', err});
    }
};

exports.searchUser = async (req, res)=>{   
    try{
        const params = req.body;
        const data ={
            username: params.username
        }

        const msg = validateData(data);

        if(!msg){
            const user = await User.find({username: {$regex: params.username, $options:'i'}});
            return res.send({message:'User Founds', user});
        }else{
            return res.status(400).send(msg);
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error searching Users.', err});
    }
}