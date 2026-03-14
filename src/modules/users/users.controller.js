const userService = require('./users.service');
const { successResponse } = require('../../utils/response');

class UserController {
  async getAllUsers(req, res) {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await userService.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    return successResponse(res, result, 'Data user berhasil diambil');
  }

  async getUserById(req, res) {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return successResponse(res, { user }, 'User ditemukan');
  }

  async createUser(req, res) {
    const user = await userService.createUser(req.body);
    return successResponse(res, { user }, 'User berhasil dibuat', 201);
  }

  async updateUser(req, res) {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body, req.user);
    return successResponse(res, { user }, 'User berhasil diupdate');
  }

  async deleteUser(req, res) {
    const { id } = req.params;
    await userService.deleteUser(id);
    return successResponse(res, null, 'User berhasil dihapus');
  }
}

module.exports = new UserController();
