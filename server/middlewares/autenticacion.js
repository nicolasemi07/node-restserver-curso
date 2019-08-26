const jwt = require('jsonwebtoken');

// ========================================
// Verificacion del Token
// ========================================

let verificaToken = (req,res,next) => { // El "next" hace que se continúe con la ejecución del programa (si no se ejecuta, se cuelga ahí)
    let token = req.get('token'); // En la función o método "get" obtengo los headers del request

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token inválido'
                }
            });
        }

        // En "req.usuario" estoy obteniendo el payload (todo el usuario)
        req.usuario = decoded.usuario;
        next();
    });
};

// ========================================
// Verificacion del ADMIN_ROLE
// ========================================
let verificaAdmin_Role = (req,res,next) => {

    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE'){
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no posee los permisos de Administrador'
            }
        });
    }

    next();
};

module.exports = {
    verificaToken,
    verificaAdmin_Role
}