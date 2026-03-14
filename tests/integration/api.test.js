const request = require('supertest');
const app = require('../../src/app');

jest.mock('../../src/config/database', () => {
  const mockDb = jest.fn(() => mockDb);
  mockDb.raw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.first = jest.fn();
  mockDb.insert = jest.fn(() => mockDb);
  mockDb.returning = jest.fn(() => mockDb);
  mockDb.select = jest.fn(() => mockDb);
  mockDb.count = jest.fn(() => mockDb);
  mockDb.limit = jest.fn(() => mockDb);
  mockDb.offset = jest.fn(() => mockDb);
  mockDb.clone = jest.fn(() => mockDb);
  mockDb.update = jest.fn(() => mockDb);
  mockDb.del = jest.fn(() => mockDb);
  mockDb.schema = { createTable: jest.fn(), dropTableIfExists: jest.fn() };
  return mockDb;
});

jest.mock('../../src/modules/auth/auth.repository', () => ({
  findUserByUsername: jest.fn(),
  saveRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn(),
}));

jest.mock('../../src/modules/users/users.repository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const authRepository = require('../../src/modules/auth/auth.repository');
const userRepository = require('../../src/modules/users/users.repository');
const authService = require('../../src/modules/auth/auth.service');

describe('Authentication Endpoints', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      authRepository.findUserByUsername.mockResolvedValue({
        id: 1, username: 'admin', password: hashedPassword,
        email: 'admin@example.com', full_name: 'Administrator', role: 'admin', is_active: true,
      });
      authRepository.saveRefreshToken.mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should fail with wrong password', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      authRepository.findUserByUsername.mockResolvedValue({
        id: 1, username: 'admin', password: hashedPassword, is_active: true,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail when user not found', async () => {
      authRepository.findUserByUsername.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const payload = { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' };
      const refreshToken = authService.generateRefreshToken(payload);
      authRepository.findRefreshToken.mockResolvedValue({ id: 1, token: refreshToken, user_id: 1 });

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const payload = { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' };
      const token = authService.generateAccessToken(payload);
      const refreshToken = authService.generateRefreshToken(payload);
      authRepository.deleteRefreshToken.mockResolvedValue(1);

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'some-token' });

      expect(res.statusCode).toBe(401);
    });
  });
});

describe('User Endpoints', () => {
  let adminToken;

  beforeEach(() => {
    jest.clearAllMocks();
    adminToken = authService.generateAccessToken({ id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' });
  });

  describe('GET /api/users', () => {
    it('should get all users as admin', async () => {
      userRepository.findAll.mockResolvedValue({
        data: [{ id: 1, username: 'admin', email: 'admin@example.com', full_name: 'Administrator', role: 'admin' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(401);
    });

    it('should fail as non-admin user', async () => {
      const userToken = authService.generateAccessToken({ id: 2, username: 'user01', email: 'user01@example.com', role: 'user' });
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('POST /api/users', () => {
    it('should create user as admin', async () => {
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ id: 3, username: 'newuser', email: 'new@example.com', full_name: 'New User', role: 'user' });

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'newuser', password: 'password123', email: 'new@example.com', full_name: 'New User', role: 'user' });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('newuser');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, username: 'admin', email: 'admin@example.com', full_name: 'Administrator', role: 'admin' });

      const res = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.id).toBe(1);
    });

    it('should return 404 when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/users/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user as admin', async () => {
      userRepository.findById.mockResolvedValue({ id: 2, username: 'user01', email: 'user01@example.com' });
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.update.mockResolvedValue({ id: 2, username: 'user01', email: 'user01@example.com', full_name: 'Updated User' });

      const res = await request(app)
        .put('/api/users/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ full_name: 'Updated User' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail when non-admin updates another user', async () => {
      const userToken = authService.generateAccessToken({ id: 2, username: 'user01', email: 'user01@example.com', role: 'user' });
      userRepository.findById.mockResolvedValue({ id: 3, username: 'user02' });

      const res = await request(app)
        .put('/api/users/3')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ full_name: 'Hacked' });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user as admin', async () => {
      userRepository.findById.mockResolvedValue({ id: 2, username: 'user01' });
      userRepository.delete.mockResolvedValue(1);

      const res = await request(app)
        .delete('/api/users/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fail as non-admin', async () => {
      const userToken = authService.generateAccessToken({ id: 2, username: 'user01', email: 'user01@example.com', role: 'user' });

      const res = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});

describe('Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
