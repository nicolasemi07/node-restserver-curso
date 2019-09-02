const express = require('express');

let {verificaToken,verificaAdmin_Role} = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');
const _ = require('underscore');

// OBTENCION DE TODAS LAS CATEGORIAS (no hace falta que estén paginadas)
app.get('/categoria', verificaToken, (req,res) => {
    // El "populate" encuentra IDs en la tabla "Categoria" y permite cargar información
    Categoria.find({}).populate('usuario', 'nombre email').sort('descripcion').exec((err, categorias) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Cuenta la cantidad de registros totales de la coleccion (sin hacer ninguna condición)
        Categoria.countDocuments((err, conteo) => {
            res.json({
                ok: true,
                categorias,
                'cantidad de registros': conteo
            });
        });
    });
});

// OBTENCION DE CATEGORIA POR ID
app.get('/categoria/:id', verificaToken, (req,res) => {
    let idCategoria = req.params.id;
    Categoria.findById(idCategoria).exec((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoriaDB
        });
    });
});

// CREACION DE NUEVA CATEGORIA
app.post('/categoria', verificaToken, async (req,res) => {

    let body = req.body;

    // Objeto de la "clase" (del esquema)
    let categ = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    // "categoriaDB" es la respuesta de la Categoria que se grabó en MongoDB
    categ.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // await categoriaDB.populate('usuario').execPopulate(); // Llena la info con el usuario que creó la publicación

        // console.log(categ.usuario);

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ACTUALIZACION DE CATEGORIA
app.put('/categoria/:id', verificaToken, (req,res) => {
    let idCategoria = req.params.id;

    // Parámetros que SI se pueden actualizar (El que NO se puede actualizar es "_id")
    let body = _.pick(req.body, ['descripcion']);

    Categoria.findByIdAndUpdate(idCategoria, body, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


// ELIMINACION DE LA CATEGORIA
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req,res) => {

    // Sólo un administrador debe poder eliminarla
    let idCategoria = req.params.id;

    Categoria.findByIdAndRemove(idCategoria, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada
        });
    });
});

module.exports = app;