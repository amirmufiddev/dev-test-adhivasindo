const authService = require('./auth.service');
const { successResponse } = require('../../utils/response');

class AuthController {
  async login(req, res) {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    return successResponse(res, result, 'Login berhasil');
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    return successResponse(res, result, 'Token diperbarui');
  }

  async logout(req, res) {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return successResponse(res, null, 'Logout berhasil');
  }
}

module.exports = new AuthController();
