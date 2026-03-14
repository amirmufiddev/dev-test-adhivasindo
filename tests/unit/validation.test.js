const { validate, schemas } = require('../../src/middlewares/validation');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, query: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    next = jest.fn();
  });

  describe('validate function', () => {
    it('should pass validation with valid data', () => {
      req.body = { username: 'admin', password: 'admin123' };
      const middleware = validate(schemas.login);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid data', () => {
      req.body = { username: 'ab', password: '123' };
      const middleware = validate(schemas.login);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should strip unknown fields', () => {
      req.body = { username: 'admin', password: 'admin123', extraField: 'should be removed' };
      const middleware = validate(schemas.login);

      middleware(req, res, next);

      expect(req.body.extraField).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should validate query params when target is query', () => {
      req.query = { name: 'Test', page: '1', limit: '10' };
      const middleware = validate(schemas.searchQuery, 'query');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('login schema', () => {
    it('should validate correct login data', () => {
      const { error } = schemas.login.validate({ username: 'admin', password: 'admin123' });
      expect(error).toBeUndefined();
    });

    it('should reject short username', () => {
      const { error } = schemas.login.validate({ username: 'ab', password: 'admin123' });
      expect(error).toBeDefined();
    });

    it('should reject short password', () => {
      const { error } = schemas.login.validate({ username: 'admin', password: '123' });
      expect(error).toBeDefined();
    });
  });

  describe('createUser schema', () => {
    it('should validate correct user data', () => {
      const userData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        full_name: 'New User',
        role: 'user',
      };
      const { error } = schemas.createUser.validate(userData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const userData = {
        username: 'newuser',
        password: 'password123',
        email: 'invalid-email',
        full_name: 'New User',
      };
      const { error } = schemas.createUser.validate(userData);
      expect(error).toBeDefined();
    });

    it('should use default role', () => {
      const userData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        full_name: 'New User',
      };
      const { value } = schemas.createUser.validate(userData);
      expect(value.role).toBe('user');
    });
  });

  describe('updateUser schema', () => {
    it('should validate update data', () => {
      const { error } = schemas.updateUser.validate({ full_name: 'Updated Name' });
      expect(error).toBeUndefined();
    });

    it('should require at least one field', () => {
      const { error } = schemas.updateUser.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('refreshToken schema', () => {
    it('should validate refresh token', () => {
      const { error } = schemas.refreshToken.validate({ refreshToken: 'valid-token' });
      expect(error).toBeUndefined();
    });

    it('should reject missing refresh token', () => {
      const { error } = schemas.refreshToken.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('searchQuery schema', () => {
    it('should validate search query', () => {
      const { error } = schemas.searchQuery.validate({ name: 'Test', page: 1, limit: 10 });
      expect(error).toBeUndefined();
    });

    it('should validate ymd format', () => {
      const { error } = schemas.searchQuery.validate({ ymd: '20230405' });
      expect(error).toBeUndefined();
    });

    it('should reject invalid ymd format', () => {
      const { error } = schemas.searchQuery.validate({ ymd: '2023-04-05' });
      expect(error).toBeDefined();
    });

    it('should use default pagination', () => {
      const { value } = schemas.searchQuery.validate({});
      expect(value.page).toBe(1);
      expect(value.limit).toBe(10);
    });
  });

  describe('paginationQuery schema', () => {
    it('should validate pagination', () => {
      const { error } = schemas.paginationQuery.validate({ page: 1, limit: 20, search: 'test' });
      expect(error).toBeUndefined();
    });

    it('should allow empty search', () => {
      const { error } = schemas.paginationQuery.validate({ page: 1, limit: 10, search: '' });
      expect(error).toBeUndefined();
    });
  });
});
