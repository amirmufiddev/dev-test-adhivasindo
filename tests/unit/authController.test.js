jest.mock('../../src/modules/auth/auth.service', () => ({
  login: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
}));

const authController = require('../../src/modules/auth/auth.controller');
const authService = require('../../src/modules/auth/auth.service');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
      };
      authService.login.mockResolvedValue(mockResult);
      req.body = { username: 'admin', password: 'admin123' };

      await authController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith('admin', 'admin123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Login berhasil',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResult = { accessToken: 'new-access-token' };
      authService.refreshToken.mockResolvedValue(mockResult);
      req.body = { refreshToken: 'valid-refresh-token' };

      await authController.refreshToken(req, res);

      expect(authService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Token diperbarui',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      authService.logout.mockResolvedValue(true);
      req.body = { refreshToken: 'token-to-logout' };

      await authController.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith('token-to-logout');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Logout berhasil',
      });
    });
  });
});
