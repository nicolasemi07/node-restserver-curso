const express = require('express');

let { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');
const _ = require('underscore');

// OBTENER TODOS LOS PRODUCTOS
app.get('/productos', (req,res) => {
    // Traer todos los productos con usuario y categoria
    // Paginados

    // en "res.query" vienen los PARAMETROS OPCIONALES (los que supongo que van a llegar)
    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;

    // El "populate" encuentra IDs en la tabla "Producto" y permite cargar información
    Producto.find({ disponible: true }).populate('usuario', 'nombre email').populate('categoria', 'descripcion').skip(desde).limit(limite).exec((err, productos) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Cuenta la cantidad de registros totales de la coleccion (sin hacer ninguna condición)
        Producto.countDocuments({ disponible: true }, (err, conteo) => {
            res.json({
                ok: true,
                productos,
                'cantidad de registros': conteo
            });
        }).skip(desde).limit(limite);
    });
});

// OBTENER PRODUCTO POR ID
app.get('/productos/:id', (req,res) => {
    // Con usuario y categoria
    let idProducto = req.params.id;
    Producto.findById(idProducto).populate('usuario', 'nombre email').populate('categoria', 'descripcion').exec((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        res.json({
            ok: true,
            productoDB
        });
    });
});

// CREACION DE UN NUEVO PRODUCTO
app.post('/producto', verificaToken, (req,res) => {
    // Grabar usuario
    // Grabar una categoria del listado

    let body = req.body;

    // Objeto de la "clase" (del esquema)
    let prod = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    // "productoDB" es la respuesta del Producto que se grabó en MongoDB
    prod.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ACTUALIZACION DE UN PRODUCTO
app.put('/producto/:id', (req,res) => {
    // Grabar usuario
    // Grabar una categoria del listado

    let idProducto = req.params.id;

    // Parámetros que SI se pueden actualizar (El que NO se puede actualizar es "_id")
    let body = _.pick(req.body, ['nombre precioUni descripcion']);

    let actualizacion = {
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        descripcion: req.body.descripcion,
        categoria: req.body.categoria,
        disponible: req.body.disponible
    }

    Producto.findByIdAndUpdate(idProducto, actualizacion, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ELIMINACION DE UN PRODUCTO
app.delete('/producto/:id', (req,res) => {
    // Borrarlo logicamente... en la parte "disponible = false"
    let cambiaEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(req.params.id, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado,
            mensaje: 'Producto eliminado'
        });
    });
});

// BUSQUEDA DE PRODUCTOS
app.get('/productos/buscar/:termino', verificaToken, (req,res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex }).populate('usuario', 'nombre email').populate('categoria', 'descripcion').exec((err, productos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productos
        });
        
    });

});

module.exports = app;