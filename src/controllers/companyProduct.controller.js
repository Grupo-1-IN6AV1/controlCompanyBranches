'use strict';

//Importación del Modelo -Producto-
const CompanyProduct = require('../models/companyProduct.model');
const {validateData, checkUpdated} = require('../utils/validate');


//Funciones Publicas//

/*Función de Testeo*/
exports.testProduct = (req, res) =>{
    return res.send({message: 'The function test is running.'});
}


//Funciones Privadas//
//Registrar || Agregar Productos//
exports.addProduct = async (req, res)=>{
    try{
        const params = req.body;
        const data = {
            name: params.name,
            description: params.description,
            price: params.price,
            providerName: params.providerName,
            stock: params.stock,
            sales: 0,
            company: req.user.sub,
        };

        const msg = validateData(data);
        if(!msg){
             //- Verficar que no exista el prodcuto.//
            let productExist = await CompanyProduct.findOne({ $and: [{name:params.name}, {providerName: params.providerName}]});
            if(!productExist){
                const saveProduct = new CompanyProduct(data);
                await saveProduct.save();
                return res.send({saveProduct, message: 'Product saved'});
            }else return res.status(400).send({message: 'The product you entered already exists.'});
        }else return res.status(400).send(msg);
    }
    catch(err){
        console.log(err);
        return err;
    }
}


//ACTUALIZAR || Editar Producto//
exports.updateProduct = async(req, res)=> {
    try{
        const params = req.body;

        //-Capturar el ID del Producto a Actualizar.//
        const productId = req.params.id;

        //Data Necesaria para la Actualización.//
        const check = await checkUpdated(params);
        if(check === false) return res.status(400).send({message: 'Data not recived'});


        const msg = validateData(params);
        if(msg) return res.status(400).send(msg);

         //- Verificar que Exista el Producto.//
         const productExist = await CompanyProduct.findOne({_id:productId});
         if(!productExist) return res.status(400).send({message: 'Product not found.'});

 
         //- Verificar que no se duplique con otro Producto.//
         const productDuplicate = await CompanyProduct.findOne({ $and: [{name: params.name}, {providerName: params.providerName}]});
         if(productDuplicate) return res.status(400).send({message: 'Product is already exist.'});

       
        //- Actualizar el Producto.//
        const data =
        {
            name: params.name,
            description: params.description,
            price: params.price,
            providerName: params.providerName,
            stock: params.stock,
            sales: params.sales
        };

        const productUpdated = await CompanyProduct.findOneAndUpdate({_id: productId}, data, {new: true});
        if(!productUpdated) return res.status(400).send({message: 'Product not found'});
        return res.send ({message: 'Product update', productUpdated});
        
    }catch(err){
        console.log(err);
        return err;
    }
}



//DELETE || Eliminar Producto
exports.deleteProduct = async(req, res)=>{
    try{
        //Capturar el ID del Producto.//
        const productId = req.params.id;
        const productDeleted = await CompanyProduct.findOneAndDelete({_id: productId});
        if(!productDeleted){
            return res.status(500).send({message: 'Product not found or already delete.'});
        }else return res.send({ message: 'Product Deleted.', productDeleted});
    }catch(err){
        console.log(err);
        return err;
    }
}



//Buscar Productos por nombre//
exports.searchProductName = async (req, res) =>{
    try{
        const params = req.body;
        const data = { name: params.name};

        const msg = validateData(data);
        if(!msg){
            const product = await CompanyProduct.find({name: {$regex: params.name, $options: 'i'}});
            return res.send({product});
        }else return res.status(400).send(msg);
    }catch(err){
        console.log(err);
        return err; 
    }
}




//Buscar Productos por proveedor//
exports.searchProductProvider = async (req, res) =>{
    try{
        const params = req.body;
        const data = { providerName: params.providerName};

        const msg = validateData(data);
        if(!msg){
            const product = await CompanyProduct.find({providerName: {$regex: params.providerName, $options: 'i'}});
            return res.send({product});
        }else return res.status(400).send(msg);
    }catch(err){
        console.log(err);
        return err; 
    }
}





//Buscar producto Stock de mayor a menor//
exports.GetProductStockElder = async (req, res) =>{
    try{
        const products = await CompanyProduct.find();
        products.sort((a,b) =>{ return b.stock-a.stock; });
        return res.send(products);
    }catch(err){
        console.log(err);
        return err;
    }
}



//Buscar producto Stock de menor a mayor//
exports.GetProductStock = async (req, res) =>{
    try{
        const products = await CompanyProduct.find();
        products.sort((a,b) =>{ return a.stock-b.stock; });
        return res.send(products);
    }catch(err){
        console.log(err);
        return err;
    }
}


//Muestar un producto en específico//
exports.getProduct = async(req, res)=>{
    try{
        const productID = req.params.id;
        const products = await CompanyProduct.findOne({_id: productID});
        return res.send({message: 'Products:', products})
    }catch(err){
        console.log(err);
        return err;
    }
}



//Muestra todos los productos agregados//
exports.getProducts = async(req, res)=>{
    try{
        const products = await CompanyProduct.find();
        return res.send({message: 'Products:', products})
    }catch(err){
        console.log(err);
        return err;
    }
}
