jest.mock('../../src/modules/search/search.service', () => ({
  search: jest.fn(),
}));

const searchController = require('../../src/modules/search/search.controller');
const searchService = require('../../src/modules/search/search.service');

describe('SearchController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { query: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
  });

  describe('search', () => {
    it('should return data when found', async () => {
      const mockData = [
        { nim: '123', nama: 'Test User', ymd: '20230101' },
      ];
      searchService.search.mockResolvedValue(mockData);
      req.query = { name: 'Test' };

      await searchController.search(req, res);

      expect(searchService.search).toHaveBeenCalledWith({ name: 'Test', nim: undefined, ymd: undefined });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        message: 'Data berhasil diambil',
      });
    });

    it('should return empty array when no data found', async () => {
      searchService.search.mockResolvedValue([]);
      req.query = { name: 'NonExistent' };

      await searchController.search(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: 'Data tidak ditemukan',
      });
    });

    it('should search by nim', async () => {
      const mockData = [{ nim: '123', nama: 'Test', ymd: '20230101' }];
      searchService.search.mockResolvedValue(mockData);
      req.query = { nim: '123' };

      await searchController.search(req, res);

      expect(searchService.search).toHaveBeenCalledWith({ name: undefined, nim: '123', ymd: undefined });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        message: 'Data berhasil diambil',
      });
    });

    it('should search by ymd', async () => {
      const mockData = [{ nim: '123', nama: 'Test', ymd: '20230101' }];
      searchService.search.mockResolvedValue(mockData);
      req.query = { ymd: '20230101' };

      await searchController.search(req, res);

      expect(searchService.search).toHaveBeenCalledWith({ name: undefined, nim: undefined, ymd: '20230101' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        message: 'Data berhasil diambil',
      });
    });
  });
});
