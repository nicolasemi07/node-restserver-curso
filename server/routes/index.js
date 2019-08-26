const express = require('express');
const app = express();

// Definición de todas las rutas que se usan
app.use(require('./usuario'));
app.use(require('./login'));

module.exports = app