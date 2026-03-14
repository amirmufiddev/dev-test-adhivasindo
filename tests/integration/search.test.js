const request = require('supertest');
const app = require('../../src/app');
const axios = require('axios');

jest.mock('axios');
jest.mock('../../src/config/database', () => {
  const mockDb = jest.fn(() => mockDb);
  mockDb.raw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.first = jest.fn();
  mockDb.schema = { createTable: jest.fn(), dropTableIfExists: jest.fn() };
  return mockDb;
});

const authService = require('../../src/modules/auth/auth.service');

describe('Search Endpoints', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = authService.generateAccessToken({ id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' });
  });

  describe('GET /api/data-search', () => {
    it('should search data successfully', async () => {
      const mockApiResponse = {
        data: {
          RC: 200,
          RCM: 'OK',
          DATA: 'NIM|NAMA|YMD\n9352078461|Turner Mia|20230405\n0178453629|Abigail Williams|20220803',
        },
      };
      axios.get.mockResolvedValue(mockApiResponse);

      const res = await request(app)
        .get('/api/data-search?name=Turner')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].nama).toContain('Turner');
    });

    it('should return empty array when no match', async () => {
      const mockApiResponse = {
        data: {
          RC: 200,
          RCM: 'OK',
          DATA: 'NIM|NAMA|YMD\n9352078461|Turner Mia|20230405',
        },
      };
      axios.get.mockResolvedValue(mockApiResponse);

      const res = await request(app)
        .get('/api/data-search?name=NonExistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.message).toBe('Data tidak ditemukan');
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/data-search?name=Test');

      expect(res.statusCode).toBe(401);
    });

    it('should handle external API error', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const res = await request(app)
        .get('/api/data-search?name=Test')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(502);
    });

    it('should search by nim', async () => {
      const mockApiResponse = {
        data: {
          RC: 200,
          RCM: 'OK',
          DATA: 'NIM|NAMA|YMD\n9352078461|Turner Mia|20230405',
        },
      };
      axios.get.mockResolvedValue(mockApiResponse);

      const res = await request(app)
        .get('/api/data-search?nim=9352078461')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].nim).toBe('9352078461');
    });

    it('should search by ymd', async () => {
      const mockApiResponse = {
        data: {
          RC: 200,
          RCM: 'OK',
          DATA: 'NIM|NAMA|YMD\n9352078461|Turner Mia|20230405',
        },
      };
      axios.get.mockResolvedValue(mockApiResponse);

      const res = await request(app)
        .get('/api/data-search?ymd=20230405')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].ymd).toBe('20230405');
    });
  });
});
