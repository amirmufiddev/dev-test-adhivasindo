const { AuthRepository } = require('../../src/modules/auth/auth.repository');

describe('AuthRepository', () => {
  let authRepository;
  let mockDb;

  beforeEach(() => {
    mockDb = jest.fn(() => mockDb);
    mockDb.where = jest.fn(() => mockDb);
    mockDb.first = jest.fn();
    mockDb.insert = jest.fn(() => mockDb);
    mockDb.returning = jest.fn();
    mockDb.del = jest.fn();

    authRepository = new AuthRepository(mockDb);
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token successfully', async () => {
      const tokenData = { user_id: 1, token: 'test-token', expires_at: new Date() };
      mockDb.returning.mockResolvedValue([{ id: 1, ...tokenData }]);

      const result = await authRepository.saveRefreshToken(tokenData);

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(mockDb.insert).toHaveBeenCalledWith(tokenData);
      expect(result).toEqual({ id: 1, ...tokenData });
    });
  });

  describe('findRefreshToken', () => {
    it('should find valid refresh token', async () => {
      const token = 'valid-token';
      const mockToken = { id: 1, token, user_id: 1, expires_at: new Date(Date.now() + 86400000) };
      mockDb.first.mockResolvedValue(mockToken);

      const result = await authRepository.findRefreshToken(token);

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(mockDb.where).toHaveBeenCalledWith({ token });
      expect(result).toEqual(mockToken);
    });

    it('should return null for expired token', async () => {
      mockDb.first.mockResolvedValue(null);

      const result = await authRepository.findRefreshToken('expired-token');

      expect(result).toBeNull();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token', async () => {
      const token = 'token-to-delete';
      mockDb.del.mockResolvedValue(1);

      const result = await authRepository.deleteRefreshToken(token);

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(mockDb.where).toHaveBeenCalledWith({ token });
      expect(mockDb.del).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('deleteUserRefreshTokens', () => {
    it('should delete all user refresh tokens', async () => {
      const userId = 1;
      mockDb.del.mockResolvedValue(3);

      const result = await authRepository.deleteUserRefreshTokens(userId);

      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
      expect(mockDb.where).toHaveBeenCalledWith({ user_id: userId });
      expect(result).toBe(3);
    });
  });

  describe('findUserByUsername', () => {
    it('should find user by username', async () => {
      const username = 'admin';
      const mockUser = { id: 1, username, email: 'admin@example.com' };
      mockDb.first.mockResolvedValue(mockUser);

      const result = await authRepository.findUserByUsername(username);

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockDb.where).toHaveBeenCalledWith({ username });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockDb.first.mockResolvedValue(null);

      const result = await authRepository.findUserByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });
});
