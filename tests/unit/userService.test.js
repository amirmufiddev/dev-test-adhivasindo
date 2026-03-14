jest.mock('../../src/modules/users/users.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

const userService = require('../../src/modules/users/users.service');
const userRepository = require('../../src/modules/users/users.repository');

describe('UserService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const mockResult = { data: [{ id: 1, username: 'admin' }], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } };
      userRepository.findAll.mockResolvedValue(mockResult);
      const result = await userService.getAllUsers({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, username: 'admin' });
      const user = await userService.getUserById(1);
      expect(user.id).toBe(1);
    });

    it('should throw 404 when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);
      await expect(userService.getUserById(999)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ id: 1, username: 'newuser', email: 'new@example.com', full_name: 'New User', role: 'user' });

      const result = await userService.createUser({ username: 'newuser', password: 'password123', email: 'new@example.com', full_name: 'New User', role: 'user' });
      expect(result.username).toBe('newuser');
    });

    it('should throw 409 when username already exists', async () => {
      userRepository.findByUsername.mockResolvedValue({ id: 1, username: 'admin' });
      await expect(userService.createUser({ username: 'admin', password: 'pass', email: 'test@test.com', full_name: 'Test' }))
        .rejects.toMatchObject({ statusCode: 409 });
    });

    it('should throw 409 when email already exists', async () => {
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue({ id: 2, email: 'existing@example.com' });
      await expect(userService.createUser({ username: 'newuser', password: 'pass', email: 'existing@example.com', full_name: 'Test' }))
        .rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const existingUser = { id: 1, username: 'admin', email: 'admin@example.com' };
      const updateData = { full_name: 'Updated Admin' };
      const updatedUser = { ...existingUser, full_name: 'Updated Admin' };

      userRepository.findById.mockResolvedValue(existingUser);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, updateData, { id: 1, role: 'admin' });

      expect(result).toEqual(updatedUser);
    });

    it('should update user with password hash', async () => {
      const existingUser = { id: 1, username: 'admin', email: 'admin@example.com' };
      const updateData = { password: 'newpassword123' };
      const updatedUser = { ...existingUser };

      userRepository.findById.mockResolvedValue(existingUser);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, updateData, { id: 1, role: 'admin' });

      expect(userRepository.update).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should fail when updating email to existing email', async () => {
      const existingUser = { id: 1, username: 'admin', email: 'admin@example.com' };
      const updateData = { email: 'user01@example.com' };

      userRepository.findById.mockResolvedValue(existingUser);
      userRepository.findByEmail.mockResolvedValue({ id: 2, email: 'user01@example.com' });

      await expect(userService.updateUser(1, updateData, { id: 1, role: 'admin' }))
        .rejects.toThrow('Email sudah digunakan');
    });

    it('should fail when non-admin updates another user', async () => {
      const existingUser = { id: 2, username: 'user01' };
      userRepository.findById.mockResolvedValue(existingUser);

      await expect(userService.updateUser(2, { full_name: 'Hacked' }, { id: 1, role: 'user' }))
        .rejects.toThrow('Akses ditolak');
    });

    it('should allow updating email to same email', async () => {
      const existingUser = { id: 1, username: 'admin', email: 'admin@example.com' };
      const updateData = { email: 'admin@example.com', full_name: 'Updated' };
      const updatedUser = { ...existingUser, full_name: 'Updated' };

      userRepository.findById.mockResolvedValue(existingUser);
      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, updateData, { id: 1, role: 'admin' });

      expect(result).toEqual(updatedUser);
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should throw 404 when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);
      await expect(userService.updateUser(999, { full_name: 'Test' }, { id: 1, role: 'admin' }))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, username: 'user01' });
      userRepository.delete.mockResolvedValue(1);
      const result = await userService.deleteUser(1);
      expect(result).toBe(true);
    });

    it('should throw 404 when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);
      await expect(userService.deleteUser(999)).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
