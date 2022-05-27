' use strict '

//Importación del Modelo -Product-
const CompanyProduct = require('../models/companyProduct.model');
const Company = require('../models/company.model')


const pdf = require("html-pdf");

const fs = require("fs");

const ubicacionPlantilla = require.resolve('../html/factura.html');
let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8')
// Estos productos podrían venir de cualquier lugar

exports.savePDF = async(bill)=>
{
    try
    {
        var number = bill.numberBill;
        var tabla = "";
        for (var key = 0; key < bill.products.length; key++) 
        {
            //ID de cada Producto del Carrito.//
            var setProduct = bill.products[key].product;
            //Quantity - CARRITO//
            var productQuantity = bill.products[key].quantity;
            //Subtotal Producto - CARRITO//
            var subTotalProduct = bill.products[key].subTotalProduct;
            //Obtener Stock y Sales de los Productos del Carrito.//
            var product = await CompanyProduct.findOne({_id:setProduct});
            // Y concatenar los productos
            tabla += `<tr>
            <td>${product.name}</td>
            <td>${productQuantity}</td>
            <td>Q.${product.price}</td>
            <td>Q.${subTotalProduct}</td>
            </tr>`;
        }
        // Remplazar el valor {{tablaProductos}} por el verdadero valor
        contenidoHtml = contenidoHtml.replace("{{tableProducts}}", tabla);

        // Y también los otros valores
        const findCompany = await Company.findOne({_id:bill.company}).lean();
        contenidoHtml = contenidoHtml.replace("{{company}}", `${findCompany.name}`);
        contenidoHtml = contenidoHtml.replace("{{numberBill}}", `${number}`);
        contenidoHtml = contenidoHtml.replace("{{IVA}}", `Q.${bill.IVA.toFixed(2)}`);
        contenidoHtml = contenidoHtml.replace("{{client}}", `${bill.client}`);
        contenidoHtml = contenidoHtml.replace("{{IVA}}", `Q.${bill.IVA.toFixed(2)}`);
        contenidoHtml = contenidoHtml.replace("{{subtotal}}", `Q.${bill.subTotal.toFixed(2)}`);
        contenidoHtml = contenidoHtml.replace("{{total}}", `Q.${bill.total.toFixed(2)}`);
        contenidoHtml = contenidoHtml.replace("{{date}}",`${bill.date}`);
        contenidoHtml = contenidoHtml.replace("{{NIT}}",`${bill.NIT}`);
        pdf.create(contenidoHtml).toFile(`./pdfs/Factura${bill.numberBill}.pdf`, (error) => {
            if (error) {
                console.log("Error creando PDF: " + error)
            } else {
                console.log("PDF creado correctamente");
            }
        });

    }
    catch(err)
    {
        console.log(err);
        return err;
    }
}








