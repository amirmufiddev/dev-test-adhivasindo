exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 100).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('full_name', 255).notNullable();
    table.enum('role', ['admin', 'user']).notNullable().defaultTo('user');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
  .then(() => {
    return knex.schema.createTable('refresh_tokens', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('token').notNullable();
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('refresh_tokens')
    .dropTableIfExists('users');
};
