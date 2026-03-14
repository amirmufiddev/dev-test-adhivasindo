require('dotenv').config();
const knex = require('knex');

const config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'adhivasindo',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../../database/migrations',
  },
};

const db = knex(config);

module.exports = db;
