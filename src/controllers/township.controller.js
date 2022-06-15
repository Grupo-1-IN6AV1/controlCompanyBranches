'use strict'

const Township = require('../models/township.model');
const { validateData, checkUpdated} = require('../utils/validate');


//Función de Testeo//
exports.testTownship = (req, res)=>{
    return res.send({message: 'Function testTownShip is running'}); 
}




//Agregar Municipio//
exports.saveTownship = async (req, res)=>{
    try{
        const params = req.body; 
        const data = {
            name: params.name,
        };

        const msg = validateData(data);
        if(msg)
            return res.status(400).send(msg);
        
        const existTownship = await Township.findOne({name: params.name});
        if(!existTownship){
            const township = new Township(data);
            await township.save();
            return res.send({message: 'Township saved', township});
        }else return res.status(400).send({message: 'Township already exist'});
    
    }catch(err){
        console.log(err); 
        return err; 
    }

}



//Mostrar todos los Municipios//
exports.getTownships = async (req, res)=>{
    try{
        const townships = await Township.find();
        return res.send({message: 'Townships:', townships})
    }catch(err){
        console.log(err); 
        return err; 
    }
}


//Mostrar un  Municipio//
exports.getTownship = async (req, res)=>{
    try
    {
        const townshipId = req.params.id
        const township = await Township.findOne({_id:townshipId});
        return res.send({message: 'Township:', township})
    }catch(err){
        console.log(err); 
        return err; 
    }
}


//Actualizar Municipio //
exports.updateTownship = async (req, res)=>{
    try{
        const params = req.body;
        const townshipID = req.params.id;

        const check = await checkUpdated(params);
        if(check === false) return res.status(400).send({message: 'Data not recived'});

        const msg = validateData(params);
        if(!msg)
        {
            const townshipExist = await Township.findOne({_id: townshipID});
            if(!townshipExist) return res.status.send({message: 'Township not found'});

            let alreadyName = await Township.findOne({name: params.name});
                if(alreadyName && townshipExist.name != params.name) return res.status(400).send({message: 'TownShip Already Exist'});
    
            const updateTownship = await Township.findOneAndUpdate({_id: townshipID}, params, {new: true});
            return res.send({message: 'Update Township', updateTownship});

        }else return res.status(400).send({message: 'Some parameter is empty'})

        }catch(err){
        console.log(err);
        return err; 
    }
}




//Eliminar Municipio //
exports.deleteTownship = async (req, res)=>{
    try{
        const townshipID = req.params.id;
        const townshipExist = await Township.findOne({_id: townshipID});
        if(!townshipExist) return res.status(400).send({message: 'Township not found or already deleted.'});     

        const townshipDeleted = await Township.findOneAndDelete({_id: townshipID});
        return res.send({message: 'Delete Township.', townshipDeleted});
          
    }catch(err){
        console.log(err); 
        return err; 
    }
}
