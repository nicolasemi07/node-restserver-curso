const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', (req,res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    // Validación de Tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos
            }
        });
    }

    let archivo = req.files.archivo; // Del lado derecho es lo que aparece en PostMan el "archivo"

    let nombreArchivoCortado = archivo.name.split('.');
    let extensionArchivo = nombreArchivoCortado[nombreArchivoCortado.length -1];
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Este tipo de archivo no está permitido'
            }
        });
    }

    // Cambio del nombre del archivo (la idea es que el nombre del archivo sea único)
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Acá la imagen está subida al FileSystem

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });

});

function imagenUsuario(id, res, nombreArchivo){
    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios'); // Acá hay que borrar la imagen porque se subió al FS pero no se guardó en la BD
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if (!usuarioDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        // Confirmar que el path de la imagen exista (esto se hace para que no se anden agregando)
        // imágenes en el FS, sino que sólo se actualicen
        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioActualizado) => {
            res.json({
                ok: true,
                usuario: usuarioActualizado,
                img: nombreArchivo
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo){
    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'productos'); // Acá hay que borrar la imagen porque se subió al FS pero no se guardó en la BD
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        // Confirmar que el path de la imagen exista (esto se hace para que no se anden agregando)
        // imágenes en el FS, sino que sólo se actualicen
        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoActualizado) => {
            res.json({
                ok: true,
                producto: productoActualizado,
                img: nombreArchivo
            });
        });
    });
}

function borrarArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;