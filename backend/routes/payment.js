const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

// Helper para procesar el estado de la transacción y actualizar la suscripción del usuario
const processTransactionStatus = async (transactionData) => {
  const {
    x_ref_payco: refPayco,
    x_transaction_id: transactionId,
    x_amount: amount,
    x_currency: currency,
    x_cod_response: responseCode, // 1 = Aceptada, 2 = Rechazada, 3 = Pendiente, 4 = Fallida
    x_response: responseText,
    x_extra1: userId, // Pasado en el checkout como extra1
    x_franchise: paymentMethod,
  } = transactionData;

  if (!userId) {
    console.error('Webhook recibido sin ID de usuario en x_extra1');
    return { success: false, message: 'Falta ID de usuario' };
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`Usuario con ID ${userId} no encontrado en base de datos`);
      return { success: false, message: 'Usuario no encontrado' };
    }

    let status = 'pending';
    if (Number(responseCode) === 1) {
      status = 'approved';
    } else if (Number(responseCode) === 2) {
      status = 'rejected';
    } else if (Number(responseCode) === 3) {
      status = 'pending';
    } else {
      status = 'failed';
    }

    // 1. Guardar o actualizar registro en la tabla de pagos
    let payment = await Payment.findOne({ refPayco });
    if (!payment) {
      payment = new Payment({
        user: userId,
        refPayco,
        transactionId,
        amount: Number(amount),
        currency,
        status,
        paymentMethod: paymentMethod || 'Desconocido',
      });
    } else {
      payment.status = status;
      payment.transactionId = transactionId;
    }
    await payment.save();

    // 2. Si el pago está aprobado, actualizar rol a premium y suscripción a activa
    if (status === 'approved') {
      user.role = 'premium';
      user.subscription.status = 'active';
      user.subscription.refPayco = refPayco;
      
      // La suscripción dura 30 días
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      user.subscription.expiresAt = expiresAt;
      await user.save();
      console.log(`Usuario ${user.email} ascendido a PREMIUM tras transacción aprobada`);
    } else if (status === 'rejected' || status === 'failed') {
      // Si la transacción fue rechazada y era la que mantenía el rol, bajar a free
      if (user.subscription.refPayco === refPayco) {
        user.role = 'free';
        user.subscription.status = 'inactive';
        user.subscription.refPayco = null;
        user.subscription.expiresAt = null;
        await user.save();
        console.log(`Usuario ${user.email} degradado a FREE por transacción rechazada/fallida`);
      }
    }

    return { success: true, status };
  } catch (error) {
    console.error('Error al procesar estado de ePayco:', error);
    return { success: false, error: error.message };
  }
};

// @desc    Confirmar transacción de forma inmediata tras redirección del cliente
// @route   POST /api/payments/confirm
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  const { refPayco } = req.body;

  if (!refPayco) {
    return res.status(400).json({ success: false, message: 'La referencia de pago es obligatoria' });
  }

  // Soporte para Simulación Offline de Pagos Aprobados (Desarrollo)
  if (refPayco.startsWith('ref_mock_')) {
    try {
      const mockTransactionData = {
        x_ref_payco: refPayco,
        x_transaction_id: 'TX_MOCK_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        x_amount: 11900,
        x_currency: 'COP',
        x_cod_response: 1, // 1 = Aceptada (Aprobada)
        x_response: 'Aceptada',
        x_extra1: req.user._id.toString(),
        x_franchise: 'VISA',
      };

      const result = await processTransactionStatus(mockTransactionData);

      if (result.success) {
        return res.json({
          success: true,
          status: 'approved',
          message: 'Simulación de pago aprobada',
        });
      } else {
        return res.status(400).json({ success: false, message: 'Error al simular pago' });
      }
    } catch (err) {
      console.error('Error al simular pago aprobado:', err);
      return res.status(500).json({ success: false, message: 'Error interno en la simulación de pago' });
    }
  }

  try {
    // Consultar el estado real de la transacción llamando a la API pública de verificación de ePayco
    const response = await axios.get(`https://secure.epayco.co/validation/v1/reference/${refPayco}`);
    
    if (!response.data || !response.data.success || !response.data.data) {
      return res.status(404).json({ success: false, message: 'Transacción no encontrada en ePayco' });
    }

    const transactionData = response.data.data;
    
    // Inyectar el ID de usuario en x_extra1 si ePayco no lo retornase para asegurar que la confirmación proceda
    if (!transactionData.x_extra1) {
      transactionData.x_extra1 = req.user._id.toString();
    }

    const result = await processTransactionStatus(transactionData);

    if (result.success) {
      res.json({
        success: true,
        status: result.status,
        message: `Estado de transacción actualizado a ${result.status}`,
      });
    } else {
      res.status(400).json({ success: false, message: result.message || 'Error al procesar el pago' });
    }
  } catch (error) {
    console.error('Error al confirmar transacción:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al confirmar el pago' });
  }
});

// @desc    Webhook oficial de ePayco en segundo plano
// @route   POST /api/payments/webhook
// @access  Public
router.post('/webhook', async (req, res) => {
  console.log('Webhook recibido de ePayco:', req.body);

  // ePayco envía parámetros por POST (body)
  const transactionData = req.body;

  try {
    if (!transactionData.x_ref_payco) {
      return res.status(400).json({ success: false, message: 'Referencia inválida' });
    }

    // Como medida de seguridad, en lugar de confiar ciegamente en el cuerpo del POST (que podría ser falsificado),
    // realizamos una validación en caliente consultando la API de ePayco directamente
    const verification = await axios.get(`https://secure.epayco.co/validation/v1/reference/${transactionData.x_ref_payco}`);
    
    if (!verification.data || !verification.data.success || !verification.data.data) {
      return res.status(400).json({ success: false, message: 'Webhook fallido - No verificado con ePayco' });
    }

    const verifiedData = verification.data.data;

    // Procesar la transacción verificada
    const result = await processTransactionStatus(verifiedData);

    if (result.success) {
      // ePayco espera un código HTTP 200 de confirmación
      res.status(200).send('OK');
    } else {
      res.status(400).send('Webhook no pudo ser procesado');
    }
  } catch (error) {
    console.error('Error en Webhook de ePayco:', error);
    res.status(500).send('Error interno del servidor en Webhook');
  }
});

// @desc    Obtener historial de pagos del usuario autenticado
// @route   GET /api/payments/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Error al consultar historial de pagos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al consultar historial de pagos' });
  }
});

module.exports = router;
