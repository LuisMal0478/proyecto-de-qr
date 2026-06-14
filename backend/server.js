const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware de CORS dinámico para soportar local y producción
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir peticiones sin origen (como apps móviles o curl)
      if (!origin) return callback(null, true);
      
      // Permitir cualquier localhost, 127.0.0.1 o IPs privadas de red local (desarrollo)
      if (
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') || 
        origin.startsWith('https://localhost:') ||
        origin.startsWith('https://127.0.0.1:') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.startsWith('http://172.') ||
        allowedOrigins.indexOf(origin) !== -1
      ) {
        return callback(null, true);
      }
      
      const msg = 'La política de CORS para este sitio no permite el acceso desde el origen especificado.';
      return callback(new Error(msg), false);
    },
    credentials: true,
  })
);

// Analizador de cuerpo de peticiones
app.use(express.json({ limit: '10mb' })); // Aumentamos límite para soportar logos incrustados en base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas Públicas de Redirección (Deben ir al inicio para máxima prioridad y rutas limpias)
const redirectRoutes = require('./routes/redirect');
app.use('/r', redirectRoutes);

// Rutas de la API
const authRoutes = require('./routes/auth');
const qrRoutes = require('./routes/qr');
const paymentRoutes = require('./routes/payment');
const statsRoutes = require('./routes/stats');
const emailRoutes = require('./routes/email');

app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/emails', emailRoutes);

// Ruta de estado de salud de la API
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor de QRify operando correctamente' });
});

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado en la API:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Ocurrió un error interno en el servidor',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor de QRify corriendo en el puerto ${PORT}`);
});
