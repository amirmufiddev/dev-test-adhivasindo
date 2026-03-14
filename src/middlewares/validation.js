const Joi = require('joi');

const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ success: false, data: null, message });
    }
    req[target] = value;
    next();
  };
};

const schemas = {
  login: Joi.object({
    username: Joi.string().min(3).max(100).required().messages({
      'string.empty': 'Username tidak boleh kosong',
      'any.required': 'Username wajib diisi',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password tidak boleh kosong',
      'any.required': 'Password wajib diisi',
    }),
  }),

  createUser: Joi.object({
    username: Joi.string().min(3).max(100).required(),
    password: Joi.string().min(6).max(255).required(),
    email: Joi.string().email().max(255).required(),
    full_name: Joi.string().min(2).max(255).required(),
    role: Joi.string().valid('admin', 'user').default('user'),
    is_active: Joi.boolean().default(true),
  }),

  updateUser: Joi.object({
    email: Joi.string().email().max(255),
    full_name: Joi.string().min(2).max(255),
    is_active: Joi.boolean(),
    password: Joi.string().min(6).max(255),
  }).min(1),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token wajib diisi',
    }),
  }),

  searchQuery: Joi.object({
    name: Joi.string().optional(),
    nim: Joi.string().optional(),
    ymd: Joi.string().pattern(/^\d{8}$/).optional().messages({
      'string.pattern.base': 'YMD harus berformat YYYYMMDD',
    }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),

  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().optional().allow(''),
  }),
};

module.exports = { validate, schemas };
