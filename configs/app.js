'use strict';


//Importación de las Dependencias
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require ('cors');


//Importación de las Rutas//
const companyRoutes = require('../src/routes/company.routes');
const townshipRoutes = require('../src/routes/township.routes');
const companyProductRoutes = require('../src/routes/companyProduct.routes');
const typeCompanyRoutes = require('../src/routes/typeCompany.routes');
const branchRoutes = require('../src/routes/branch.routes');

//APP -> Servidor HTTP (Express)
const app = express(); //Creación del Servidor de Express


/*--------- CONFIGURACIÓN DEL SERVIDOR ---------*/ 

app.use(helmet());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.use('/company', companyRoutes);
app.use('/township', townshipRoutes);
app.use('/companyProduct', companyProductRoutes);
app.use('/typeCompany', typeCompanyRoutes);
app.use('/branch', branchRoutes);

//Exportación//
module.exports = app;