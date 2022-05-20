'use strict'

const Company = require('../models/company.model');
const TypeCompany = require('../models/typeCompany.model');
const Branch = require('../models/branch.model');
const CompanyProduct = require('../models/companyProduct.model');


const {validateData, encrypt, alreadyCompany, checkPassword, checkUpdate, checkPermission, checkUpdateAdmin} = require('../utils/validate');
const jwt = require('../services/jwt');

//FUNCIONES PÚBLICAS
exports.companyTest = async (req, res)=>{
    await res.send({message: 'User Test is running.'})
}


//REGISTRARSE//
exports.register = async(req, res)=>{
    try{
        const params = req.body;
        let data = {
            name: params.name,
            username: params.username,
            password: params.password,
            email: params.email,
            typeCompany: params.typeCompany,
            role: 'EMPRESA'
        };
        let msg = validateData(data);

        const alreadyTypeCompany = await TypeCompany.findOne({_id: data.typeCompany});
        if(!alreadyTypeCompany) return res.send({message: 'Type company not found'});

        if(msg) return res.status(400).send(msg);
        let already = await alreadyCompany(data.username);
        if(already) return res.status(400).send({message: 'Username already in use'});
        data.phone = params.phone;
        data.password = await encrypt(params.password);

        let company = new Company(data);
        await company.save();
        let companyView = await Company.findOne({_id:company._id}).lean().populate('typeCompany');
        return res.send({message: 'Company created successfully', companyView});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error saving Company'});
    }
}

//INICIAR SESIÓN//
exports.login = async(req, res)=>{
    try{
        const params = req.body;
        let data = {
            username: params.username,
            password: params.password
        }
        let msg = validateData(data);

        if(msg) return res.status(400).send(msg);
        let already = await alreadyCompany(params.username);
        if(already && await checkPassword(data.password, already.password)){
            let token = await jwt.createToken(already);
            delete already.password;

            return res.send({message: 'Login successfuly', already, token});
        }else return res.status(401).send({message: 'Invalid credentials'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to login'});
    }
}



//FUNCIONES PRIVADAS//
//EMPRESA//

//ACTUALIZAR SU PROPIA EMPRESA//
exports.update = async(req, res)=>{
    try{
        const companyId = req.params.id;
        const params = req.body;

        //Actualizar solo por token o se puede ingresar id de la empresa?//
        const permission = await checkPermission(companyId, req.user.sub);
        if(permission === false) return res.status(401).send({message: 'You dont have permission to update this company'});

        const companyExist = await Company.findOne({_id: companyId});
        if(!companyExist) return res.send({message: 'Company not found'});

        const validateUpdate = await checkUpdate(params);
        if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});

        let alreadyname = await alreadyCompany(params.username);
        if(alreadyname && companyExist.username != params.username) return res.send({message: 'Username already in use'});

        const companyUpdate = await Company.findOneAndUpdate({_id: companyId}, params, {new: true}).lean();
        if(companyUpdate) return res.send({message: 'Company updated', companyUpdate});
        return res.send({message: 'Company not updated'});

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to update company'});
    }
}



