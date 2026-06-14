const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generar Token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_123_qrify', {
    expiresIn: '30d',
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Por favor complete todos los campos' });
    }

    // Verificar si el usuario existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe con este correo electrónico' });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al registrar' });
  }
});

// @desc    Iniciar sesión de usuario
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Por favor ingrese correo y contraseña' });
    }

    // Buscar usuario y seleccionar contraseña explícitamente
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al iniciar sesión' });
  }
});

// @desc    Obtener datos del usuario autenticado
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
      });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al consultar perfil de usuario' });
  }
});

// Auxiliar para decodificar JWT de Google de forma nativa
const decodeGoogleToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (error) {
    console.error('Error al decodificar token de Google:', error);
    return null;
  }
};

// @desc    Iniciar sesión o registrarse con Google
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  const { credential, mockUser } = req.body;

  try {
    let email, name;

    if (credential) {
      const decoded = decodeGoogleToken(credential);
      if (!decoded) {
        return res.status(400).json({ success: false, message: 'Token de Google inválido' });
      }
      email = decoded.email;
      name = decoded.name;
    } else if (mockUser) {
      email = mockUser.email;
      name = mockUser.name;
    } else {
      return res.status(400).json({ success: false, message: 'Faltan credenciales de Google' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'No se obtuvo correo desde Google' });
    }

    // Buscar si el usuario existe
    let user = await User.findOne({ email });

    // Si no existe, registrar
    if (!user) {
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
      });
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error en autenticación de Google:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor al autenticar con Google' });
  }
});

module.exports = router;
