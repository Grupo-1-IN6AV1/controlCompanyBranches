'use strict';

//Importación del Archivo mongoConfig - Conexión a MongoDB
const mongoConfig = require('./configs/mongoConfig');

//Importación de Encriptado//
const {encrypt, alreadyCompany} = require('./src/utils/validate');

//Importación del Modelo de Usuario//
const Company = require('./src/models/company.model');

//Importación del Servidor de Express
const app = require('./configs/app');

//Importación del Puerto en una Constante
const port = 3200;

const fs = require('fs')
const path = require('path')

mongoConfig.init();

app.listen(port, async ()=>
{
    console.log(`Server HTTP running in port ${port}.`);

    const automaticUser = 
    {
        username: 'SuperAdmin',
        name: 'SuperAdmin',
        surname: 'SuperAdmin',
        phone: 'SuperAdmin',
        email: 'admin@kinal.edu.gt',
        password: await encrypt('123456'),
        role: 'ADMIN'
    }

    const searchUserAdmin = await alreadyCompany(automaticUser.username);
    if(!searchUserAdmin)
    {
        let userAdmin = new Company(automaticUser);
        await userAdmin.save();
        console.log('User SuperAdmin register Successfully.')
    }
});