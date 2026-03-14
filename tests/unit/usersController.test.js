jest.mock('../../src/modules/users/users.service', () => ({
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

const userController = require('../../src/modules/users/users.controller');
const userService = require('../../src/modules/users/users.service');

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { query: {}, params: {}, body: {}, user: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
  });

  describe('getAllUsers', () => {
    it('should get all users with pagination', async () => {
      const mockResult = {
        data: [{ id: 1, username: 'admin' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      userService.getAllUsers.mockResolvedValue(mockResult);
      req.query = { page: '1', limit: '10', search: '' };

      await userController.getAllUsers(req, res);

      expect(userService.getAllUsers).toHaveBeenCalledWith({ page: 1, limit: 10, search: '' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: 'Data user berhasil diambil',
      });
    });

    it('should use default pagination values', async () => {
      const mockResult = {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      userService.getAllUsers.mockResolvedValue(mockResult);

      await userController.getAllUsers(req, res);

      expect(userService.getAllUsers).toHaveBeenCalledWith({ page: 1, limit: 10, search: '' });
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const mockUser = { id: 1, username: 'admin', email: 'admin@example.com' };
      userService.getUserById.mockResolvedValue(mockUser);
      req.params = { id: '1' };

      await userController.getUserById(req, res);

      expect(userService.getUserById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
        message: 'User ditemukan',
      });
    });
  });

  describe('createUser', () => {
    it('should create new user', async () => {
      const userData = { username: 'newuser', email: 'new@example.com', password: 'pass123', full_name: 'New User', role: 'user' };
      const mockUser = { id: 3, ...userData };
      userService.createUser.mockResolvedValue(mockUser);
      req.body = userData;

      await userController.createUser(req, res);

      expect(userService.createUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
        message: 'User berhasil dibuat',
      });
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const updateData = { full_name: 'Updated Name' };
      const mockUser = { id: 1, username: 'admin', full_name: 'Updated Name' };
      userService.updateUser.mockResolvedValue(mockUser);
      req.params = { id: '1' };
      req.body = updateData;
      req.user = { id: 1, role: 'admin' };

      await userController.updateUser(req, res);

      expect(userService.updateUser).toHaveBeenCalledWith('1', updateData, req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
        message: 'User berhasil diupdate',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      userService.deleteUser.mockResolvedValue(true);
      req.params = { id: '1' };

      await userController.deleteUser(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'User berhasil dihapus',
      });
    });
  });
});
