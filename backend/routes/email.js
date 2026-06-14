const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { query } = require('../config/db');
const { protect } = require('../middleware/auth');
const {
  sendMail,
  getMailLogs,
  clearMailLogs,
  getExpirationWarningHtml,
  getPremiumPromotionHtml
} = require('../services/emailService');

// @desc    Escanear base de datos y enviar notificaciones de vencimiento a usuariosPremium que expiren en 3 días o menos
// @route   POST /api/emails/check-expirations
// @access  Private (Cualquier usuario autenticado en desarrollo para probar, o Administrador en prod)
router.post('/check-expirations', protect, async (req, res) => {
  try {
    // 1. Obtener todos los usuarios con rol premium o suscripción activa
    // Consultamos directamente en SQLite
    const rows = await query.all(
      "SELECT * FROM users WHERE role = 'premium' AND subscriptionStatus = 'active' AND subscriptionExpiresAt IS NOT NULL"
    );

    const notifiedUsers = [];
    const now = new Date();

    for (const row of rows) {
      const user = new User(row);
      const expiresAt = user.subscription.expiresAt;
      
      if (!expiresAt) continue;

      // Calcular diferencia en días
      const timeDiff = expiresAt.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // Si expira en 3 días o menos (y no ha expirado del todo aún)
      if (daysLeft >= 0 && daysLeft <= 3) {
        const html = getExpirationWarningHtml(user.name, expiresAt.toISOString(), daysLeft);
        
        await sendMail({
          to: user.email,
          subject: `⚠️ Tu suscripción Premium de QRify vence en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`,
          html,
          type: 'expiration_warning'
        });

        notifiedUsers.push({
          id: user._id,
          name: user.name,
          email: user.email,
          expiresAt: expiresAt.toLocaleDateString(),
          daysLeft
        });
      }
    }

    res.json({
      success: true,
      message: `Escaneo completado. Se enviaron ${notifiedUsers.length} avisos de vencimiento.`,
      notifiedUsers
    });
  } catch (error) {
    console.error('Error al escanear y enviar correos de expiración:', error);
    res.status(500).json({ success: false, message: 'Error interno al procesar vencimientos', error: error.message });
  }
});

// @desc    Lanzar campaña promocional del plan Premium ($2.99 USD) a todos los usuarios con plan Free
// @route   POST /api/emails/promote-premium
// @access  Private
router.post('/promote-premium', protect, async (req, res) => {
  try {
    // 1. Obtener todos los usuarios con rol gratuito
    const rows = await query.all("SELECT * FROM users WHERE role = 'free'");
    
    const targetedUsers = [];

    for (const row of rows) {
      const user = new User(row);
      
      const html = getPremiumPromotionHtml(user.name);
      
      await sendMail({
        to: user.email,
        subject: `🚀 Desbloquea Códigos QR Dinámicos y Analíticas por solo $2.99 USD / mes`,
        html,
        type: 'premium_promotion'
      });

      targetedUsers.push({
        id: user._id,
        name: user.name,
        email: user.email
      });
    }

    res.json({
      success: true,
      message: `Campaña enviada exitosamente a ${targetedUsers.length} usuarios con Plan Free.`,
      targetedUsers
    });
  } catch (error) {
    console.error('Error al lanzar campaña promocional:', error);
    res.status(500).json({ success: false, message: 'Error interno al lanzar campaña', error: error.message });
  }
});

// @desc    Obtener logs de los correos simulados en memoria (Desarrollo)
// @route   GET /api/emails/logs
// @access  Private
router.get('/logs', protect, (req, res) => {
  try {
    const logs = getMailLogs();
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener bitácora de correos' });
  }
});

// @desc    Limpiar los logs de los correos simulados en memoria (Desarrollo)
// @route   DELETE /api/emails/logs
// @access  Private
router.delete('/logs', protect, (req, res) => {
  try {
    clearMailLogs();
    res.json({ success: true, message: 'Bitácora de correos limpia' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al vaciar bitácora de correos' });
  }
});

// @desc    Obtener métricas generales de usuarios para el panel de campañas
// @route   GET /api/emails/metrics
// @access  Private
router.get('/metrics', protect, async (req, res) => {
  try {
    const totalUsersRow = await query.get("SELECT COUNT(*) as count FROM users");
    const freeUsersRow = await query.get("SELECT COUNT(*) as count FROM users WHERE role = 'free'");
    const premiumUsersRow = await query.get("SELECT COUNT(*) as count FROM users WHERE role = 'premium' AND subscriptionStatus = 'active'");
    
    // Contar usuarios a vencer
    const rows = await query.all(
      "SELECT subscriptionExpiresAt FROM users WHERE role = 'premium' AND subscriptionStatus = 'active' AND subscriptionExpiresAt IS NOT NULL"
    );
    
    let expiringCount = 0;
    const now = new Date();
    
    for (const row of rows) {
      if (row.subscriptionExpiresAt) {
        const expiresAt = new Date(row.subscriptionExpiresAt);
        const timeDiff = expiresAt.getTime() - now.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        if (daysLeft >= 0 && daysLeft <= 3) {
          expiringCount++;
        }
      }
    }

    res.json({
      success: true,
      metrics: {
        total: totalUsersRow ? totalUsersRow.count : 0,
        free: freeUsersRow ? freeUsersRow.count : 0,
        premium: premiumUsersRow ? premiumUsersRow.count : 0,
        expiring: expiringCount
      }
    });
  } catch (error) {
    console.error('Error al generar métricas de email:', error);
    res.status(500).json({ success: false, message: 'Error interno al generar métricas' });
  }
});

module.exports = router;
