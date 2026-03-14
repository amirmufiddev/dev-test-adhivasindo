const { successResponse, errorResponse } = require('../../src/utils/response');

describe('Response Utilities', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
  });

  describe('successResponse', () => {
    it('should return success response with default values', () => {
      const data = { user: { id: 1, username: 'admin' } };

      successResponse(res, data);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message: 'Berhasil',
      });
    });

    it('should return success response with custom message', () => {
      const data = { id: 1 };
      const message = 'Data berhasil dibuat';

      successResponse(res, data, message);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
      });
    });

    it('should return success response with custom status code', () => {
      const data = { id: 1 };
      const message = 'Created';
      const statusCode = 201;

      successResponse(res, data, message, statusCode);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data,
        message,
      });
    });

    it('should handle null data', () => {
      successResponse(res, null, 'Success');

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: null,
        message: 'Success',
      });
    });
  });

  describe('errorResponse', () => {
    it('should return error response with default values', () => {
      errorResponse(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        data: null,
        message: 'Terjadi kesalahan',
      });
    });

    it('should return error response with custom message', () => {
      const message = 'User tidak ditemukan';

      errorResponse(res, message);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        data: null,
        message,
      });
    });

    it('should return error response with custom status code', () => {
      const message = 'Not found';
      const statusCode = 404;

      errorResponse(res, message, statusCode);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        data: null,
        message,
      });
    });

    it('should return error response with data', () => {
      const message = 'Validation error';
      const statusCode = 400;
      const data = { field: 'username', error: 'required' };

      errorResponse(res, message, statusCode, data);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        data,
        message,
      });
    });
  });
});
