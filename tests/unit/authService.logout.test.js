jest.mock('../../src/modules/auth/auth.repository', () => ({
  findUserByUsername: jest.fn(),
  saveRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
}));

const authService = require('../../src/modules/auth/auth.service');
const authRepository = require('../../src/modules/auth/auth.repository');

describe('AuthService - logout', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('logout', () => {
    it('should logout successfully', async () => {
      authRepository.deleteRefreshToken.mockResolvedValue(1);

      const result = await authService.logout('refresh-token');

      expect(authRepository.deleteRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(result).toBe(true);
    });

    it('should return true even if token not found', async () => {
      authRepository.deleteRefreshToken.mockResolvedValue(0);

      const result = await authService.logout('non-existent-token');

      expect(result).toBe(true);
    });
  });
});
