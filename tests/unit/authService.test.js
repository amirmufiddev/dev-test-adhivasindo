const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../src/modules/auth/auth.repository', () => ({
  findUserByUsername: jest.fn(),
  saveRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
}));

const authService = require('../../src/modules/auth/auth.service');
const authRepository = require('../../src/modules/auth/auth.repository');

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      authRepository.findUserByUsername.mockResolvedValue({
        id: 1, username: 'admin', password: hashedPassword,
        email: 'admin@example.com', full_name: 'Administrator', role: 'admin', is_active: true,
      });
      authRepository.saveRefreshToken.mockResolvedValue({});

      const result = await authService.login('admin', 'admin123');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.username).toBe('admin');
    });

    it('should throw 401 when user not found', async () => {
      authRepository.findUserByUsername.mockResolvedValue(null);
      await expect(authService.login('nonexistent', 'password')).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 when password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      authRepository.findUserByUsername.mockResolvedValue({
        id: 1, username: 'admin', password: hashedPassword, is_active: true,
      });
      await expect(authService.login('admin', 'wrongpassword')).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 403 when user is inactive', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      authRepository.findUserByUsername.mockResolvedValue({
        id: 1, username: 'admin', password: hashedPassword, is_active: false,
      });
      await expect(authService.login('admin', 'admin123')).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { id: 1, username: 'admin', role: 'admin' };
      const token = authService.generateAccessToken(payload);
      expect(typeof token).toBe('string');
      const decoded = jwt.decode(token);
      expect(decoded.username).toBe('admin');
    });
  });

  describe('refreshToken', () => {
    it('should throw 401 when refresh token is invalid', async () => {
      await expect(authService.refreshToken('invalid-token')).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 when refresh token not found in DB', async () => {
      const payload = { id: 1, username: 'admin', role: 'admin' };
      const token = authService.generateRefreshToken(payload);
      authRepository.findRefreshToken.mockResolvedValue(null);
      await expect(authService.refreshToken(token)).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should return new accessToken on success', async () => {
      const payload = { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' };
      const token = authService.generateRefreshToken(payload);
      authRepository.findRefreshToken.mockResolvedValue({ id: 1, token, user_id: 1 });
      const result = await authService.refreshToken(token);
      expect(result).toHaveProperty('accessToken');
    });
  });
});
