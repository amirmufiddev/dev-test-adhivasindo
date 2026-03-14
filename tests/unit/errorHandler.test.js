const errorHandler = require('../../src/middlewares/errorHandler');

describe('ErrorHandler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { url: '/test', method: 'GET' };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    next = jest.fn();
  });

  it('should handle database unique constraint error (23505)', () => {
    const err = new Error('Duplicate key');
    err.code = '23505';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: 'Data sudah ada',
    });
  });

  it('should handle database foreign key error (23503)', () => {
    const err = new Error('Foreign key violation');
    err.code = '23503';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: 'Data terkait tidak ditemukan',
    });
  });

  it('should handle Joi validation error', () => {
    const err = {
      isJoi: true,
      details: [{ message: 'Validation failed' }],
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: 'Validation failed',
    });
  });

  it('should handle custom error with statusCode', () => {
    const err = new Error('Custom error');
    err.statusCode = 404;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: 'Custom error',
    });
  });

  it('should handle generic error with default 500 status', () => {
    const err = new Error('Something went wrong');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: 'Something went wrong',
    });
  });

  it('should use default message for error without message', () => {
    const err = {};

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: 'Internal Server Error',
    });
  });
});
