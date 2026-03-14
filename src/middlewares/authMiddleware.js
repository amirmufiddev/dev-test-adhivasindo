const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, data: null, message: 'Access token diperlukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, data: null, message: 'Token tidak valid atau expired' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, data: null, message: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin };
