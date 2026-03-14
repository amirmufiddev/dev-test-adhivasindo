const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } = require('../../config/jwt');
const authRepository = require('./auth.repository');

class AuthService {
  generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  }

  async login(username, password) {
    const user = await authRepository.findUserByUsername(username);
    if (!user) {
      const err = new Error('Username atau password salah');
      err.statusCode = 401;
      throw err;
    }

    if (!user.is_active) {
      const err = new Error('Akun tidak aktif');
      err.statusCode = 403;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const err = new Error('Username atau password salah');
      err.statusCode = 401;
      throw err;
    }

    const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await authRepository.saveRefreshToken({ user_id: user.id, token: refreshToken, expires_at: expiresAt });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name, role: user.role },
    };
  }

  async refreshToken(refreshToken) {
    let decoded;
    try {
      decoded = this.verifyRefreshToken(refreshToken);
    } catch (err) {
      const error = new Error('Refresh token tidak valid atau expired');
      error.statusCode = 401;
      throw error;
    }

    const tokenRecord = await authRepository.findRefreshToken(refreshToken);
    if (!tokenRecord) {
      const err = new Error('Refresh token tidak ditemukan atau sudah expired');
      err.statusCode = 401;
      throw err;
    }

    const payload = { id: decoded.id, username: decoded.username, email: decoded.email, role: decoded.role };
    const accessToken = this.generateAccessToken(payload);

    return { accessToken };
  }

  async logout(refreshToken) {
    await authRepository.deleteRefreshToken(refreshToken);
    return true;
  }
}

module.exports = new AuthService();
