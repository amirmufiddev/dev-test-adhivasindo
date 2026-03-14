const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  await knex('refresh_tokens').del();
  await knex('users').del();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  await knex('users').insert([
    {
      username: 'admin',
      password: adminPassword,
      email: 'admin@example.com',
      full_name: 'Administrator',
      role: 'admin',
      is_active: true,
    },
    {
      username: 'user01',
      password: userPassword,
      email: 'user01@example.com',
      full_name: 'User Biasa',
      role: 'user',
      is_active: true,
    },
  ]);
};
