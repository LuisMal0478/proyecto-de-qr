const { query } = require('../config/db');

class QRCode {
  constructor(data) {
    this._id = data.id; // Map SQLite 'id' to '_id' for route compatibility
    this.user = data.user_id; // Map 'user_id' to 'user' for route compatibility
    this.name = data.name;
    this.type = data.type;
    this.content = data.content;
    this.isDynamic = !!data.isDynamic;
    this.shortId = data.shortId || null;
    this.design = {
      fgColor: data.fgColor || '#000000',
      bgColor: data.bgColor || '#ffffff',
      size: data.size || 300,
      logo: data.logo || null,
    };
    this.scansCount = data.scansCount || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Guardar cambios del QR (Actualizar nombre o contenido)
  async save() {
    const updatedAt = new Date().toISOString();
    await query.run(
      `UPDATE qrcodes SET 
        name = ?, 
        content = ?, 
        scansCount = ?, 
        updatedAt = ? 
      WHERE id = ?`,
      [
        this.name,
        this.content,
        this.scansCount,
        updatedAt,
        this._id
      ]
    );
    this.updatedAt = updatedAt;
    return this;
  }

  // ---- MÉTODOS ESTÁTICOS ----

  static async countDocuments({ user }) {
    const row = await query.get('SELECT COUNT(*) as count FROM qrcodes WHERE user_id = ?', [user]);
    return row ? row.count : 0;
  }

  static find(conditions) {
    const executeQuery = async (sortOptions = null) => {
      let sql = 'SELECT * FROM qrcodes WHERE user_id = ?';
      if (sortOptions && sortOptions.createdAt === -1) {
        sql += ' ORDER BY createdAt DESC';
      } else {
        sql += ' ORDER BY createdAt ASC';
      }
      const rows = await query.all(sql, [conditions.user]);
      return rows.map((row) => new QRCode(row));
    };

    const promise = (async () => {
      return await executeQuery();
    })();

    promise.sort = function (sortOptions) {
      return executeQuery(sortOptions);
    };

    return promise;
  }

  static async findById(id) {
    if (!id) return null;
    const row = await query.get('SELECT * FROM qrcodes WHERE id = ?', [id]);
    if (!row) return null;
    return new QRCode(row);
  }

  static async findOne({ shortId }) {
    if (!shortId) return null;
    const row = await query.get('SELECT * FROM qrcodes WHERE shortId = ?', [shortId]);
    if (!row) return null;
    return new QRCode(row);
  }

  static async create(data) {
    const { name, type, content, isDynamic, shortId, design } = data;
    const now = new Date().toISOString();

    const result = await query.run(
      `INSERT INTO qrcodes (user_id, name, type, content, isDynamic, shortId, fgColor, bgColor, size, logo, scansCount, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user, // En las rutas se pasa como `qrData.user = req.user._id`
        name,
        type,
        content,
        isDynamic ? 1 : 0,
        shortId || null,
        design?.fgColor || '#000000',
        design?.bgColor || '#ffffff',
        design?.size || 300,
        design?.logo || null,
        0,
        now,
        now
      ]
    );

    const newQrRow = await query.get('SELECT * FROM qrcodes WHERE id = ?', [result.id]);
    return new QRCode(newQrRow);
  }

  static async deleteOne({ _id }) {
    if (!_id) return { deletedCount: 0 };
    const result = await query.run('DELETE FROM qrcodes WHERE id = ?', [_id]);
    return { deletedCount: result.changes };
  }
}

module.exports = QRCode;
