'use strict';

//Importación de Mongoose
const mongoose = require('mongoose');

//Función - Conexión con MongoDB
exports.init = ()=>
{
    const uriMongo = 'mongodb://127.0.0.1:27017/controlCompanyBranches';

    //Promesa de Mongo
    mongoose.Promise = global.Promise;

    //Ciclo de Vida de la Conexión - MongoDB

    mongoose.connection.on('error', ()=>
    {
        console.log('MongoDB | Could not connect to MongoDB.');
    });

    mongoose.connection.on('connecting', ()=>
    {
        console.log('MongoDB | Try Connecting.');
    });

    mongoose.connection.on('connected', ()=>
    {
        console.log('MongoDB | Connected to MongoDB.');
    });

    mongoose.connection.once('open', ()=>
    {
        console.log('MongoDB | Connected to Database.');
    });

    mongoose.connection.on('reconnected', ()=>
    {
        console.log('MongoDB | Reconnected');
    });

    mongoose.connection.on('disconnected', ()=>
    {
        console.log('MongoDB | Disconnect... Exiting...');
    });

    mongoose.connect(uriMongo,
    {
        useNewUrlParser: true,
        connectTimeoutMs: 2500,
        maxPoolSize: 50
    }).catch(err=>console.log(err));
}