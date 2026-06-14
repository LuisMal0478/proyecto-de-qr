const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(process.env.DATABASE_PATH) 
  : path.resolve(__dirname, '../database.sqlite');

// Abrir la base de datos (se crea automáticamente si no existe)
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al abrir la base de datos SQLite:', err.message);
  } else {
    console.log('Base de datos SQLite inicializada y conectada.');
  }
});

// Promisificar operaciones comunes
const query = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

// Crear las tablas necesarias si no existen
const connectDB = async () => {
  try {
    // 1. Tabla de Usuarios
    await query.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'free',
        subscriptionStatus TEXT DEFAULT 'inactive',
        subscriptionRefPayco TEXT DEFAULT NULL,
        subscriptionExpiresAt TEXT DEFAULT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // 2. Tabla de Códigos QR
    await query.run(`
      CREATE TABLE IF NOT EXISTS qrcodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        isDynamic INTEGER DEFAULT 0,
        shortId TEXT UNIQUE DEFAULT NULL,
        fgColor TEXT DEFAULT '#000000',
        bgColor TEXT DEFAULT '#ffffff',
        size INTEGER DEFAULT 300,
        logo TEXT DEFAULT NULL,
        scansCount INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Tabla de Escaneos (Métricas)
    await query.run(`
      CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        qrCode_id INTEGER NOT NULL,
        ip TEXT DEFAULT 'Unknown',
        userAgent TEXT DEFAULT 'Unknown',
        device TEXT DEFAULT 'unknown',
        browser TEXT DEFAULT 'Unknown',
        os TEXT DEFAULT 'Unknown',
        country TEXT DEFAULT 'Colombia',
        timestamp TEXT NOT NULL,
        FOREIGN KEY(qrCode_id) REFERENCES qrcodes(id) ON DELETE CASCADE
      )
    `);

    // 4. Tabla de Historial de Pagos
    await query.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        refPayco TEXT UNIQUE NOT NULL,
        transactionId TEXT DEFAULT '',
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'COP',
        status TEXT NOT NULL,
        paymentMethod TEXT DEFAULT 'Desconocido',
        createdAt TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Tablas de SQLite creadas o validadas correctamente.');
  } catch (error) {
    console.error('Error al inicializar las tablas de la base de datos:', error.message);
    process.exit(1);
  }
};

module.exports = { db, query, connectDB };
