const premiumOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'premium' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Acceso denegado. Esta característica requiere una cuenta Premium.',
    });
  }
};

module.exports = { premiumOnly };
