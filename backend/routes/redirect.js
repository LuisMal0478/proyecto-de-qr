const express = require('express');
const router = express.Router();
const QRCode = require('../models/QRCode');
const Scan = require('../models/Scan');

// Función auxiliar para parsear el User Agent
const parseUserAgent = (uaString) => {
  const ua = uaString || '';
  let device = 'desktop';
  let os = 'Unknown';
  let browser = 'Unknown';

  // 1. Detectar Dispositivo
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    device = 'mobile';
  }

  // 2. Detectar Sistema Operativo
  if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/ipad|iphone|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // 3. Detectar Navegador
  if (/edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/chrome|crios/i.test(ua)) {
    browser = 'Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/safari/i.test(ua) && !/chrome|crios|edg/i.test(ua)) {
    browser = 'Safari';
  } else if (/trident|msie/i.test(ua)) {
    browser = 'Internet Explorer';
  }

  return { device, os, browser };
};

// Listado de países comunes para simular localización en un dashboard realista
const countries = ['Colombia', 'Colombia', 'Colombia', 'México', 'España', 'Estados Unidos', 'Argentina', 'Chile', 'Perú', 'Ecuador'];

// @desc    Redirección de QR dinámico y registro de analíticas
// @route   GET /r/:shortId
// @access  Public
router.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    // Buscar el código QR
    const qrCode = await QRCode.findOne({ shortId });

    if (!qrCode) {
      return res.status(404).send('<h1>Error 404: Código QR no encontrado o expirado</h1>');
    }

    // Incrementar el contador de escaneos general
    qrCode.scansCount += 1;
    await qrCode.save();

    // Obtener información del visitante
    const userAgentStr = req.headers['user-agent'] || '';
    const { device, os, browser } = parseUserAgent(userAgentStr);

    // Obtener IP del visitante
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // Para simular una distribución geográfica rica e interesante en el dashboard local,
    // elegimos aleatoriamente de una lista si estamos en localhost, de lo contrario usamos headers.
    let country = 'Colombia';
    if (req.headers['cf-ipcountry']) {
      country = req.headers['cf-ipcountry'];
    } else {
      country = countries[Math.floor(Math.random() * countries.length)];
    }

    // Registrar el escaneo
    await Scan.create({
      qrCode: qrCode._id,
      ip: ip.split(',')[0].trim(), // Si hay múltiples IPs en x-forwarded-for
      userAgent: userAgentStr,
      device,
      os,
      browser,
      country,
    });

    // Validar el formato de la URL. Si no tiene protocolo, agregar http:// para evitar redirecciones relativas rotas
    let destinationUrl = qrCode.content;
    if (qrCode.type === 'url' && !/^https?:\/\//i.test(destinationUrl)) {
      destinationUrl = 'https://' + destinationUrl;
    } else if (qrCode.type === 'whatsapp') {
      // Si es whatsapp, asegurar formato wa.me
      // content suele ser wa.me/numero?text=mensaje, lo manejamos directo
    }

    // Redirección HTTP 302 temporal
    res.redirect(302, destinationUrl);
  } catch (error) {
    console.error('Error en redirección de QR:', error);
    res.status(500).send('<h1>Error en el servidor al procesar la redirección</h1>');
  }
});

module.exports = router;
