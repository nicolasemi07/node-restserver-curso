// ========================================
// Puerto
// ========================================

process.env.PORT = process.env.PORT || 3000;

// ========================================
// Entorno (se verifica si se está en el entorno de Prod o Desa)
// ========================================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; 

// ========================================
// Base de datos
// ========================================

let urlDB;

if (process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    // urlDB = 'mongodb+srv://nicolasemi:<password>@cluster0-8loyx.mongodb.net/cafe';
    urlDB = 'mongodb+srv://nicolasemi:K9RbAPMwgv0agMV4@cluster0-8loyx.mongodb.net/cafe';
}

// Acá estamos INVENTANDO una variable de entorno
process.env.URLDB = urlDB;