const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const Scan = require('../models/Scan');
const { protect } = require('../middleware/auth');
const { premiumOnly } = require('../middleware/premium');

// @desc    Obtener estadísticas generales para las tarjetas del Dashboard
// @route   GET /api/stats/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    // 1. SOPORTE DE ESTADÍSTICAS GLOBALES PARA ADMINISTRADOR
    if (req.user.role === 'admin' || req.user.email === 'admin@qrify.com') {
      // Contar total de códigos QR creados en el sistema
      const qrCountRow = await query.get("SELECT COUNT(*) as count FROM qrcodes");
      const qrCount = qrCountRow ? qrCountRow.count : 0;

      // Contar QRs dinámicos vs estáticos en el sistema
      const dynamicCountRow = await query.get("SELECT COUNT(*) as count FROM qrcodes WHERE isDynamic = 1");
      const dynamicCount = dynamicCountRow ? dynamicCountRow.count : 0;
      const staticCount = qrCount - dynamicCount;

      // Sumar escaneos globales de todos los QRs
      const totalScansRow = await query.get("SELECT SUM(scansCount) as count FROM qrcodes");
      const totalScans = totalScansRow && totalScansRow.count ? totalScansRow.count : 0;

      // Contar total de usuarios registrados en el sistema
      const totalUsersRow = await query.get("SELECT COUNT(*) as count FROM users");
      const totalUsers = totalUsersRow ? totalUsersRow.count : 0;

      // Ingresos totales acumulados en pesos colombianos (Approved payments in ePayco)
      const totalRevenueRow = await query.get("SELECT SUM(amount) as count FROM payments WHERE status = 'approved'");
      const totalRevenue = totalRevenueRow && totalRevenueRow.count ? totalRevenueRow.count : 0;

      // Obtener los últimos 5 escaneos globales de la plataforma
      const sqlRecentScans = `
        SELECT s.*, q.name as qr_name, q.type as qr_type 
        FROM scans s 
        INNER JOIN qrcodes q ON s.qrCode_id = q.id 
        ORDER BY s.timestamp DESC 
        LIMIT 5
      `;
      const recentScansRows = await query.all(sqlRecentScans);
      const recentScans = recentScansRows.map((row) => ({
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

      return res.json({
        success: true,
        isAdmin: true,
        stats: {
          totalQRs: qrCount,
          dynamicQRs: dynamicCount,
          staticQRs: staticCount,
          totalScans,
          totalUsers,
          totalRevenue,
          role: 'admin',
        },
        recentScans,
      });
    }

    // 2. COMPORTAMIENTO ESTÁNDAR PARA CLIENTES REGULARES
    // Contar total de códigos QR creados por el usuario
    const qrCount = await QRCode.countDocuments({ user: req.user._id });

    // Contar QRs dinámicos vs estáticos del usuario
    const dynamicCount = await QRCode.countDocuments({ user: req.user._id, isDynamic: true });
    const staticCount = qrCount - dynamicCount;

    // Sumar escaneos de todos sus QRs dinámicos
    const qrs = await QRCode.find({ user: req.user._id });
    const totalScans = qrs.reduce((sum, qr) => sum + qr.scansCount, 0);

    // Obtener las últimas 5 actividades de escaneo
    const qrIds = qrs.map(qr => qr._id);
    let recentScans = [];
    if (qrIds.length > 0) {
      recentScans = await Scan.find({ qrCode: { $in: qrIds } })
        .populate('qrCode', 'name type')
        .sort({ timestamp: -1 })
        .limit(5);
    }

    res.json({
      success: true,
      isAdmin: false,
      stats: {
        totalQRs: qrCount,
        dynamicQRs: dynamicCount,
        staticQRs: staticCount,
        totalScans,
        role: req.user.role,
      },
      recentScans,
    });
  } catch (error) {
    console.error('Error al generar estadísticas del dashboard:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al generar estadísticas' });
  }
});

// @desc    Obtener estadísticas detalladas de un QR específico (Solo Premium)
// @route   GET /api/stats/qr/:id
// @access  Private (Premium Only)
router.get('/qr/:id', protect, premiumOnly, async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'Código QR no encontrado' });
    }

    // Validar propietario del QR
    if (qrCode.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'No autorizado para ver estas analíticas' });
    }

    if (!qrCode.isDynamic) {
      return res.status(400).json({
        success: false,
        message: 'Las estadísticas en tiempo real solo están disponibles para códigos QR dinámicos.',
      });
    }

    // 1. Obtener agregación de Dispositivos (Móvil, Tablet, Escritorio)
    const deviceStats = await Scan.aggregate([
      { $match: { qrCode: qrCode._id } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
    ]);

    // 2. Obtener agregación de Sistemas Operativos
    const osStats = await Scan.aggregate([
      { $match: { qrCode: qrCode._id } },
      { $group: { _id: '$os', count: { $sum: 1 } } },
    ]);

    // 3. Obtener agregación de Navegadores
    const browserStats = await Scan.aggregate([
      { $match: { qrCode: qrCode._id } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
    ]);

    // 4. Obtener agregación de Países
    const countryStats = await Scan.aggregate([
      { $match: { qrCode: qrCode._id } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // 5. Obtener agregación de escaneos por día en los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const scansByDate = await Scan.aggregate([
      {
        $match: {
          qrCode: qrCode._id,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      qrCode: {
        id: qrCode._id,
        name: qrCode.name,
        type: qrCode.type,
        content: qrCode.content,
        scansCount: qrCode.scansCount,
        createdAt: qrCode.createdAt,
      },
      analytics: {
        devices: deviceStats,
        os: osStats,
        browsers: browserStats,
        countries: countryStats,
        scansTimeline: scansByDate,
      },
    });
  } catch (error) {
    console.error('Error al generar estadísticas detalladas:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al generar estadísticas detalladas' });
  }
});

module.exports = router;
