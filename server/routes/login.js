// Librerías
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario/contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) { // Trae "true" o "false" dependiendo si la contraseña ingresada hace match con la contraseña de la BD
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario/contraseña incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB // Payload
        }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN} /*30 días*/);

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

module.exports = app;