const express = require('express');

// "Usuario" arranca con mayúscula porque se van a crear objetos del tipo "Usuario"
// (Igualmente esto es un estándar, pero no es obligatorio)
const Usuario = require('../models/usuario');

// Se importa el método del middleware
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

const bcrypt = require('bcrypt');
const _ = require('underscore');

// ##################################################


// OBTIENE LA LISTA DE USUARIOS
app.get('/usuario', verificaToken, (req, res) => {

    // en "res.query" vienen los PARAMETROS OPCIONALES (los que supongo que van a llegar)
    let desde = Number(req.query.desde) || 0;
    // let hasta = req.query.ha|sta || 0;
    let limite = Number(req.query.limite) || 5;

    // Lo que está entre '' del find son los campos que sí quiero mostrar en la respuesta, los que no quiero mostrar no los agrego acá
    // "estado: true" trae los usuario ACTIVOS --> Ver "DELETE - Forma 2"
    Usuario.find({ estado: true }, 'nombre email role estado google img').skip(desde).limit(limite).exec((err, usuarios) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Cuenta la cantidad de registros totales de la coleccion (sin hacer ninguna condición)
        // (Un ejemplo de condición es "count({ google: true },....")
        Usuario.count({ estado: true }, (err, conteo) => {
            res.json({
                ok: true,
                usuarios,
                'cantidad de registros': conteo
            });
        });
    });
});


// CREACION DE UN USUARIO
app.post('/usuario', [verificaToken, verificaAdmin_Role], (req, res) => {

    let body = req.body;

    // Objeto de la "clase" (del esquema)
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // "usuarioDB" es la respuesta del Usuario que se grabó en MongoDB
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});


// ACTUALIZACION DE UN USUARIO
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let idUsuario = req.params.id;

    // Parámetros que SI se pueden actualizar (los que NO se pueden actualizar son "google" y "password")
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(idUsuario, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});


// ELIMINACION DE UN USUARIO
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    // Se puede borrar de dos formas:
    // 1 - borrando el registro de la BD directamente
    // 2 - cambiando la variable "estado" para mostrar que no está disponible en la BD

    // Forma 1:
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     if (!usuarioBorrado) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         usuario: usuarioBorrado
    //     });
    // });


    // Forma 2:

    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});

// ##################################################

module.exports = app;

