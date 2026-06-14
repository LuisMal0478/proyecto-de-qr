const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener el token de la cabecera
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123_qrify');

      // Buscar el usuario y añadirlo a la petición
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
      }

      next();
    } catch (error) {
      console.error('Error de autenticación por token:', error);
      res.status(401).json({ success: false, message: 'No autorizado, token fallido' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'No autorizado, no hay token' });
  }
};

module.exports = { protect };
