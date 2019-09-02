const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Debe existir una referencia a un usuario']
    }
});


// La colección (tabla) se va a llamar "Categoria", y su configuración es la de "categoriaSchema"
module.exports = mongoose.model('Categoria', categoriaSchema);
