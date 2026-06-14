const nodemailer = require('nodemailer');

// Cola en memoria para almacenar correos simulados en desarrollo (últimos 20)
let sentMailLogs = [];

/**
 * Obtener logs de correos enviados en memoria (Desarrollo)
 */
const getMailLogs = () => {
  return sentMailLogs;
};

/**
 * Limpiar cola de correos
 */
const clearMailLogs = () => {
  sentMailLogs = [];
  return true;
};

/**
 * Crear transportador de nodemailer si las variables están configuradas en .env
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Number(port) === 465, // true para 465, false para otros puertos
      auth: { user, pass }
    });
  }
  return null;
};

/**
 * Imprimir un correo de forma espectacular en la consola del servidor (ASCII & Colores)
 */
const logMockEmailToConsole = (to, subject, html) => {
  const divider = '='.repeat(80);
  const title = ` SIMULACIÓN DE CORREO DISPACHADO (DESARROLLO) `;
  const padLength = Math.max(0, Math.floor((80 - title.length) / 2));
  const border = '='.repeat(padLength) + title + '='.repeat(80 - title.length - padLength);

  console.log('\n\x1b[36m' + border + '\x1b[0m');
  console.log(`\x1b[1mPARA:\x1b[0m       ${to}`);
  console.log(`\x1b[1mASUNTO:\x1b[0m    ${subject}`);
  console.log(`\x1b[1mFECHA:\x1b[0m     ${new Date().toLocaleString()}`);
  console.log('\x1b[36m' + divider + '\x1b[0m');
  
  // Limpiar un poco el HTML para mostrar en consola de forma más legible
  const plainTextSummary = html
    .replace(/<style([\s\S]*?)<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300);

  console.log(`\x1b[2m[Vista previa de texto plano]:\x1b[0m\n${plainTextSummary}...`);
  console.log('\x1b[36m' + divider + '\x1b[0m');
  console.log('\x1b[33mNota: El HTML completo ha sido guardado en la cola en memoria para previsualizarlo en el Dashboard.\x1b[0m');
  console.log('\x1b[36m' + '='.repeat(80) + '\x1b[0m\n');
};

/**
 * Enviar un correo electrónico genérico (con soporte para producción y desarrollo)
 */
const sendMail = async ({ to, subject, html, type = 'generic' }) => {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || '"QRify Notifications" <noreply@qrify.com>';

  // Registrar en la cola en memoria para el Dashboard
  const newLog = {
    id: 'mail_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
    to,
    subject,
    html,
    type,
    timestamp: new Date().toISOString()
  };
  sentMailLogs.unshift(newLog);
  if (sentMailLogs.length > 20) {
    sentMailLogs.pop(); // Mantener solo los últimos 20
  }

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html
      });
      console.log(`[EmailService] Correo real enviado exitosamente a ${to}. ID: ${info.messageId}`);
      return { success: true, mode: 'production', messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService] Error al enviar correo real a ${to}:`, err.message);
      // Fallback a simulación si falla el SMTP real
      logMockEmailToConsole(to, subject, html);
      return { success: true, mode: 'fallback_development', error: err.message };
    }
  } else {
    // Modo simulación local
    logMockEmailToConsole(to, subject, html);
    return { success: true, mode: 'development' };
  }
};

/**
 * Plantilla HTML Base para correos de QRify
 */
const getBaseHtmlTemplate = (title, contentHtml) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 35px 30px;
      text-align: center;
      color: #ffffff;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.05em;
      margin-bottom: 5px;
    }
    .logo span {
      color: #a5b4fc;
    }
    .header h2 {
      margin: 10px 0 0 0;
      font-size: 20px;
      font-weight: 700;
    }
    .body {
      padding: 40px 30px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 25px 30px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      font-weight: 700;
      font-size: 14px;
      border-radius: 12px;
      margin: 25px 0;
      box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
    }
    .btn:hover {
      opacity: 0.95;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }
    p {
      line-height: 1.6;
      margin: 0 0 15px 0;
      font-size: 14px;
    }
    h3 {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 15px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">QR<span>ify</span></div>
        <h2>${title}</h2>
      </div>
      <div class="body">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>&copy; 2026 QRify. Todos los derechos reservados.</p>
        <p>¿Tienes dudas? Escríbenos a <a href="mailto:soporte@qrify.com">soporte@qrify.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Plantilla HTML de Advertencia de Expiración de Suscripción
 */
const getExpirationWarningHtml = (userName, expiresDateStr, daysLeft) => {
  const renewUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing`;
  
  return getBaseHtmlTemplate('Tu Plan Premium está por vencer', `
    <h3>Hola, ${userName} 👋</h3>
    <p>Te escribimos de parte del equipo de <strong>QRify</strong> para recordarte que tu suscripción Premium está programada para vencer en muy poco tiempo:</p>
    
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 20px; margin: 25px 0; text-align: center;">
      <span style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #b45309; background-color: #fef3c7; padding: 4px 10px; border-radius: 9999px;">
        Quedan ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}
      </span>
      <p style="font-size: 20px; font-weight: 800; color: #78350f; margin: 15px 0 5px 0;">Vence el: ${new Date(expiresDateStr).toLocaleDateString()}</p>
      <p style="font-size: 12px; color: #92400e; margin: 0;">Evita interrupciones en tus códigos QR y campañas físicas.</p>
    </div>

    <p>Si tu suscripción vence, perderás el acceso a los beneficios exclusivos que tu negocio necesita:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; font-weight: 700; color: #dc2626;">❌ Pérdida de redirecciones dinámicas</td>
        <td style="padding: 10px 0; text-align: right; color: #64748b;">Tus QR dinámicos dejarán de redirigir temporalmente</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; font-weight: 700; color: #dc2626;">❌ Sin acceso a analíticas</td>
        <td style="padding: 10px 0; text-align: right; color: #64748b;">No verás gráficos de escaneos, dispositivos ni países</td>
      </tr>
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; font-weight: 700; color: #dc2626;">❌ Marca de agua obligatoria</td>
        <td style="padding: 10px 0; text-align: right; color: #64748b;">Se volverá a añadir el logo de QRify a tus descargas</td>
      </tr>
    </table>

    <p><strong>¡Buenas noticias!</strong> Hemos reducido significativamente el precio de nuestro plan Premium para que sea más accesible que nunca. Puedes renovar ahora mismo por solo:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <div style="font-size: 32px; font-weight: 900; color: #0f172a;">$2.99 USD <span style="font-size: 14px; font-weight: 500; color: #64748b;">/ mes</span></div>
      <div style="font-size: 14px; font-weight: 700; color: #4f46e5; margin-top: 2px;">Solo ~$11,900 COP</div>
      
      <a href="${renewUrl}" class="btn">Renovar Plan Premium Ahora</a>
    </div>

    <p>El proceso de pago es ultra seguro y rápido mediante PSE o tarjeta de crédito a través de <strong>ePayco</strong>.</p>
    <p>Agradecemos enormemente tu confianza en QRify para impulsar tu negocio.</p>
  `);
};

