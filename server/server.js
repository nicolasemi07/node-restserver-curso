const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

require('./config/config');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Configuración global de rutas (apunta a las rutas que están en el "index.js" de la carpeta "routes")
app.use(require('./routes/index'));

// Habilitar carpeta "public" para presentar página web
app.use(express.static(path.resolve(__dirname, '../public')));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log(`Servidor escuchando en puerto ${process.env.PORT}`);
});