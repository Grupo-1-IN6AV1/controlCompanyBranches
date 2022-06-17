'use strict'

const Branch = require('../models/branch.model');
const Township = require('../models/township.model');
const CompanyProduct = require('../models/companyProduct.model');
const Company = require ('../models/company.model');
const ShoppingCart = require('../models/shoppingCart.model')

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
            company: req.user.sub,
            township: params.township,
            
        };
        
        const msg = validateData(data);
        if(msg) return res.status(400).send(msg);


        const companyExist = await Branch.findOne({$and: [{name: data.name},{ company: data.company}]});
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
            township: params.township,
        };

        const branchExist = await Branch.findOne({$and: [{_id: branchID},{ company: req.user.sub}]});
            if(!branchExist) return res.send({message: 'Branch not found'});

        const validateUpdate = await checkUpdate(params);
            if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});

        const nameBranch = await Branch.findOne({$and: [{name: data.name},{ company: req.user.sub}]});
            if(nameBranch && branchExist.name != data.name) return res.status(400).send({message: 'Name branch already in use'});
    
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

        const branchDeleted = await Branch.findOneAndDelete({_id: branchID});
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
        const paramsObligatory =
        {
            quantity: cantidad,
            branch: branchID
        }

        const msg = validateData(paramsObligatory);
        if(msg) return res.status(400).send(msg);

        if(paramsObligatory.quantity < 0)
            return res.status(400).send({message:'The quantity product cannot be less than 0'})

        //Verificar que Exista la sucursal//
        const branchtExist = await Branch.findOne({ $and: [{ _id: branchID }, { company: companyID }] });
        if (!branchtExist)
            return res.status(400).send({ message: 'Branch not Found.' })


        //Busca el producto por ID y empresa//
        const productExist = await CompanyProduct.findOne({ $and: [{ _id: productID }, { company: companyID }] });
        if (!productExist)
            return res.status(400).send({ message: 'Product not Found.' });

        //verificar existencias//     
        if (cantidad > productExist.stock) return res.status(400).send({ message: 'Not enough products in stock' });

        //update stock de empresa//
        const resta = (productExist.stock - cantidad);
        const updateStock = await CompanyProduct.findOneAndUpdate({ _id: productExist }, { stock: resta }, { new: true });


        //Seteo de data//
        const data = {
            nameProduct: productExist.name,
            price: productExist.price,
            stock: cantidad,
            companyProduct: productExist._id,
            sales: 0
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
            return res.send({ message: 'Update Branch Stock', addProduct });
        }

        data.sales == undefined;
        const newProduct = await Branch.findOneAndUpdate({ _id: branchID }, { $push: { products: data } }, { new: true }).populate('products');
        return res.send({ message: 'Added New product to Branch', newProduct });

    } catch (err) {
        console.log(err);
        return err;
    }
}