/**
 * Plantilla HTML para la Campaña Promocional Premium
 */
const getPremiumPromotionHtml = (userName) => {
  const pricingUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing`;
  
  return getBaseHtmlTemplate('¡Desbloquea el poder de QRify Premium!', `
    <h3>Hola, ${userName} 👋</h3>
    <p>Sabemos que estás utilizando nuestro plan gratuito de <strong>QRify</strong> para tus códigos QR, ¡y queremos ayudarte a llevar tu marca física y digital al siguiente nivel!</p>
    
    <p>Diseñado especialmente para restaurantes, comercios locales, oficinas y marcas que quieren dejar una impresión inolvidable, el plan **QRify Premium** es la herramienta definitiva.</p>
    
    <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 16px; padding: 25px; margin: 25px 0;">
      <h4 style="margin: 0 0 15px 0; color: #6d28d9; font-size: 16px; font-weight: 800;">Mira todo lo que desbloqueas al pasarte a Premium:</h4>
      
      <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.8; color: #4c1d95;">
        <li>🚀 <strong>Códigos QR Dinámicos editables</strong>: Edita la URL de destino de tus códigos cuando quieras, ¡sin tener que volver a imprimirlos! Ideal para menús y enlaces de redes.</li>
        <li>🎨 <strong>Logotipos Personalizados</strong>: Inserta el logo de tu empresa en el centro del código QR de forma limpia y profesional.</li>
        <li>📊 <strong>Estadísticas Avanzadas en vivo</strong>: Rastrea el volumen de escaneos, los países de origen, y los sistemas operativos de tus clientes.</li>
        <li>✨ <strong>Descargas Limpias de Alta Definición</strong>: Exporta tus QRs sin marcas de agua publicitarias de QRify, listos para tu material publicitario.</li>
        <li>📂 <strong>Historial Ilimitado</strong>: Almacena y gestiona todos los QRs que necesites sin preocuparte por el límite de 5 elementos.</li>
      </ul>
    </div>

    <h3 style="text-align: center; color: #4f46e5; margin: 30px 0 10px 0;">¡Una Tarifa Ultra Económica e Irresistible!</h3>
    <p style="text-align: center; margin-bottom: 25px;">Para hacer a QRify más accesible y competitivo, hemos reducido la suscripción mensual a un precio récord:</p>
    
    <div style="text-align: center; border: 2px dashed #6366f1; border-radius: 20px; padding: 25px; background-color: #ffffff; max-width: 320px; margin: 0 auto 30px auto;">
      <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #ffffff; background-color: #10b981; padding: 3px 8px; border-radius: 9999px;">
        Precio de Lanzamiento
      </span>
      <div style="font-size: 38px; font-weight: 900; color: #0f172a; margin-top: 10px;">$2.99 USD <span style="font-size: 14px; font-weight: 500; color: #64748b;">/ mes</span></div>
      <div style="font-size: 15px; font-weight: 700; color: #6366f1; margin: 5px 0 15px 0;">¡Solo ~$11,900 COP!</div>
      <p style="font-size: 11px; color: #64748b; margin: 0; line-height: 1.4;">Cancela o actualiza en cualquier momento desde tu panel.</p>
    </div>

    <div style="text-align: center;">
      <a href="${pricingUrl}" class="btn">Obtener Mi Cuenta Premium Ahora</a>
    </div>

    <p style="margin-top: 25px; font-size: 13px; color: #64748b; text-align: center;">Activación al instante: Tu cuenta se convertirá en Premium de forma automática en cuanto se procese el pago 100% seguro con ePayco.</p>
  `);
};

/**
 * Servicio Público Exportado
 */
module.exports = {
  sendMail,
  getMailLogs,
  clearMailLogs,
  getExpirationWarningHtml,
  getPremiumPromotionHtml
};
