const db = require('../../config/database');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = db;
  }

  async findAll({ page = 1, limit = 10, search = '', searchFields = [] } = {}) {
    const offset = (page - 1) * limit;
    let query = this.db(this.tableName);

    if (search && searchFields.length > 0) {
      query = query.where(function () {
        searchFields.forEach((field, index) => {
          if (index === 0) {
            this.where(field, 'ilike', `%${search}%`);
          } else {
            this.orWhere(field, 'ilike', `%${search}%`);
          }
        });
      });
    }

    const [countResult, rows] = await Promise.all([
      query.clone().count('* as total').first(),
      query.clone().limit(limit).offset(offset),
    ]);

    return {
      data: rows,
      pagination: {
        total: parseInt(countResult.total),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.total) / limit),
      },
    };
  }

  async findById(id) {
    return this.db(this.tableName).where({ id }).first();
  }

  async create(data) {
    const [row] = await this.db(this.tableName).insert(data).returning('*');
    return row;
  }

  async update(id, data) {
    const [row] = await this.db(this.tableName).where({ id }).update(data).returning('*');
    return row;
  }

  async delete(id) {
    return this.db(this.tableName).where({ id }).del();
  }

  async findOne(conditions) {
    return this.db(this.tableName).where(conditions).first();
  }
}

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findAll({ page = 1, limit = 10, search = '' } = {}) {
    return super.findAll({
      page,
      limit,
      search,
      searchFields: ['username', 'email', 'full_name'],
    });
  }

  async findByUsername(username) {
    return this.db(this.tableName).where({ username }).first();
  }

  async findByEmail(email) {
    return this.db(this.tableName).where({ email }).first();
  }

  async findById(id) {
    return this.db(this.tableName)
      .select('id', 'username', 'email', 'full_name', 'role', 'is_active', 'created_at', 'updated_at')
      .where({ id })
      .first();
  }

  async create(data) {
    const [row] = await this.db(this.tableName)
      .insert(data)
      .returning(['id', 'username', 'email', 'full_name', 'role', 'is_active', 'created_at', 'updated_at']);
    return row;
  }

  async update(id, data) {
    const updateData = { ...data, updated_at: new Date() };
    const [row] = await this.db(this.tableName)
      .where({ id })
      .update(updateData)
      .returning(['id', 'username', 'email', 'full_name', 'role', 'is_active', 'created_at', 'updated_at']);
    return row;
  }
}

module.exports = new UserRepository();