exports.addProductBranchAdmin = async (req, res) => {
    try {
        const params = req.body;
        const branchID = req.params.id;
        const productID = params.product;
        const cantidad = params.cantidad;

        const paramsObligatory =
        {
            quantity: cantidad,
            branch: branchID,
        }

        const msg = validateData(paramsObligatory);
        if(msg) return res.status(400).send(msg);

        if(paramsObligatory.quantity < 0)
            return res.status(400).send({message:'The quantity product cannot be less than 0'})

        //Verificar que Exista la sucursal//
        const branchtExist = await Branch.findOne({_id: branchID});
        if (!branchtExist)
            return res.status(400).send({ message: 'Branch not Found.' })


        //Busca el producto por ID y empresa//
        const productExist = await CompanyProduct.findOne({_id: productID});
        if (!productExist)
            return res.status(400).send({ message: 'Product not Found.' });

        //verificar existencias//     
        if (cantidad > productExist.stock) return res.status(400).send({ message: 'Not enough products in stock' });

        //update stock de empresa//
        const resta = (productExist.stock - cantidad);
        const updateStock = await CompanyProduct.findOneAndUpdate({ _id: productExist }, { stock: resta }, { new: true });


        //Seteo de data//
        const data = {
            nameProduct: productExist.name,
            price: productExist.price,
            stock: cantidad,
            companyProduct: productExist._id,
            sales: 0
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
            return res.send({ message: 'Update Branch Stock', addProduct });
        }

        data.sales == undefined;
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

        if(checkData.quantity < 0)
            return res.status(400).send({message:'The stock cannot be less than 0'})

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


            //Actualizar el Stock Y Ventas//
            const newStock =  parseFloat(product.stock) + (parseFloat(productQuantity.stock) - parseFloat(params.quantity));
            
            const updateProduct = await CompanyProduct.findOneAndUpdate(
                {_id:product._id},
                {stock: newStock},
                {new:true}).lean();

            const viewUpdateBranch = await Branch.findOne({_id:branchID})
                    
            return res.send({message:'Branch Updated.',viewUpdateBranch})
        }
        else if(params.quantity > productQuantity.stock)
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
                products:{$elemMatch: { stock:{ $lt: quantity}}}},
                {$set:
                    {
                        "products.$.stock": quantity,
                    }});


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
    
        const product = await CompanyProduct.findOne({_id:productID});

        //Verificar Stock Actual del Producto//
        const productQuantity = branchExist.products.find(products => products.companyProduct==productID);

        //Eliminando de Producto de una Brach//
        const deleteProduct = await Branch.findOneAndUpdate({_id: branchID}, {$pull: { 'products': {'companyProduct': productID}}}, {new: true});
                    
        const newStock =  parseFloat(product.stock) + (parseFloat(productQuantity.stock));
        const updateProduct = await CompanyProduct.findOneAndUpdate(
            {_id:product._id},
            {stock: newStock},
            {new:true}).lean();


        return res.send({ message: 'Deleted Product Successfully ', deleteProduct });

    }
    catch(err)
    {
        console.log(err);
        return err; 
    }
}