//ELIMINAR SU PROPIA EMPRESA//
exports.deleteCompany = async(req, res)=>{
    try{

        //Eliminar solo por token o se puede ingresar id de la empresa?//
        const companyId = req.params.id;

        const persmission = await checkPermission(companyId, req.user.sub);
        if(persmission === false) return res.status(403).send({message: 'You dont have permission to delete this company'});

        const branchExist = await Branch.find({company: companyId});
        for(let branchDeleted of branchExist){
            const branchDeleted = await Branch.findOneAndDelete({ company: companyId});
            
        }

        const companyProductExist = await CompanyProduct.find({company: companyId});
        for(let branchDeleted of companyProductExist){
            const branchDeleted = await CompanyProduct.findOneAndDelete({ company: companyId});
            
        }

        const companyDeleted = await Company.findOneAndDelete({_id: companyId});
        if(companyDeleted) return res.send({message: 'Account deleted', companyDeleted});
        return res.send({message: 'Company not found or already deleted'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting company'});
    }
}


//BUSCAR LAS SUCURSALES//
exports.searchBranches = async (req, res) =>{
    try{
        const companyId = req.user.sub;
        const getBranches = await Branch.find({company: companyId});
        if(!getBranches) return res.send({message: 'Branches not found'});
        return res.send(getBranches);
    }catch(err){
        console.log(err);
        return err; 
    }
}


//BUSCAR UNA SUCURSAL//
exports.searchBranch = async (req, res) =>{
    try{
        const companyId = req.user.sub;
        const branchId = req.params.id;
        const getBranch = await Branch.findOne({$and:[{_id: branchId },{ company: companyId }]});
        if(!getBranch) return res.send({message: 'Branch not found'});
        return res.send(getBranch);
    }catch(err){
        console.log(err);
        return err; 
    }
}



//------------------------------------------------------------------------------------------------------------//

//FUNCIONES EMPRESAS 
//ADMIN//

//REGISTRAR UNA EMPRESA//
exports.registerIsAdmin = async(req, res)=>{
    try{
        const params = req.body;
        let data = {
            name: params.name,
            username: params.username,
            password: params.password,
            email: params.email,
            typeCompany: params.typeCompany,
            role: params.role,
        };

        let msg = validateData(data);

        const alreadyTypeCompany = await TypeCompany.findOne({_id: data.typeCompany});
        if(!alreadyTypeCompany) return res.send({message: 'Type company not found'});

        if(msg) return res.status(400).send(msg);
        let already = await alreadyCompany(data.username);
        if(already) return res.status(400).send({message: 'Username already in use'});
        data.phone = params.phone;
        data.password = await encrypt(params.password);

        let company = new Company(data);
        await company.save();
        return res.send({message: 'Company created successfully', company});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error saving Company'});
    }
}


//ACTUALIZAR UNA EMPRESA//
exports.updateIsAdmin = async(req, res)=>{
    try{
        const companyId = req.params.id;
        const params = req.body;

        const checkAdmin = await User.findOne({_id: companyId});
            if(checkAdmin.role === 'ADMIN') return res.send({message: 'Updated is not allowed, user is Admin'});

        const companyExist = await Company.findOne({_id: companyId});
            if(!companyExist) return res.send({message: 'Company not found'});

        const validateUpdate = await checkUpdate(params);
            if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});

        let alreadyname = await alreadyCompany(params.username);
            if(alreadyname && companyExist.username != params.username) return res.send({message: 'Username already in use'});

        const companyUpdate = await Company.findOneAndUpdate({_id: companyId}, params, {new: true}).lean();
            if(companyUpdate) return res.send({message: 'Company updated', companyUpdate});
            return res.send({message: 'Company not updated'});

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to update company'});
    }
}



//BORRAR UNA EMPRESA//
exports.deleteCompanyIsAdmin = async(req, res)=>{
    try{
        const companyId = req.params.id;

        const checkAdmin = await User.findOne({_id: companyId});
            if(checkAdmin.role === 'ADMIN') return res.send({message: 'Deleted is not allowed, user is Admin'});

        const branchExist = await Branch.find({company: companyId});
        for(let branchDeleted of branchExist){
            const branchDeleted = await Branch.findOneAndDelete({ company: companyId});
            
        }

        const companyProductExist = await CompanyProduct.find({company: companyId});
        for(let branchDeleted of companyProductExist){
            const branchDeleted = await CompanyProduct.findOneAndDelete({ company: companyId});
            
        }

        const companyDeleted = await Company.findOneAndDelete({_id: companyId});
        if(companyDeleted) return res.send({message: 'Company deleted', companyDeleted});
        return res.send({message: 'Company not found or already deleted'});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting company'});
    }
}


//BUSCAR UNA EMPRESA//
exports.searchCompany = async (req, res) =>{
    try{
        const companyId = req.params.id;
        const getCompany = await Company.findOne({_id: companyId });
        if(!getCompany) return res.send({message: 'Company not found'});
        return res.send(getCompany); 
    }catch(err){
        console.log(err);
        return err; 
    }
}


//MOSTRAR LAS EMPRESAS//
exports.searchCompanies = async (req, res) =>{
    try{
        const getCompany = await Company.find();
        if(!getCompany) return res.send({message: 'Companies not found'});
        return res.send(getCompany); 
    }catch(err){
        console.log(err);
        return err; 
    }
}



//BUSCAR LAS EMPRESAS EXISTENTES//
//Buscar las sucursales ingresando el id de la empresa ?//
exports.searchBranchesIsAdmin  = async (req, res) =>{
    try{
        const companyId = req.params.id;
        const getBranches = await Branch.find({company: companyId});
        if(!getBranches) return res.send({message: 'Branches not found'});
        return res.send(getBranches);
    }catch(err){
        console.log(err);
        return err; 
    }
}


//BUSCAR UNA SUCURSAL//
exports.searchBranchIsAdmin = async (req, res) =>{
    try{
        const branchId = req.params.id;
        const getBranch = await Branch.findOne({_id: branchId });
        if(!getBranch) return res.send({message: 'Branch not found'});
        return res.send(getBranch);
    }catch(err){
        console.log(err);
        return err; 
    }
}


