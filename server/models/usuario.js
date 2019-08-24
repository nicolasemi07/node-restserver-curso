const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: { 
        type: String
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// Validación de mail único:
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

// Se agrega este bloque para que en la respuesta del POST de cración de usuario no se muestre el campo "password"
// (el método "toJSON" se llama siempre que se quiere imprimir, por lo que este método SE VA A MODIFICAR A MANO)
usuarioSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

// La colección (tabla) se va a llamar "Usuario", y su configuración es la de "usuarioSchema"
module.exports = mongoose.model('Usuario', usuarioSchema);
