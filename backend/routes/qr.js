const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const { protect } = require('../middleware/auth');

// Función auxiliar para generar un shortId único
const generateShortId = async () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shortId;
  let exists = true;
  
  while (exists) {
    shortId = '';
    for (let i = 0; i < 6; i++) {
      shortId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const check = await QRCode.findOne({ shortId });
    if (!check) exists = false;
  }
  return shortId;
};

// @desc    Generar un nuevo código QR (Estático o Dinámico)
// @route   POST /api/qr/generate
// @access  Private
router.post('/generate', protect, async (req, res) => {
  const { name, type, content, isDynamic, design } = req.body;

  try {
    if (!name || !type || !content) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    const isPremium = req.user.role === 'premium';

    // 1. Limitar historial para usuarios Free
    if (!isPremium) {
      const qrCount = await QRCode.countDocuments({ user: req.user._id });
      if (qrCount >= 5) {
        return res.status(403).json({
          success: false,
          message: 'Límite de historial alcanzado (5 QRs). ¡Actualiza a Premium para guardar códigos QR ilimitados!',
        });
      }
    }

    // 2. Bloquear QR dinámico a usuarios Free
    if (isDynamic && !isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Los códigos QR dinámicos son una función exclusiva de QRify Premium.',
      });
    }

    // 3. Bloquear logos personalizados a usuarios Free
    if (design && design.logo && !isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Incrustar logos personalizados es una función exclusiva de QRify Premium.',
      });
    }

    // Crear datos del QR
    const qrData = {
      user: req.user._id,
      name,
      type,
      content,
      isDynamic: !!isDynamic,
      design: {
        fgColor: design?.fgColor || '#000000',
        bgColor: design?.bgColor || '#ffffff',
        size: design?.size || 300,
        logo: isPremium ? design?.logo : null, // Doble validación
      },
    };

    // Si es dinámico, asignarle un shortId único
    if (isDynamic) {
      qrData.shortId = await generateShortId();
    }

    const qrCode = await QRCode.create(qrData);

    res.status(201).json({
      success: true,
      qrCode,
    });
  } catch (error) {
    console.error('Error al generar código QR:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al generar el código QR' });
  }
});

// @desc    Obtener el historial de QRs del usuario autenticado
// @route   GET /api/qr/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    // Retorna todos los QRs del usuario ordenados por fecha de creación descendente
    const qrCodes = await QRCode.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: qrCodes.length,
      qrCodes,
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al obtener el historial' });
  }
});

// @desc    Obtener el detalle de un QR específico (e.g. para ver analíticas)
// @route   GET /api/qr/details/:id
// @access  Private
router.get('/details/:id', protect, async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'Código QR no encontrado' });
    }

    // Validar propietario del QR
    if (qrCode.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'No autorizado para ver este código QR' });
    }

    res.json({
      success: true,
      qrCode,
    });
  } catch (error) {
    console.error('Error al consultar detalle del QR:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al consultar el detalle' });
  }
});

// @desc    Actualizar la URL de destino de un QR dinámico
// @route   PUT /api/qr/update/:id
// @access  Private
router.put('/update/:id', protect, async (req, res) => {
  const { content, name } = req.body;

  try {
    let qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'Código QR no encontrado' });
    }

    // Validar propietario
    if (qrCode.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    // Validar si es dinámico para permitir cambiar el contenido
    if (content && !qrCode.isDynamic) {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar el contenido de un código QR estático. ¡Utiliza códigos QR dinámicos para editar enlaces en cualquier momento!',
      });
    }

    // Actualizar campos
    if (name) qrCode.name = name;
    if (content) qrCode.content = content;

    await qrCode.save();

    res.json({
      success: true,
      qrCode,
    });
  } catch (error) {
    console.error('Error al actualizar código QR:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al actualizar el código' });
  }
});

// @desc    Eliminar un código QR
// @route   DELETE /api/qr/delete/:id
// @access  Private
router.delete('/delete/:id', protect, async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);

    if (!qrCode) {
      return res.status(404).json({ success: false, message: 'Código QR no encontrado' });
    }

    // Validar propietario
    if (qrCode.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    // Eliminar el QR (esto disparará o no cascada. Para simplificar, eliminamos sus escaneos primero si es dinámico)
    const Scan = require('../models/Scan');
    await Scan.deleteMany({ qrCode: qrCode._id });
    
    // Usar deleteOne en lugar de remove (remove está deprecado en Mongoose 6+)
    await QRCode.deleteOne({ _id: qrCode._id });

    res.json({
      success: true,
      message: 'Código QR y sus estadísticas de escaneo eliminados correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar código QR:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al eliminar el código' });
  }
});

module.exports = router;
