const bcrypt = require('bcryptjs');
const userRepository = require('./users.repository');
const { BCRYPT_ROUNDS } = require('../../utils/constants');

class UserService {
  async getAllUsers({ page, limit, search } = {}) {
    return userRepository.findAll({ page, limit, search });
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const err = new Error('User tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async createUser(data) {
    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      const err = new Error('Username sudah digunakan');
      err.statusCode = 409;
      throw err;
    }

    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      const err = new Error('Email sudah digunakan');
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    return userRepository.create({ ...data, password: hashedPassword });
  }

  async updateUser(id, data, requestingUser) {
    const user = await userRepository.findById(id);
    if (!user) {
      const err = new Error('User tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }

    if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(id)) {
      const err = new Error('Akses ditolak. Anda hanya dapat mengupdate data sendiri.');
      err.statusCode = 403;
      throw err;
    }

    const updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await userRepository.findByEmail(data.email);
      if (existingEmail) {
        const err = new Error('Email sudah digunakan');
        err.statusCode = 409;
        throw err;
      }
    }

    return userRepository.update(id, updateData);
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const err = new Error('User tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    await userRepository.delete(id);
    return true;
  }
}

module.exports = new UserService();
