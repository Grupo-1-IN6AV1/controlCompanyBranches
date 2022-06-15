'use strict'

const Company = require('../models/company.model');
const TypeCompany = require('../models/typeCompany.model');
const Branch = require('../models/branch.model');
const CompanyProduct = require('../models/companyProduct.model');

//Connect Multiparty Upload Image//
const fs = require('fs');
const path = require('path');

const {validateData, encrypt, alreadyCompany, checkPassword, checkUpdate, checkPermission, checkUpdateAdmin, validExtension} = require('../utils/validate');
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
            role: 'COMPANY'
        };
        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);

        const alreadyTypeCompany = await TypeCompany.findOne({_id: data.typeCompany});
        if(!alreadyTypeCompany) return res.status(400).send({message: 'Type company not found'});

        let alreadyUsername = await alreadyCompany(data.username);
        if(alreadyUsername) return res.status(400).send({message: 'Username already in use'});

        let alreadyName = await Company.findOne({name:data.name});
        if(alreadyName) return res.status(400).send({message: 'Name already in use'});

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

            return res.send({message: 'Login Successfully', already, token});
        }else return res.status(401).send({message: 'Invalid Credentials'});
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

        let alreadyUsername = await alreadyCompany(params.username);
        if(alreadyUsername && companyExist.username != params.username) return res.status(400).send({message: 'Username already in use'});
        
        let alreadyName = await Company.findOne({name: params.name});
            if(alreadyName && companyExist.name != params.name) return res.status(400).send({message: 'Name already in use'});
        
            const companyUpdate = await Company.findOneAndUpdate({_id: companyId}, params, {new: true}).populate('typeCompany').lean();
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

        //INGRESAR CONTRASEÑA PARA ELIMINAR//
        const params = req.body;

        const password = params.password;
        const data =
        {
            password: password
        }

        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);

        const persmission = await checkPermission(companyId, req.user.sub);
        if(persmission === false) return res.status(403).send({message: 'You dont have permission to delete this company'});

        const companyExist = await Company.findOne({_id:companyId});

        if(companyExist && await checkPassword(password, companyExist.password))
        {
            const branchExist = await Branch.find({company: companyId});
            for(let branchDeleted of branchExist)
            {
                const branchDeleted = await Branch.findOneAndDelete({ company: companyId});
            }

            const companyProductExist = await CompanyProduct.find({company: companyId});
            for(let branchDeleted of companyProductExist)
            {
                const branchDeleted = await CompanyProduct.findOneAndDelete({ company: companyId});
            }

            const companyDeleted = await Company.findOneAndDelete({_id: companyId}).populate('typeCompany');
            if(companyDeleted) return res.send({message: 'Account deleted', companyDeleted});
            return res.send({message: 'Company not found or already deleted'});
        }

        return res.status(400).send({message:'The password is not correct'})

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting company'});
    }
}


//BUSCAR LAS SUCURSALES//
exports.searchBranches = async (req, res) =>{
    try{
        const companyId = req.user.sub;
        const getBranches = await Branch.find({company: companyId}).populate('company township products.companyProduct').lean();
        if(!getBranches) return res.status(400).send({message: 'Branch Not Found'});
        
        for(let companyData of getBranches)
            {
                companyData.company.username = undefined;
                companyData.company.password = undefined
                companyData.company.email = undefined
                companyData.company.phone = undefined
                companyData.company.role = undefined
                companyData.company.typeCompany = undefined
                companyData.company.__v = undefined
                delete companyData.company._id;
            }
        if(!getBranches) return res.send({message: 'Branches not found'});
        return res.send({message:'Branches Found:', getBranches});
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
        const getBranch = await Branch.findOne({$and:[{_id: branchId },{ company: companyId }]}).populate('company township products.companyProduct').lean();
        if(!getBranch) return res.status(400).send({message: 'Branch Not Found'});

        getBranch.company.username = undefined;
        getBranch.company.password = undefined
        getBranch.company.email = undefined
        getBranch.company.phone = undefined
        getBranch.company.role = undefined
        getBranch.company.typeCompany = undefined
        getBranch.company.__v = undefined
        delete getBranch.company._id;
        
        if(!getBranch) return res.send({message: 'Branch not found'});
        return res.send({message:'Branch Found:', getBranch});
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
            role: 'COMPANY',
        };

        let msg = validateData(data);
        if(msg) return res.status(400).send(msg);

        const alreadyTypeCompany = await TypeCompany.findOne({_id: data.typeCompany});
        if(!alreadyTypeCompany) return res.send({message: 'Type company not found'});

        let already = await alreadyCompany(data.username);
        if(already) return res.status(400).send({message: 'Username already in use'});
        
        let alreadyName = await Company.findOne({name:data.name});
        if(alreadyName) return res.status(400).send({message: 'Name already in use'});
        
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

        const checkAdmin = await Company.findOne({_id: companyId});
            if(checkAdmin.role === 'ADMIN') return res.send({message: 'Updated is not allowed, user is Admin'});

        const companyExist = await Company.findOne({_id: companyId});
            if(!companyExist) return res.send({message: 'Company not found'});

        const validateUpdate = await checkUpdateAdmin(params);
            if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});

        let alreadyUsername = await alreadyCompany(params.username);
            if(alreadyUsername && companyExist.username != params.username) return res.status(400).send({message: 'Username already in use'});
        
        let alreadyName = await Company.findOne({name: params.name});
            if(alreadyName && companyExist.name != params.name) return res.status(400).send({message: 'Name already in use'});

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

        const checkAdmin = await Company.findOne({_id: companyId});
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
        const getCompany = await Company.find({role:'COMPANY'}).populate('typeCompany');
        if(!getCompany) return res.send({message: 'Companies not found'});
        return res.send({message:'Companies Found', getCompany}); 
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
        const getBranches = await Branch.find({company: companyId}).populate('company township products.companyProduct').lean();
        if(!getBranches) return res.status(400).send({message: 'Branch Not Found'});
        return res.send({message:'Branches Found:', getBranches});
    }catch(err){
        console.log(err);
        return err; 
    }
}


