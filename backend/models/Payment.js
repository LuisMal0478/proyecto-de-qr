const { query } = require('../config/db');

class Payment {
  constructor(data) {
    this._id = data.id;
    this.user = data.user_id;
    this.refPayco = data.refPayco;
    this.transactionId = data.transactionId || '';
    this.amount = data.amount;
    this.currency = data.currency || 'COP';
    this.status = data.status;
    this.paymentMethod = data.paymentMethod || 'Desconocido';
    this.createdAt = data.createdAt;
  }

  // Guardar cambios o actualización de la transacción
  async save() {
    const updatedAt = new Date().toISOString();
    await query.run(
      `UPDATE payments SET 
        transactionId = ?, 
        status = ? 
      WHERE id = ?`,
      [this.transactionId, this.status, this._id]
    );
    return this;
  }

  // ---- MÉTODOS ESTÁTICOS ----

  static async findOne({ refPayco }) {
    if (!refPayco) return null;
    const row = await query.get('SELECT * FROM payments WHERE refPayco = ?', [refPayco]);
    if (!row) return null;
    return new Payment(row);
  }

  static find(conditions) {
    const executeQuery = async (sortOptions = null) => {
      let sql = 'SELECT * FROM payments WHERE user_id = ?';
      if (sortOptions && sortOptions.createdAt === -1) {
        sql += ' ORDER BY createdAt DESC';
      } else {
        sql += ' ORDER BY createdAt ASC';
      }
      const rows = await query.all(sql, [conditions.user]);
      return rows.map((row) => new Payment(row));
    };

    const promise = (async () => {
      return await executeQuery();
    })();

    promise.sort = function (sortOptions) {
      return executeQuery(sortOptions);
    };

    return promise;
  }

  static async create(data) {
    const { user, refPayco, transactionId, amount, currency, status, paymentMethod } = data;
    const now = new Date().toISOString();

    const result = await query.run(
      `INSERT INTO payments (user_id, refPayco, transactionId, amount, currency, status, paymentMethod, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user, // ID del usuario
        refPayco,
        transactionId || '',
        amount,
        currency || 'COP',
        status || 'pending',
        paymentMethod || 'Desconocido',
        now
      ]
    );

    const newPaymentRow = await query.get('SELECT * FROM payments WHERE id = ?', [result.id]);
    return new Payment(newPaymentRow);
  }
}

module.exports = Payment;
