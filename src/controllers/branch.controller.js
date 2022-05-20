'use strict'

const Branch = require('../models/branch.model');
const Township = require('../models/township.model');
const CompanyProduct = require('../models/companyProduct.model');

const {validateData, alreadyCompany,checkPassword, checkUpdate, checkPermission, checkUpdateAdmin} = require('../utils/validate');
const jwt = require('../services/jwt');


//FUNCIONES PÚBLICAS
//Función de Testeo//
exports.branchTest = async (req, res)=>{
    await res.send({message: 'User Test is running.'})
}



//Agregar una sucursal//
exports.saveBranch = async(req, res)=>{
    try{
        const params = req.body;
        const data = {
            name: params.name,
            phone: params.phone,
            address: params.address,
            company: params.company,
            township: params.township,
            
        };
        
        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);


        const companyExist = await alreadyCompany(data.company);
        if(companyExist) return res.status(400).send({message: 'Branch already created'});
  
        const townshipExist = await Township.findOne({_id: params.township});
        if(!townshipExist) return res.status(400).send({message: 'Township not found'});

        const branch = new Branch(data);
        await branch.save();
        return res.send({message: 'Branch created successfully', branch});

    }catch(err){
        console.log(err);
        return err;
    }
}


//ACTUALIZAR UNA SUCURSAL//
exports.updateBranch = async (req, res) =>{
    try{
        const branchID = req.params.id;
        const params = req.body; 
        
        const data = {
            name: params.name,
            phone: params.phone,
            address: params.address,
            company: params.company,
            township: params.township,
        };

        const branchExist = await Branch.findOne({_id: branchID});
            if(!branchExist) return res.send({message: 'Branch not found'});

        const validateUpdate = await checkUpdate(params);
            if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});

        const nameBranch = await Branch.findOne($and [{name: data.name},{ company: data.company}]);
            if(nameBranch) return res.send({message: 'Name branch already in use'});

        const companyExist = await Company.findOne({_id: data.company});
            if(!companyExist) return res.send({message: 'Company not found'});

        const townshipExist = await Township.findOne({_id: data.township});
            if(!townshipExist) return res.send({message: 'Township not found'});

        const branchUpdate = await Branch.findOneAndUpdate({_id: branchID}, data, {new: true}).lean();
        if(!branchUpdate) return res.send({message: 'Branch not updated'});
        return res.send({message: 'Branch updated', branchUpdate});

    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Failed to update company'});
    }
}




//ELIMAR UNA SUCURSAL//
exports.deleteBranch = async(req, res)=>{
    try{
        const branchID = req.params.id;

        const branchDeleted = await Company.findOneAndDelete({_id: branchID});
        if(!branchDeleted) return res.send({message: 'Branch not found or already deleted'});
        return res.send({message: 'Branch deleted', branchDeleted});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting branch'});
    }
}





//Agregar Productos//
exports.addProductBranch = async (req, res) => {
    try {
        const params = req.body;
        const companyID = req.user.sub;
        const branchID = req.params.id;
        const productID = params.product;
        const cantidad = params.cantidad;


        //Verificar que Exista la sucursal//
        const branchtExist = await Branch.findOne({ $and: [{ _id: branchID }, { company: companyID }] });
        if (!branchtExist)
            return res.status(401).send({ message: 'Branch not Found.' })


        //Busca el producto por ID y empresa//
        const productExist = await CompanyProduct.findOne({ $and: [{ _id: productID }, { company: companyID }] });
        if (!productExist)
            return res.send({ message: 'Product not Found.' });

        //verificar existencias//     
        if (cantidad > productExist.stock) return res.send({ message: 'Not enough products in stock' });

        //update stock de empresa//
        const resta = (productExist.stock - cantidad);
        const updateStock = await CompanyProduct.findOneAndUpdate({ _id: productExist }, { stock: resta }, { new: true });


        //Seteo de data//
        const data = {
            nameProduct: productExist.name,
            price: productExist.price,
            stock: cantidad,
            companyProduct: productExist._id
        }

        const products = await branchtExist.products

        //Agregar primer Producto a la Sucursal//
        if (products.length == 0) {
            const newProductOne = await Branch.findOneAndUpdate({ _id: branchID }, { $push: { products: data } }, { new: true }).populate('products');
            return res.send({ message: 'Added New product to Branch', newProductOne });
        }

        //Verificar que no se repitan los productos//
        for (var key = 0; key < branchtExist.products.length; key++) 
        {
            const checkProduct = branchtExist.products[key].companyProduct;
            if (checkProduct != params.product) continue;
            const addProduct = await Branch.findOneAndUpdate(
                { $and: [{ _id: branchID }, { "products.companyProduct": params.product }] },
                {
                    $inc:
                    {
                        "products.$.stock": params.cantidad,
                    }
                },
                { new: true }).lean();
            return res.send({ message: 'Update Stock', addProduct });
        }

        const newProduct = await Branch.findOneAndUpdate({ _id: branchID }, { $push: { products: data } }, { new: true }).populate('products');
        return res.send({ message: 'Added New product to Branch', newProduct });

    } catch (err) {
        console.log(err);
        return err;
    }
}

//Update Product Branch
exports.updateBranchProduct = async (req,res)=>
{
    const params = req.body;
    const branchID = req.params.id;
    const productID = params.product;
    const quantity = params.quantity;

    try
    {
        const branchExist = await Branch.findOne({_id:branchID});
         
        if(!branchExist)
        return res.status(500).send({message: 'Branch not found.'});

        const product = await CompanyProduct.findOne({_id:productID});

        const checkData=
        {
            companyProduct: productID,
            quantity: params.quantity
        }

        const msg = validateData(checkData);
        if(msg)
            return res.status(400).send(msg);

        //VERIFICAMOS EL STOCK ACTUAL//
        const productQuantity = branchExist.products.find(products => products.companyProduct==productID);

        //REGRESAR al Stock//
        if(params.quantity < productQuantity.stock)
        {

            const data = 
            {
                product: productID,
                companyProduct: quantity,
            }


            //Actualizar la Sucursal//
            const updateBranch = await Branch.updateOne(
                {_id:branchID,
                "products.companyProduct": productID,
                products:{$elemMatch: { stock:{ $gt: quantity}}}},
                {$set:
                    {
                        "products.$.stock": quantity,
                    }});

            //Actualizar el Producto//
            //Actualizar el Stock Y Ventas//
            const newStock =  parseFloat(product.stock) + (parseFloat(productQuantity.stock) - parseFloat(params.quantity));
            
            const updateProduct = await CompanyProduct.findOneAndUpdate(
                {_id:product._id},
                {stock: newStock},
                {new:true}).lean();

                const viewUpdateBranch = await Branch.findOne({_id:branchID})
                    
            return res.send({message:'Branch Updated.',viewUpdateBranch})
        }      
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}



//Eliminar Producto de la Sucursal//
exports.deleteProductBranch = async (req, res) => {
    try{
        const params = req.body;
        const branchID = req.params.id;
        const productID = params.product;
        
        const branchExist= await Branch.findOne({_id: branchID })
            if(!branchExist) return res.send({message: 'Branch not found'});
    
        //Eliminando de Producto de una Brach//
        const deleteProduct = await Branch.findOneAndUpdate({_id: branchID}, {$pull: { 'products': {'_id': productID}}}, {new: true});
        return res.send({ message: 'Deleted Product Successfully ', deleteProduct });
    
    }catch(err){
        console.log(err);
        return err; 
    }
}