//Update Product Branch
exports.salesProductIsAdmin = async (req,res)=>
{
    try
    {
        const params = req.body;
        const branchID = req.params.id;
        const productID = params.product;
        const companyID = params.company;
        const quantity = params.quantity;
        const dpi = params.dpi;

        const paramsObligatory = 
        {
            product: productID,
            quantity: quantity,
            dpi: dpi,
            client: params.client,
            company : companyID
        }

        if(paramsObligatory.quantity < 0)
            return res.status(400).send({message:'The quantity product cannot be less than 0'})

        const msg = validateData(paramsObligatory);
        if(msg) return res.status(400).send(msg);

        const branchExist = await Branch.findOne({_id:branchID});
        const productExist = await CompanyProduct.findOne({_id:productID})
         
        if(!branchExist)
        return res.status(500).send({message: 'Branch not found.'});

        //Verificar que no se repitan los productos//
        for (var key = 0; key < branchExist.products.length; key++) 
        {
            const checkProduct = branchExist.products[key].companyProduct;
            const checkStock = branchExist.products[key].stock;
            if (checkProduct != params.product) continue;
            if(checkStock < quantity)
                return res.status(400).send({ message: 'Not enough products in stock' });
            
            const updateBranch = await Branch.findOneAndUpdate(
                {
                     _id:branchID,
                    "products.companyProduct": productID},
                { $inc:
                        {
                            "products.$.sales": quantity,
                            "products.$.stock": -quantity,
                        }
                },
                {new:true});

            const shoppingCartExist = await ShoppingCart.findOne({dpi:dpi});
            
            if(shoppingCartExist)
            {
                
                for(var key=0; key<shoppingCartExist.products.length; key++)
                {
                    const idUpdateProduct = shoppingCartExist.products[key].product;
                    if(idUpdateProduct != productID)continue;
                    return res.status(400).send({message:'You already have this product in the cart.'});
                }
                const setProduct = 
                {
                    product: productID,
                    quantity: quantity,
                    price: productExist.price,
                    subTotalProduct: parseFloat(quantity) * parseFloat(productExist.price)
                }
                const subTotal = shoppingCartExist.products.map(item => 
                    item.subTotalProduct).reduce((prev, curr) => prev + curr, 0)+setProduct.subTotalProduct;
                const IVA = parseFloat(subTotal)*0.12;
                const total = parseFloat(subTotal)+parseFloat(IVA);

                const newShoppingCart = await ShoppingCart.findOneAndUpdate({ _id:shoppingCartExist._id}, 
                    { $push:{ products: setProduct},
                    subTotal: subTotal,
                    IVA:IVA,
                    total:total}, 
                    { new:true});

                const shoppingCart = await ShoppingCart.findOne({dpi:dpi});    
                
                return res.send({ message: 'Sales Succesfully', updateBranch, shoppingCart});
            }
            else if(!shoppingCartExist)
            {
                const setProduct = 
                {
                    product: productID,
                    quantity: quantity,
                    price: productExist.price,
                    subTotalProduct: parseFloat(quantity) * parseFloat(productExist.price)
                }

                const data = 
                {
                    company: companyID,
                    client: params.client,
                    dpi: dpi,
                    products: setProduct,
                }
                data.subTotal = setProduct.subTotalProduct
                data.IVA = parseFloat(data.subTotal)*0.12;
                data.total = parseFloat(data.subTotal)+parseFloat(data.IVA);
                if(params.NIT=='' || params.NIT==undefined || params.NIT==null)
                {
                    data.NIT = 'C/F'
                }
                else{data.NIT = params.NIT}

                const addShoppingCart = new ShoppingCart(data);
                await addShoppingCart.save();
                            
                const shoppingCart = await ShoppingCart.findOne({dpi:dpi});
                return res.send({ message: 'Sales Succesfully', updateBranch, shoppingCart});
            }       
        }

        return res.status(400).send({ message: 'This Product not Exist in this Branch'});
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}


exports.salesProduct = async (req,res)=>
{
    try
    {
        const params = req.body;
        const branchID = req.params.id;
        const productID = params.product;
        const quantity = params.quantity;
        const dpi = params.dpi;

        const paramsObligatory = 
        {
            product: productID,
            quantity: quantity,
            dpi: dpi,
            client: params.client,
        }

        if(paramsObligatory.quantity < 0)
            return res.status(400).send({message:'The quantity product cannot be less than 0'})

        const msg = validateData(paramsObligatory);
        if(msg) return res.status(400).send(msg);

        const branchExist = await Branch.findOne({_id:branchID});
        const productExist = await CompanyProduct.findOne({_id:productID})
         
        if(!branchExist)
        return res.status(500).send({message: 'Branch not found.'});

        //Verificar que no se repitan los productos//
        for (var key = 0; key < branchExist.products.length; key++) 
        {
            const checkProduct = branchExist.products[key].companyProduct;
            const checkStock = branchExist.products[key].stock;
            if (checkProduct != params.product) continue;
            if(checkStock < quantity)
                return res.status(400).send({ message: 'Not enough products in stock' });
            
            const updateBranch = await Branch.findOneAndUpdate(
                {
                     _id:branchID,
                    "products.companyProduct": productID},
                { $inc:
                        {
                            "products.$.sales": quantity,
                            "products.$.stock": -quantity,
                        }
                },
                {new:true});

            const shoppingCartExist = await ShoppingCart.findOne({dpi:dpi});
            
            if(shoppingCartExist)
            {
                
                for(var key=0; key<shoppingCartExist.products.length; key++)
                {
                    const idUpdateProduct = shoppingCartExist.products[key].product;
                    if(idUpdateProduct != productID)continue;
                    return res.status(400).send({message:'You already have this product in the cart.'});
                }
                const setProduct = 
                {
                    product: productID,
                    quantity: quantity,
                    price: productExist.price,
                    subTotalProduct: parseFloat(quantity) * parseFloat(productExist.price)
                }
                const subTotal = shoppingCartExist.products.map(item => 
                    item.subTotalProduct).reduce((prev, curr) => prev + curr, 0)+setProduct.subTotalProduct;
                const IVA = parseFloat(subTotal)*0.12;
                const total = parseFloat(subTotal)+parseFloat(IVA);

                const newShoppingCart = await ShoppingCart.findOneAndUpdate({ _id:shoppingCartExist._id}, 
                    { $push:{ products: setProduct},
                    subTotal: subTotal,
                    IVA:IVA,
                    total:total}, 
                    { new:true});

                const shoppingCart = await ShoppingCart.findOne({dpi:dpi});    
                
                return res.send({ message: 'Sales Succesfully', updateBranch, shoppingCart});
            }
            else if(!shoppingCartExist)
            {
                const setProduct = 
                {
                    product: productID,
                    quantity: quantity,
                    price: productExist.price,
                    subTotalProduct: parseFloat(quantity) * parseFloat(productExist.price)
                }

                const data = 
                {
                    company: req.user.sub,
                    client: params.client,
                    dpi: dpi,
                    products: setProduct,
                }
                data.subTotal = setProduct.subTotalProduct
                data.IVA = parseFloat(data.subTotal)*0.12;
                data.total = parseFloat(data.subTotal)+parseFloat(data.IVA);
                if(params.NIT=='' || params.NIT==undefined || params.NIT==null)
                {
                    data.NIT = 'C/F'
                }
                else{data.NIT = params.NIT}

                const addShoppingCart = new ShoppingCart(data);
                await addShoppingCart.save();
                            
                const shoppingCart = await ShoppingCart.findOne({dpi:dpi});
                return res.send({ message: 'Sales Succesfully', updateBranch, shoppingCart});
            }       
        }

        return res.status(400).send({ message: 'This Product not Exist in this Branch'});
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}


exports.mostSalesProducts = async(req,res)=>
{
    try
    {

        const branchID = req.params.id

        const branch = await Branch.findOne({_id: branchID}).populate('products.companyProduct').lean();
        if(!branch) return res.status(400).send({message: 'Branch Not Found'});

        const productsSales = await branch.products

        for(var key = 0; key < branch.products.length; key++)

      {


        delete branch.products[key].companyProduct.stock;
        delete branch.products[key].companyProduct.sales;
        delete branch.products[key].companyProduct.price;
        delete branch.products[key].companyProduct.company;
        delete branch.products[key].companyProduct._id;
        delete branch.products[key].companyProduct.__v;

       }

        productsSales.sort((a,b) =>{ return b.sales-a.sales; });

        return res.send({productsSales});

    }

    catch (err)

    {

        console.log(err);

        return err;

    }

}


exports.getProductsBranch = async(req,res)=>
{
    try
    {
        const branchID = req.params.id
        const companyID = req.user.sub

        const branch = await Branch.findOne({ $and: [{ _id: branchID }, { company: companyID }]}).populate('products.companyProduct').lean();
        if(!branch) return res.status(400).send({message: 'Branch Not Found'});

        const productsBranch = await branch.products
        return res.send({productsBranch});
    }
    catch (err)
    {
        console.log(err);
        return err;
    }
}

exports.getProductsBranchIsAdmin = async(req,res)=>
{
    try
    {
        const branchID = req.params.id
        const companyID = req.user.sub

        const branch = await Branch.findOne({ _id: branchID }).populate('products.companyProduct').lean();
        if(!branch) return res.status(400).send({message: 'Branch Not Found'});

        const productsBranch = await branch.products
        return res.send({productsBranch});
    }
    catch (err)
    {
        console.log(err);
        return err;
    }
}

exports.getProductsBranchStockElder = async(req,res)=>
{
    try
    {
        const branchID = req.params.id

        const branch = await Branch.findOne({ _id: branchID }).populate('products.companyProduct').lean();
        if(!branch) return res.status(400).send({message: 'Branch Not Found'});
        const productsBranch = await branch.products
        productsBranch.sort((a,b) =>{ return b.stock-a.stock;});
        return res.send({productsBranch});
    }
    catch (err)
    {
        console.log(err);
        return err;
    }
}


exports.getProductsBranchStockMinor = async(req,res)=>
{
    try
    {
        const branchID = req.params.id

        const branch = await Branch.findOne({ _id: branchID }).populate('products.companyProduct').lean();
        if(!branch) return res.status(400).send({message: 'Branch Not Found'});
        const productsBranch = await branch.products
        productsBranch.sort((a,b) =>{ return a.stock-b.stock;});
        return res.send({productsBranch});
    }
    catch (err)
    {
        console.log(err);
        return err;
    }
}


exports.getProductsOrderByUp = async(req, res)=>{
    try{

        const branchID = req.params.id;
        const branch = await Branch.findOne({_id: branchID})
        const productsBranch = await branch.products
        const arrayProducts = []
        for(let product of productsBranch)
        {
            let productID = product.companyProduct
            let stock = product.stock
            let sales = product.sales
            let searchNameProduct = await CompanyProduct.findOne({_id:productID})
            arrayProducts.push
            (
                {
                    name: searchNameProduct.name,
                    description: searchNameProduct.description,
                    price: searchNameProduct.price,
                    provider: searchNameProduct.providerName,
                    stock: stock,
                    sales: sales
                }
            );
        }
        arrayProducts.sort((a,b) =>
        {
            if(a.name < b.name)
            {
                return -1;
            }
            else if(b.name > a.name)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        })
        return res.send({arrayProducts})
    }
    catch(err){
        console.log(err);
        return err;
    }
}


exports.getProductsOrderByDown = async(req, res)=>{
    try{

        const branchID = req.params.id;
        const branch = await Branch.findOne({_id: branchID})
        const productsBranch = await branch.products
        const arrayProducts = []
        for(let product of productsBranch)
        {
            let productID = product.companyProduct
            let stock = product.stock
            let sales = product.sales
            let searchNameProduct = await CompanyProduct.findOne({_id:productID})
            arrayProducts.push
            (
                {
                    name: searchNameProduct.name,
                    description: searchNameProduct.description,
                    price: searchNameProduct.price,
                    provider: searchNameProduct.providerName,
                    stock: stock,
                    sales: sales
                }
            );
        }
        arrayProducts.sort((a,b) =>
        {
            if(a.name > b.name)
            {
                return -1;
            }
            else if(b.name < a.name)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        })
        return res.send({arrayProducts})
    }
    catch(err){
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


exports.getProductBranch = async(req,res)=>
{
    try
    {
        const params = req.body;
        const branchID = req.params.id;
        const productID = params.product;

        const branch = await Branch.findOne({_id: branchID}).populate('products.companyProduct');
        const productBranch = await branch.products.id(productID);

        if(!branch) return res.status(400).send({message: 'Branch Not Found'});

        if (!productBranch) 
                return res.send({ message: 'Product Not Found' }); 
            
        for(var key = 0; key < branch.products.length; key++)
        {
            delete branch.products[key].companyProduct.stock;
            delete branch.products[key].companyProduct.sales;
            delete branch.products[key].companyProduct.company;
            delete branch.products[key].companyProduct._id;
            delete branch.products[key].companyProduct.__v;
        }
        return res.send({productBranch});
    }
    catch (err)
    {
        console.log(err);
        return err;
    }
}


exports.getShoppingCart = async(req,res)=>
{
    try
    {
        const shoppingCarts = await ShoppingCart.find({}).populate('products.product');
        return res.send({shoppingCarts})
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}



//-----------------Admin-----------------//
exports.saveBranchIsAdmin = async(req, res)=>{
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


        const companyExist = await Branch.findOne({$and:[{name:data.name},{company: data.company}]});
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

exports.updateBranchIsAdmin = async (req, res) =>{
    try{
        const branchID = req.params.id;
        const params = req.body; 
        
        const data = {
            name: params.name,
            phone: params.phone,
            address: params.address,
            township: params.township,
        };

        const branchExist = await Branch.findOne({$and: [{_id: branchID}]});
            if(!branchExist) return res.send({message: 'Branch not found'});

        const validateUpdate = await checkUpdate(params);
            if(validateUpdate === false) return res.status(400).send({message: 'Cannot update this information or invalid params'});

        const nameBranch = await Branch.findOne({$and: [{name: data.name},{company: branchExist.company}]});
            if(nameBranch && branchExist.name != data.name) return res.status(400).send({message: 'Name branch already in use'});
    
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
exports.deleteBranchIsAdmin = async(req, res)=>{
    try{
        const branchID = req.params.id;

        const branchDeleted = await Branch.findOneAndDelete({_id: branchID});
        if(!branchDeleted) return res.status(400).send({message: 'Branch not found or already deleted'});
        return res.send({message: 'Branch deleted', branchDeleted});
    }catch(err){
        console.log(err);
        return res.status(500).send({err, message: 'Error deleting branch'});
    }
}