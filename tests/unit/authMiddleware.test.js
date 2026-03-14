const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin } = require('../../src/middlewares/authMiddleware');
const { JWT_SECRET } = require('../../src/config/jwt');

describe('AuthMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, user: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const payload = { id: 1, username: 'admin', role: 'admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      req.headers['authorization'] = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.username).toBe('admin');
    });

    it('should fail when no token provided', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        data: null,
        message: 'Access token diperlukan',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with invalid token', () => {
      req.headers['authorization'] = 'Bearer invalid-token';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        data: null,
        message: 'Token tidak valid atau expired',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail with expired token', () => {
      const payload = { id: 1, username: 'admin', role: 'admin' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });
      req.headers['authorization'] = `Bearer ${token}`;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin user', () => {
      req.user = { id: 1, username: 'admin', role: 'admin' };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny non-admin user', () => {
      req.user = { id: 2, username: 'user01', role: 'user' };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        data: null,
        message: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
