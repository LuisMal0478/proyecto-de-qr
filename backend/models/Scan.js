const { query } = require('../config/db');

class Scan {
  constructor(data) {
    this._id = data.id;
    this.qrCode = data.qrCode_id;
    this.ip = data.ip;
    this.userAgent = data.userAgent;
    this.device = data.device;
    this.browser = data.browser;
    this.os = data.os;
    this.country = data.country;
    this.timestamp = data.timestamp;
  }

  // ---- MÉTODOS ESTÁTICOS ----

  static async create(data) {
    const { qrCode, ip, userAgent, device, os, browser, country } = data;
    const now = new Date().toISOString();

    const result = await query.run(
      `INSERT INTO scans (qrCode_id, ip, userAgent, device, browser, os, country, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        qrCode, // ID del QR
        ip || 'Unknown',
        userAgent || 'Unknown',
        device || 'unknown',
        browser || 'Unknown',
        os || 'Unknown',
        country || 'Colombia',
        now
      ]
    );

    const newScanRow = await query.get('SELECT * FROM scans WHERE id = ?', [result.id]);
    return new Scan(newScanRow);
  }

  static async deleteMany({ qrCode }) {
    if (!qrCode) return { deletedCount: 0 };
    const result = await query.run('DELETE FROM scans WHERE qrCode_id = ?', [qrCode]);
    return { deletedCount: result.changes };
  }

  static find(conditions) {
    // Encadenamiento de métodos populate(), sort() y limit() para soportar queries de MongoDB
    return {
      populate: function (refField, selectFields) {
        return {
          sort: function (sortOptions) {
            return {
              limit: async (limitCount) => {
                const qrIds = conditions?.qrCode?.$in;
                if (!qrIds || qrIds.length === 0) return [];

                const placeholders = qrIds.map(() => '?').join(',');
                const sql = `
                  SELECT s.*, q.name as qr_name, q.type as qr_type 
                  FROM scans s 
                  INNER JOIN qrcodes q ON s.qrCode_id = q.id 
                  WHERE s.qrCode_id IN (${placeholders}) 
                  ORDER BY s.timestamp DESC 
                  LIMIT ?
                `;
                const params = [...qrIds, limitCount];
                const rows = await query.all(sql, params);

                return rows.map((row) => ({
                  _id: row.id,
                  ip: row.ip,
                  userAgent: row.userAgent,
                  device: row.device,
                  browser: row.browser,
                  os: row.os,
                  country: row.country,
                  timestamp: row.timestamp,
                  qrCode: {
                    _id: row.qrCode_id,
                    name: row.qr_name,
                    type: row.qr_type,
                  },
                }));
              },
            };
          },
        };
      },
    };
  }

  // Traductor SQL del agregador demográfico de MongoDB
  static async aggregate(pipeline) {
    const matchStage = pipeline.find((stage) => stage.$match);
    const groupStage = pipeline.find((stage) => stage.$group);
    const sortStage = pipeline.find((stage) => stage.$sort);
    const limitStage = pipeline.find((stage) => stage.$limit);

    if (!matchStage || !matchStage.$match) return [];
    
    // Obtener ID del QR
    // En las rutas, se pasa como `qrCode: qrCode._id`
    const qrCodeId = matchStage.$match.qrCode;

    if (groupStage && groupStage.$group) {
      const groupField = groupStage.$group._id;

      if (typeof groupField === 'string') {
        const fieldName = groupField.substring(1); // ej: '$device' -> 'device'
        
        let sql = `
          SELECT ${fieldName} as _id, COUNT(*) as count 
          FROM scans 
          WHERE qrCode_id = ? 
          GROUP BY ${fieldName}
        `;

        if (sortStage && sortStage.$sort) {
          sql += ' ORDER BY count DESC';
        }
        if (limitStage && limitStage.$limit) {
          sql += ` LIMIT ${limitStage.$limit}`;
        }

        return await query.all(sql, [qrCodeId]);
      } else {
        // Agrupación de Línea de Tiempo (Por Fecha en formato YYYY-MM-DD)
        const minDate = matchStage.$match.timestamp?.$gte;
        const minDateStr = minDate instanceof Date ? minDate.toISOString() : (minDate || '');

        const sql = `
          SELECT strftime('%Y-%m-%d', timestamp) as _id, COUNT(*) as count 
          FROM scans 
          WHERE qrCode_id = ? AND timestamp >= ? 
          GROUP BY _id 
          ORDER BY _id ASC
        `;
        return await query.all(sql, [qrCodeId, minDateStr]);
      }
    }

    return [];
  }
}

module.exports = Scan;
