const successResponse = (res, data, message = 'Berhasil', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, message });
};

const errorResponse = (res, message = 'Terjadi kesalahan', statusCode = 500, data = null) => {
  return res.status(statusCode).json({ success: false, data, message });
};

module.exports = { successResponse, errorResponse };
