const userRepository = require('../../src/modules/users/users.repository');

jest.mock('../../src/config/database', () => {
  const mockDb = jest.fn(() => mockDb);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.first = jest.fn();
  mockDb.insert = jest.fn(() => mockDb);
  mockDb.returning = jest.fn();
  mockDb.update = jest.fn(() => mockDb);
  mockDb.del = jest.fn();
  mockDb.select = jest.fn(() => mockDb);
  mockDb.count = jest.fn(() => mockDb);
  mockDb.limit = jest.fn(() => mockDb);
  mockDb.offset = jest.fn(() => mockDb);
  mockDb.clone = jest.fn(() => mockDb);
  mockDb.orWhere = jest.fn(() => mockDb);
  return mockDb;
});

const db = require('../../src/config/database');

describe('UserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [{ id: 1, username: 'admin' }, { id: 2, username: 'user01' }];
      const mockClone = {
        count: jest.fn(() => mockClone),
        first: jest.fn(),
        limit: jest.fn(() => mockClone),
        offset: jest.fn(),
      };
      db.clone.mockReturnValue(mockClone);
      mockClone.first.mockResolvedValue({ total: 2 });
      mockClone.offset.mockResolvedValue(mockUsers);

      const result = await userRepository.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination).toEqual({ total: 2, page: 1, limit: 10, totalPages: 1 });
    });

    it('should filter by search term', async () => {
      const mockUsers = [{ id: 1, username: 'admin' }];
      const mockClone = {
        count: jest.fn(() => mockClone),
        first: jest.fn(),
        limit: jest.fn(() => mockClone),
        offset: jest.fn(),
        where: jest.fn(function() { return this; }),
        orWhere: jest.fn(function() { return this; }),
      };
      db.clone.mockReturnValue(mockClone);
      db.where.mockImplementation(function() { return this; });
      mockClone.first.mockResolvedValue({ total: 1 });
      mockClone.offset.mockResolvedValue(mockUsers);

      const result = await userRepository.findAll({ page: 1, limit: 10, search: 'admin' });

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const mockUser = { id: 1, username: 'admin', email: 'admin@example.com' };
      db.first.mockResolvedValue(mockUser);

      const result = await userRepository.findById(1);

      expect(db).toHaveBeenCalledWith('users');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = { id: 1, username: 'admin' };
      db.first.mockResolvedValue(mockUser);

      const result = await userRepository.findByUsername('admin');

      expect(db).toHaveBeenCalledWith('users');
      expect(db.where).toHaveBeenCalledWith({ username: 'admin' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = { id: 1, email: 'admin@example.com' };
      db.first.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('admin@example.com');

      expect(db).toHaveBeenCalledWith('users');
      expect(db.where).toHaveBeenCalledWith({ email: 'admin@example.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const userData = { username: 'newuser', email: 'new@example.com', password: 'hashed', full_name: 'New User', role: 'user' };
      const mockUser = { id: 3, ...userData };
      db.returning.mockResolvedValue([mockUser]);

      const result = await userRepository.create(userData);

      expect(db).toHaveBeenCalledWith('users');
      expect(db.insert).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updateData = { full_name: 'Updated Name' };
      const mockUser = { id: 1, username: 'admin', full_name: 'Updated Name' };
      db.returning.mockResolvedValue([mockUser]);

      const result = await userRepository.update(1, updateData);

      expect(db).toHaveBeenCalledWith('users');
      expect(db.where).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUser);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      db.del.mockResolvedValue(1);

      const result = await userRepository.delete(1);

      expect(db).toHaveBeenCalledWith('users');
      expect(db.where).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should find one user by conditions', async () => {
      const mockUser = { id: 1, username: 'admin', email: 'admin@example.com' };
      db.first.mockResolvedValue(mockUser);

      const result = await userRepository.findOne({ email: 'admin@example.com' });

      expect(db).toHaveBeenCalledWith('users');
      expect(db.where).toHaveBeenCalledWith({ email: 'admin@example.com' });
      expect(result).toEqual(mockUser);
    });
  });
});