//BUSCAR UNA SUCURSAL//
exports.searchBranchIsAdmin = async (req, res) =>{
    try{
        const branchId = req.params.id;
        const getBranch = await Branch.findOne({_id: branchId }).populate('company township products.companyProduct').lean();
        if(!getBranch) return res.status(400).send({message: 'Branch Not Found'});
        
        getBranch.company.username = undefined;
        getBranch.company.password = undefined
        getBranch.company.email = undefined
        getBranch.company.phone = undefined
        getBranch.company.role = undefined
        getBranch.company.typeCompany = undefined
        getBranch.company.__v = undefined
            
            for(var key = 0; key < getBranch.products.length; key++)
            {

                delete getBranch.products[key].companyProduct.stock;
                delete getBranch.products[key].companyProduct.sales;
                delete getBranch.products[key].companyProduct.price;
                delete getBranch.products[key].companyProduct.company;
                delete getBranch.products[key].companyProduct._id;
                delete getBranch.products[key].companyProduct.__v;
            }
        if(!getBranch) return res.send({message: 'Branch not found'});
        return res.send({message:'Branch Found:',getBranch});
    }catch(err){
        console.log(err);
        return err; 
    }
}

exports.getCompany = async (req, res) =>
{
    try{
        const companyId = req.params.id;
        const getCompany = await Company.findOne({_id:companyId}).populate('typeCompany').lean();
        if(!getCompany) return res.send({message: 'Company not found'});
        return res.send({message:'Company Found:',getCompany});
    }catch(err){
        console.log(err);
        return err; 
    }
}

exports.getCompanyAdmin = async (req, res) =>
{
    try{
        const idCompany = req.params.id;
        const getCompany = await Company.findOne({_id:idCompany}).populate('typeCompany').lean();
        if(!getCompany) return res.send({message: 'Company not found'});
        return res.send({message:'Companies Found:',getCompany});
    }catch(err){
        console.log(err);
        return err; 
    }
}

//Get BranchesIsAdmin//
exports.getBranchesIsAdmin = async (req, res) =>{
    try{
        const getBranchesIsAdmin = await Branch.find().populate('company township');
        if(!getBranchesIsAdmin) return res.send({message: 'Branches not found'});
        return res.send({message:'Branches Found', getBranchesIsAdmin}); 
    }catch(err){
        console.log(err);
        return err; 
    }
}

//Función para agregar una IMG a una COMPANY
exports.addImgCompany=async(req,res)=>
{
    try{
        const companyID = req.params.id;

        const permission = await checkPermission(companyID, req.user.sub);
        if(permission === false) return res.status(401).send({message: 'You dont have permission to update this user'});
        if(!req.files.image || !req.files.image.type) return res.status(400).send({message: 'Havent sent image'});
        
        const filePath = req.files.image.path; 
       
        const fileSplit = filePath.split('\\'); 
        const fileName = fileSplit[2]; 

        const extension = fileName.split('\.'); 
        const fileExt = extension[1]; 

        const validExt = await validExtension(fileExt, filePath);
        if(validExt === false) return res.status(400).send('Invalid extension');
        const updateUser = await Company.findOneAndUpdate({_id: companyID}, {image: fileName});
        if(!updateUser) return res.status(404).send({message: 'User not found'});
        return res.send(updateUser);
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error add img into Company'});
    }
}

exports.getImage = async(req, res)=>
{
    try
    {
        const fileName = req.params.fileName;
        const pathFile = './uploads/companies/' + fileName;

        const image = fs.existsSync(pathFile);
        if(!image) return res.status(404).send({message: 'Image not found'});
        return res.sendFile(path.resolve(pathFile));
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({err, message: 'Error getting image'});
    }
}


