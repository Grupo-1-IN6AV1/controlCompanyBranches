' use strict '

//Importación del Modelo -Bill-
const Bill = require('../models/bill.model');

//Importación del Modelo -ShoppingCart-
const ShoppingCart = require('../models/shoppingCart.model');

//Importación del Modelo -Product-
const CompanyProduct = require('../models/companyProduct.model');

//Importación del Reporte en PDF de la Factura//
const {savePDF} = require('./billPDF.controller');

const path = require('path');
const fs = require('fs');


exports.testBill = (req, res)=>
{
    return res.send({message: 'The function test is running.'});
}

//Crear||Guardar Facturas
exports.createBill = async (req, res)=>
{
    try
    {
        const company = req.user.sub;
        const params = req.body;
        const dpi = params.dpi;

        const payShoppingCart = await ShoppingCart.findOne({dpi:dpi}).lean();
        
        //Verificar que el Carrito tenga Productos//
        if(!payShoppingCart)
            return res.send({message:'Shopping Cart empty, add products.'})

        //Capturar la Fecha Actual.//
        const date = new Date();

        //Generador de Codigos de
        const bills = await Bill.count().lean();

        const shoppingCartBuy = 
        {
            //Seteando la Fecha Actual.//
            company: payShoppingCart.company,
            date: date.toISOString().split('T')[0],
            numberBill: bills+1000,
            client: payShoppingCart.client,
            NIT: payShoppingCart.NIT,
            products: payShoppingCart.products,
            IVA: payShoppingCart.IVA,
            subTotal: payShoppingCart.subTotal,
            total: payShoppingCart.total
        }

        //Guardar la Factura.//
        const bill = new Bill(shoppingCartBuy);
        await bill.save();
        
        //Actualizar el stock y el sale del Producto//
        // - Validar que duplique los productos del carrito.//
        for(var key = 0; key < payShoppingCart.products.length; key++)
        {
            //ID de cada Producto del Carrito.//
            const idUpdateProduct = payShoppingCart.products[key].product.valueOf();
            //Quantity - CARRITO//
            var productQuantity = payShoppingCart.products[key];
            //Obtener Stock y Sales de los Productos del Carrito.//
            const product = await CompanyProduct.findOne({_id:idUpdateProduct});
        }
           
        const cleanShoppingCart = await ShoppingCart.findOneAndDelete(
            {_id:payShoppingCart._id});
        const viewBill = await Bill.findOne({_id:bill._id})
        //Imprimir en PDF la Factura//
        const pdf = await savePDF(viewBill);
        const updateBill = await Bill.findOne({_id:bill._id});
        return res.send({message:'Bill Generated Succesfully.',updateBill});     
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}

exports.getPDF = async (req,res) => 
{
    try
    {
        const fileName = req.params.fileName
        const pathFile = './pdfs/' + fileName;
        const PDF = fs.existsSync(pathFile);
        return res.sendFile(path.resolve(pathFile));
    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}

