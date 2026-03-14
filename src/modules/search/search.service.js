const axios = require('axios');
const { EXTERNAL_API_URL } = require('../../utils/constants');
const logger = require('../../utils/logger');

class SearchService {
  async fetchExternalData() {
    try {
      const response = await axios.get(EXTERNAL_API_URL, { timeout: 10000 });
      const rawData = response.data;

      if (!rawData || rawData.RC !== 200) {
        const err = new Error('External API mengembalikan error');
        err.statusCode = 502;
        throw err;
      }

      const lines = rawData.DATA.trim().split('\n');
      const header = lines[0].split('|').map(col => col.trim().toLowerCase());
      const headerMap = header.reduce((acc, col, idx) => {
        acc[col] = idx;
        return acc;
      }, {});

      const getValue = (values, key) => {
        const idx = headerMap[key];
        if (idx === undefined) return '';
        return values[idx] || '';
      };

      const records = lines
        .slice(1)
        .filter(line => line.trim().length > 0)
        .map(line => {
          const values = line.split('|');
          return {
            nim: getValue(values, 'nim'),
            nama: getValue(values, 'nama'),
            ymd: getValue(values, 'ymd'),
          };
        });

      return records;
    } catch (error) {
      if (error.statusCode) throw error;
      logger.error('External API error:', error.message);
      const err = new Error('Gagal mengambil data dari external API');
      err.statusCode = 502;
      throw err;
    }
  }

  async search({ name, nim, ymd } = {}) {
    const records = await this.fetchExternalData();

    let filtered = records;

    if (name) {
      filtered = filtered.filter(r =>
        r.nama.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (nim) {
      filtered = filtered.filter(r => r.nim === nim);
    }

    if (ymd) {
      filtered = filtered.filter(r => r.ymd === ymd);
    }

    return filtered;
  }
}

module.exports = new SearchService();
