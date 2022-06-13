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
            company: req.user.sub,
        };
        const msg = validateData(data);
        if(!msg){
             //- Verficar que no exista el prodcuto.//
            let productExist = await CompanyProduct.findOne({ $and: [{name:params.name}, {company: req.user.sub}]});
            if(!productExist){
            
                let saveProduct = new CompanyProduct(data);
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
         const productExist = await CompanyProduct.findOne({ $and: [{_id: productId}, {company: req.user.sub}]});
         if(!productExist) return res.status(400).send({message: 'Product not found.'});

         //- Verificar que no se duplique con otro Producto.//
         const productDuplicate = await CompanyProduct.findOne({ $and: [{name: params.name}, {company: req.user.sub}]});
            if(productDuplicate && productExist.name != params.name) return res.send({message: 'Name already in use'});

        //- Actualizar el Producto.//
        const data =
        {
            name: params.name,
            description: params.description,
            price: params.price,
            providerName: params.providerName,
            stock: params.stock,
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
            const product = await CompanyProduct.find({name: {$regex: params.name, $options: 'i'}}).populate('company');
            for(let productData of product)
            {
                productData.company.username = undefined;
                productData.company.password = undefined
                productData.company.email = undefined
                productData.company.phone = undefined
                productData.company.role = undefined
                productData.company.typeCompany = undefined
                productData.company.__v = undefined
            }
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
            const product = await CompanyProduct.find({providerName: {$regex: params.providerName, $options: 'i'}}).populate('company');
            
            for(let productData of product)
            {
                productData.company.username = undefined;
                productData.company.password = undefined
                productData.company.email = undefined
                productData.company.phone = undefined
                productData.company.role = undefined
                productData.company.typeCompany = undefined
                productData.company.__v = undefined
            }
      
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
        const products = await CompanyProduct.find({company:req.user.sub}).populate('company');
        products.sort((a,b) =>{ return b.stock-a.stock;});
        for(let productData of products)
            {
                productData.company.username = undefined;
                productData.company.password = undefined
                productData.company.email = undefined
                productData.company.phone = undefined
                productData.company.role = undefined
                productData.company.typeCompany = undefined
                productData.company.__v = undefined
            }
        return res.send({products});
    }catch(err){
        console.log(err);
        return err;
    }
}


//Buscar producto Stock de menor a mayor//
exports.GetProductStock = async (req, res) =>{
    try{
        const products = await CompanyProduct.find({company:req.user.sub}).populate('company');
        products.sort((a,b) =>{ return a.stock-b.stock; });
        for(let productData of products)
        {
            productData.company.username = undefined;
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
        }
        return res.send({products});
    }catch(err){
        console.log(err);
        return err;
    }
}


//Muestar un producto en específico//
exports.getProduct = async(req, res)=>{
    try
    {
        const productID = req.params.id;
        const products = await CompanyProduct.findOne({_id: productID}).populate('company');
        products.company.username = undefined
        products.company.password = undefined
        products.company.email = undefined
        products.company.phone = undefined
        products.company.role = undefined
        products.company.typeCompany = undefined
        products.company.__v = undefined

        return res.send({message: 'Product Found:', products})
    }catch(err){
        console.log(err);
        return err;
    }
}



//Muestra todos los productos agregados//
exports.getProducts = async(req, res)=>{
    try{
        const products = await CompanyProduct.find({company:req.user.sub}).populate('company');
        for(let productData of products)
        {
            productData.company.username = undefined
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
        }
        return res.send({message: 'Products:', products})
    }catch(err){
        console.log(err);
        return err;
    }
}


//ADMINISTRADOR//
exports.addProductisAdmin = async (req, res)=>{
    try{
        const params = req.body;

        const data = {
            name: params.name,
            description: params.description,
            price: params.price,
            providerName: params.providerName,
            stock: params.stock,
            company: params.company,
        };

        const msg = validateData(data);
        if(!msg){
             //- Verficar que no exista el prodcuto.//
            let productExist = await CompanyProduct.findOne({ $and: [{name:params.name}, {company: params.company}]});
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

exports.updateProductIsAdmin = async(req, res)=> {
    try{
        const params = req.body;

        //-Capturar el ID del Producto a Actualizar.//
        const productId = req.params.id;

        //Data Necesaria para la Actualización.//
        const check = await checkUpdated(params);
        if(check === false) return res.status(400).send({message: 'Data not recived'});


        const msg = validateData(params);
        if(msg) return res.status(400).send(msg);

        //- Verificar Company.//
        const company = await CompanyProduct.findOne({_id:productId});

         //- Verificar que Exista el Producto.//
         const productExist = await CompanyProduct.findOne({ $and: [{_id: productId}, {company: company.company}]});
         if(!productExist) return res.status(400).send({message: 'Product not found.'});

         //- Verificar que no se duplique con otro Producto.//
         const productDuplicate = await CompanyProduct.findOne({ $and: [{name: params.name}, {company: company.company}]});
            if(productDuplicate && productExist.name != params.name) return res.status(400).send({message: 'Name already in use'});

        //- Actualizar el Producto.//
        const data =
        {
            name: params.name,
            description: params.description,
            price: params.price,
            providerName: params.providerName,
            stock: params.stock,
        };

        const productUpdated = await CompanyProduct.findOneAndUpdate({_id: productId}, data, {new: true});
        if(!productUpdated) return res.status(400).send({message: 'Product not found'});
        return res.send ({message: 'Product update', productUpdated});
        
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.deleteProductIsAdmin = async(req, res)=>{
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

exports.getProductsIsAdmin = async(req, res)=>{
    try{
        const products = await CompanyProduct.find().populate('company');
        for(let productData of products)
        {
            productData.company.username = undefined
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
        }
        return res.send({message: 'Products:', products})
    }catch(err){
        console.log(err);
        return err;
    }
}

// Ordenar productos de forma alfabetica de la A - Z
exports.getProductsOrderByUp = async(req, res)=>{
    try{
        const companyId= req.user.sub;
        const products = await CompanyProduct.find({company: companyId}).sort({name: 'asc'}).populate('company');
        
        
        for(let productData of products)
        {
            productData.company.username = undefined
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
            
        }
        return res.send({products});
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.getProductsOdernByDown = async(req, res)=>{
    try{
        const companyId= req.user.sub;
        const products = await CompanyProduct.find({company: companyId}).sort({name: 'desc'}).populate('company');
        
        for(let productData of products)
        {
            productData.company.username = undefined
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
            
        }
        return res.send({products});
        
    }catch(err){
        console.log(err);
        return err;
    }
}


// Odrnar  por Proveider

exports.getProductsOdernByProviderUp = async(req, res)=>{
    try{
        const companyId= req.user.sub;
        const products = await CompanyProduct.find({company: companyId}).sort({providerName: 'asc'}).populate('company');
        
        
        for(let productData of products)
        {
            productData.company.username = undefined
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
            
        }
        return res.send({products});
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.getProductsOdernByProviderDown = async(req, res)=>{
    try{
        const companyId= req.user.sub;
        const products = await CompanyProduct.find({company: companyId}).sort({providerName: 'desc'}).populate('company');
        
        
        for(let productData of products)
        {
            productData.company.username = undefined
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
            
        }
        return res.send({products});
    }catch(err){
        console.log(err);
        return err;
    }
}


//Buscar producto Stock de mayor a menor//
exports.GetProductStockElderIsAdmin = async (req, res) =>{
    try{
        const products = await CompanyProduct.find().populate('company');
        products.sort((a,b) =>{ return b.stock-a.stock;});
        for(let productData of products)
            {
                productData.company.username = undefined;
                productData.company.password = undefined
                productData.company.email = undefined
                productData.company.phone = undefined
                productData.company.role = undefined
                productData.company.typeCompany = undefined
                productData.company.__v = undefined
            }
        return res.send({products});
    }catch(err){
        console.log(err);
        return err;
    }
}


//Buscar producto Stock de menor a mayor//
exports.GetProductStockIsAdmin = async (req, res) =>{
    try{
        const products = await CompanyProduct.find().populate('company');
        products.sort((a,b) =>{ return a.stock-b.stock; });
        for(let productData of products)
        {
            productData.company.username = undefined;
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
        }
        return res.send({products});
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.getProductsOrderByUpIsAdmin = async(req, res)=>{
    try{
        const products = await CompanyProduct.find().sort({name: 'asc'}).populate('company');
        
        
        for(let productData of products)
        {
            productData.company.username = undefined
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
            
        }
        return res.send({products});
    }catch(err){
        console.log(err);
        return err;
    }
}

exports.getProductsOderByDownIsAdmin = async(req, res)=>{
    try{
        const products = await CompanyProduct.find().sort({name: 'desc'}).populate('company');
        
        for(let productData of products)
        {
            productData.company.username = undefined
            productData.company.password = undefined
            productData.company.email = undefined
            productData.company.phone = undefined
            productData.company.role = undefined
            productData.company.typeCompany = undefined
            productData.company.__v = undefined
            
        }
        return res.send({products});
        
    }catch(err){
        console.log(err);
        return err;
    }
}