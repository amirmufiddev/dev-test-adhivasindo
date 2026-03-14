const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error('Error:', { message: err.message, stack: err.stack, url: req.url, method: req.method });

  if (err.code === '23505') {
    return res.status(409).json({ success: false, data: null, message: 'Data sudah ada' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ success: false, data: null, message: 'Data terkait tidak ditemukan' });
  }
  if (err.isJoi) {
    return res.status(400).json({ success: false, data: null, message: err.details[0].message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({ success: false, data: null, message });
};

module.exports = errorHandler;
