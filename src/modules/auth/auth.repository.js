const db = require('../../config/database');

class AuthRepository {
  constructor(dbClient = db) {
    this.tableName = 'refresh_tokens';
    this.db = dbClient;
  }

  async saveRefreshToken({ user_id, token, expires_at }) {
    const [row] = await this.db(this.tableName)
      .insert({ user_id, token, expires_at })
      .returning('*');
    return row;
  }

  async findRefreshToken(token) {
    return this.db(this.tableName)
      .where({ token })
      .where('expires_at', '>', new Date())
      .first();
  }

  async deleteRefreshToken(token) {
    return this.db(this.tableName).where({ token }).del();
  }

  async deleteUserRefreshTokens(user_id) {
    return this.db(this.tableName).where({ user_id }).del();
  }

  async findUserByUsername(username) {
    return this.db('users').where({ username }).first();
  }
}

module.exports = new AuthRepository();
module.exports.AuthRepository = AuthRepository;
