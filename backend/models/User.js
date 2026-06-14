const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this._id = data.id; // Map SQLite 'id' to '_id' for route compatibility
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'free';
    this.subscription = {
      status: data.subscriptionStatus || 'inactive',
      refPayco: data.subscriptionRefPayco || null,
      expiresAt: data.subscriptionExpiresAt ? new Date(data.subscriptionExpiresAt) : null,
    };
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Verificar la contraseña
  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Guardar cambios en el usuario (Actualización)
  async save() {
    const updatedAt = new Date().toISOString();
    
    // Si la contraseña ha cambiado y no está encriptada, la encriptamos (opcional en nuestro flujo)
    if (this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    await query.run(
      `UPDATE users SET 
        name = ?, 
        email = ?, 
        password = ?, 
        role = ?, 
        subscriptionStatus = ?, 
        subscriptionRefPayco = ?, 
        subscriptionExpiresAt = ?, 
        updatedAt = ? 
      WHERE id = ?`,
      [
        this.name,
        this.email,
        this.password,
        this.role,
        this.subscription.status,
        this.subscription.refPayco,
        this.subscription.expiresAt ? this.subscription.expiresAt.toISOString() : null,
        updatedAt,
        this._id
      ]
    );
    this.updatedAt = updatedAt;
    return this;
  }

  // ---- MÉTODOS ESTÁTICOS ----

  static findOne({ email }) {
    const promise = (async () => {
      if (!email) return null;
      const row = await query.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (!row) return null;
      return new User(row);
    })();

    promise.select = function (fields) {
      return this.then((user) => {
        // En nuestro SQLite el password siempre viene por defecto, no es necesario hacer nada más
        return user;
      });
    };

    return promise;
  }

  static findById(id) {
    const promise = (async () => {
      if (!id) return null;
      const row = await query.get('SELECT * FROM users WHERE id = ?', [id]);
      if (!row) return null;
      return new User(row);
    })();

    promise.select = function (fields) {
      return this.then((user) => {
        if (user && fields && fields.includes('-password')) {
          delete user.password;
        }
        return user;
      });
    };

    return promise;
  }

  static async create(data) {
    const { name, email, password } = data;
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const now = new Date().toISOString();

    const result = await query.run(
      `INSERT INTO users (name, email, password, role, subscriptionStatus, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email.toLowerCase().trim(),
        hashedPassword,
        'free',
        'inactive',
        now,
        now
      ]
    );

    const newUserRow = await query.get('SELECT * FROM users WHERE id = ?', [result.id]);
    return new User(newUserRow);
  }
}

module.exports = User;
