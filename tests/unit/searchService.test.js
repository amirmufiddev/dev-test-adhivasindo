const axios = require('axios');
jest.mock('axios');

const searchService = require('../../src/modules/search/search.service');

const mockApiResponse = {
  data: {
    RC: 200,
    RCM: 'OK',
    DATA: 'YMD|NAMA|NIM\n20230405|Turner Mia|9352078461\n20220803|Abigail Williams|0178453629\n20231122|Adams Ava|0197485623',
  },
};

describe('SearchService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('fetchExternalData', () => {
    it('should fetch and parse external data', async () => {
      axios.get.mockResolvedValue(mockApiResponse);
      const result = await searchService.fetchExternalData();
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('ymd');
      expect(result[0]).toHaveProperty('nama');
      expect(result[0]).toHaveProperty('nim');
    });

    it('should throw 502 when external API fails', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));
      await expect(searchService.fetchExternalData()).rejects.toMatchObject({ statusCode: 502 });
    });

    it('should throw error when API returns non-200 RC', async () => {
      const errorResponse = {
        data: {
          RC: 500,
          RCM: 'Internal Server Error',
          DATA: null,
        },
      };
      axios.get.mockResolvedValue(errorResponse);
      await expect(searchService.fetchExternalData()).rejects.toMatchObject({ statusCode: 502, message: 'External API mengembalikan error' });
    });

    it('should throw error when API returns null data', async () => {
      axios.get.mockResolvedValue({ data: null });
      await expect(searchService.fetchExternalData()).rejects.toMatchObject({ statusCode: 502 });
    });
  });

  describe('search', () => {
    it('should filter by name', async () => {
      axios.get.mockResolvedValue(mockApiResponse);
      const result = await searchService.search({ name: 'Turner' });
      expect(result).toHaveLength(1);
      expect(result[0].nama).toBe('Turner Mia');
    });

    it('should filter by nim', async () => {
      axios.get.mockResolvedValue(mockApiResponse);
      const result = await searchService.search({ nim: '9352078461' });
      expect(result).toHaveLength(1);
      expect(result[0].nim).toBe('9352078461');
    });

    it('should filter by ymd', async () => {
      axios.get.mockResolvedValue(mockApiResponse);
      const result = await searchService.search({ ymd: '20230405' });
      expect(result).toHaveLength(1);
      expect(result[0].ymd).toBe('20230405');
    });

    it('should return default results when no params', async () => {
      axios.get.mockResolvedValue(mockApiResponse);
      const result = await searchService.search({});
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
