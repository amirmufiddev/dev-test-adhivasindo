const searchService = require('./search.service');
const { successResponse } = require('../../utils/response');

class SearchController {
  async search(req, res) {
    const { name, nim, ymd } = req.query;
    const data = await searchService.search({ name, nim, ymd });

    if (data.length === 0) {
      return successResponse(res, [], 'Data tidak ditemukan');
    }

    return successResponse(res, data, 'Data berhasil diambil');
  }
}

module.exports = new SearchController();
