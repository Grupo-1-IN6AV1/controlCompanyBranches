'use strict'

const TypeCompany = require('../models/typeCompany.model');
const Company = require('../models/company.model');
const { validateData, checkUpdated} = require('../utils/validate');

//Función de Testeo//
exports.testTypeCompany = (req, res)=>{
    return res.send({message: 'Function testTypeCompany is running'}); 
}




//Agregar Tipo de Empresa//
exports.saveTypeCompany = async (req, res)=>{
    try{
        const params = req.body; 
        const data = {
            name: params.name,
            description: params.description,
        };

        const msg = validateData(data);
        if(!msg){
            const existTypeCompany= await TypeCompany.findOne({name: params.name});
            if(!existTypeCompany){
                const typeCompany = new TypeCompany(data);
                await typeCompany.save();
                return res.send({message: 'TypeCompany saved', typeCompany});
            }else return res.status(400).send({message: 'TypeCompany already exist'});
        }else{
            return res.status(400).send(msg);
        }
    }catch(err){
        console.log(err); 
        return err; 
    }

}




//Actualizar tipo de Empresa //
exports.updateTypeCompany = async (req, res)=>{
    try{
        const params = req.body;
        const typeCompanyID = req.params.id; 

        const check = await checkUpdated(params);
        if(check === false) return res.status(400).send({message: 'Data not recived'});


        const msg = validateData(params);
        if(!msg){
            const alreadyTypeCompany = await TypeCompany.findOne({name: params.name});
            if(!alreadyTypeCompany){
                const updateTypeCompany = await TypeCompany.findOneAndUpdate({_id: typeCompanyID}, params, {new: true});
                return res.send({message: 'Update Type Company', updateTypeCompany});
            }else return res.status(400).send({message: 'TypeCompany name already exists'});
        }else return res.status(400).send({message: 'Some parameter is empty'})


        }catch(err){
        console.log(err);
        return err; 
    }
}




//Eliminar Tipo de Empresa //
exports.deleteTypeCompany = async (req, res)=>{
    try{

        const typeCompanyID = req.params.id;
        const typeCompanyExist = await TypeCompany.findOne({_id: typeCompanyID});
        if(!typeCompanyExist) return res.status(500).send({message: 'Type Company not found or already deleted.'});     

        if(typeCompanyExist.name === 'DEFAULT')
            return res.status(400).send({message: 'Default category cannot be deleted.'});


        const newTypeCompany = await TypeCompany.findOne({name:'DEFAULT'}).lean();
        const companyExist = await Company.find({typeCompany: typeCompanyID}); 


        for(let typeCompanyUP of companyExist){
            const updateNewTypeCompany = await Company.findOneAndUpdate({_id:typeCompanyUP._id},{typeCompany :newTypeCompany._id});
        } 

        const typeCompanyDeleted = await TypeCompany.findOneAndDelete({_id: typeCompanyID});
        return res.send({message: 'Delete Type Company.', typeCompanyDeleted});
 
    }catch(err){
        console.log(err); 
        return err; 
    }
}




//Mostrar todos los tipos de empresa//
exports.getTypeCompany = async (req, res)=>{
    try{
        const typeCompanyExist = await TypeCompany.find();
        return res.send({message: 'Type Company:', typeCompanyExist})
    }catch(err){
        console.log(err); 
        return err; 
    }
}



