// ========================================
// Puerto
// ========================================

process.env.PORT = process.env.PORT || 3000;

// ========================================
// Entorno (se verifica si se está en el entorno de Prod o Desa)
// ========================================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; 

// ========================================
// Fecha de expiracion del Token
// ========================================

process.env.CADUCIDAD_TOKEN = 60*60*24*30;

// ========================================
// Seed - Semilla de autenticacion
// ========================================

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ========================================
// Base de datos
// ========================================

let urlDB;

if (process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    // urlDB = 'mongodb+srv://nicolasemi:<password>@cluster0-8loyx.mongodb.net/cafe';
    urlDB = process.env.MONGO_URI;
}

// Acá estamos INVENTANDO una variable de entorno
process.env.URLDB = urlDB;