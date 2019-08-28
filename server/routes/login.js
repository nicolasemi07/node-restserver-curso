// Librerías
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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

// CONFIGURACIONES DE GOOGLE
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }
//   verify().catch(console.error);

app.post('/google', async (req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token).catch(err => {
        return res.status(403).json({
            ok: false,
            err
        });
    });

    // verificar si ese usuario no existe en la BD
    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (!usuarioDB.google) { // Si existe el usuario pero NO está autenticado por Google, es porque es un usuario común de BD
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticación normal'
                    }
                });
            } else {  // Sí es un usuario autenticado por Google, pero acá se necesita RENOVAR SU TOKEN para que pueda seguir trabajando
                let token = jwt.sign({
                    usuario: usuarioDB // Payload
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN} /*30 días*/);
        
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else { // El usuario NO existe en la BD y entra por primera vez
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB // Payload
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN} /*30 días*/);
        
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

module.exports = app;