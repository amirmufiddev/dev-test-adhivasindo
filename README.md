# Adhivasindo REST API

REST API CRUD menggunakan Node.js Express dengan PostgreSQL sebagai database. Dilengkapi dengan autentikasi JWT, integrasi external API, dokumentasi Swagger, containerization Docker, dan comprehensive testing (96.87% coverage).

## 🚀 Fitur Utama

- ✅ **Authentication & Authorization** - JWT-based dengan refresh token
- ✅ **User Management** - CRUD lengkap dengan role-based access control
- ✅ **External API Integration** - Pencarian data dengan dynamic header parsing
- ✅ **Comprehensive Testing** - 126 tests dengan 96.87% coverage
- ✅ **API Documentation** - Swagger/OpenAPI 3.0
- ✅ **Database Migration** - Knex.js migration & seeding
- ✅ **Error Handling** - Global error handler dengan logging
- ✅ **Input Validation** - Joi schema validation
- ✅ **Security** - Helmet, CORS, bcrypt password hashing
- ✅ **Logging** - Winston logger dengan file rotation
- ✅ **Docker Support** - Docker Compose untuk development

## Tech Stack

- **Runtime**: Node.js v18.x
- **Framework**: Express.js ^4.18.x
- **Database**: PostgreSQL v15.x
- **Query Builder**: Knex.js
- **Auth**: JWT (jsonwebtoken)
- **Validasi**: Joi
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Container**: Docker & Docker Compose
- **Docs**: Swagger (OpenAPI 3.0)

## Persyaratan

- Node.js >= 18.x
- PostgreSQL >= 15.x (atau gunakan Docker)
- npm >= 9.x

## Instalasi & Setup

### 1. Clone dan Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
# Edit .env sesuai kebutuhan
```

### 3. Setup Database

```bash
# Jalankan migration
npm run migrate

# Jalankan seeder (admin & user awal)
npm run seed
```

### 4. Jalankan Server

```bash
# Development (dengan nodemon)
npm run dev

# Production
npm start
```

Server berjalan di `http://localhost:3000`

## Menjalankan dengan Docker

```bash
docker-compose up -d
```

Ini akan otomatis:
- Menjalankan PostgreSQL
- Menjalankan migration database
- Menjalankan seeder
- Menjalankan API server di port 3000

## API Documentation

Swagger UI tersedia di: `http://localhost:3000/api-docs`

## Endpoints

### Authentication

| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/login` | Login dan dapatkan token | Tidak |
| POST | `/api/auth/refresh` | Refresh access token | Tidak |
| POST | `/api/auth/logout` | Logout | JWT |

### Users (CRUD)

| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| GET | `/api/users` | Semua user (paginasi) | JWT + Admin |
| GET | `/api/users/:id` | User by ID | JWT |
| POST | `/api/users` | Buat user baru | JWT + Admin |
| PUT | `/api/users/:id` | Update user | JWT |
| DELETE | `/api/users/:id` | Hapus user | JWT + Admin |

### Search (External API)

| Method | Path | Deskripsi | Auth |
|--------|------|-----------|------|
| GET | `/api/data-search` | Cari data (nama/nim/ymd) | JWT |

**Query Parameters untuk `/api/data-search`:**
- `name` - Filter by nama (partial match)
- `nim` - Filter by NIM (exact match)
- `ymd` - Filter by tanggal YYYYMMDD (exact match)

## Contoh Penggunaan

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Pencarian Data
```bash
curl -X GET "http://localhost:3000/api/data-search?name=Turner" \
  -H "Authorization: Bearer <access_token>"
```

### CRUD User
```bash
# Get all users
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <access_token>"

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"pass123","email":"new@example.com","full_name":"New User","role":"user"}'
```

## Default Credentials (Seeder)

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| user01 | user123 | user |

## Testing

### Test Coverage: 96.87% ✅

Proyek ini memiliki **126 tests** dengan coverage:
- **Statements:** 96.87%
- **Branches:** 78.51%
- **Functions:** 92%
- **Lines:** 97.01%

```bash
# Jalankan semua tests
npm test

# Dengan coverage report
npm run test:coverage

# Watch mode untuk development
npm test -- --watch
```

### Struktur Test
```
tests/
├── unit/                          # Unit tests (15 files)
│   ├── authController.test.js     # Auth controller tests
│   ├── authRepository.test.js     # Auth repository tests
│   ├── authService.test.js        # Auth service tests
│   ├── authService.logout.test.js # Logout functionality
│   ├── authMiddleware.test.js     # JWT middleware tests
│   ├── errorHandler.test.js       # Error handling tests
│   ├── response.test.js           # Response utility tests
│   ├── searchController.test.js   # Search controller tests
│   ├── searchService.test.js      # Search service tests
│   ├── usersController.test.js    # User controller tests
│   ├── usersRepository.test.js    # User repository tests
│   ├── userService.test.js        # User service tests
│   └── validation.test.js         # Input validation tests
└── integration/                   # Integration tests (2 files)
    ├── api.test.js                # API endpoint tests
    └── search.test.js             # Search endpoint tests
```

### Coverage per Module

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| **Middlewares** | 100% | 100% | 100% | 100% |
| **Auth Module** | 100% | 100% | 100% | 100% |
| **Users Module** | 90.72% | 70.73% | 80.76% | 90.72% |
| **Search Module** | 98.11% | 84.21% | 100% | 100% |
| **Routes** | 100% | 100% | 100% | 100% |
| **Utils** | 100% | 100% | 100% | 100% |

### Menulis Test

#### Unit Test Example
```javascript
// tests/unit/authService.test.js
const authService = require('../../src/modules/auth/auth.service');

describe('AuthService', () => {
  describe('login', () => {
    it('harus mengembalikan token ketika kredensial valid', async () => {
      const result = await authService.login('admin', 'admin123');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('harus melempar error ketika password salah', async () => {
      await expect(authService.login('admin', 'salah')).rejects.toThrow();
    });
  });
});
```

#### Integration Test Example
```javascript
// tests/integration/api.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('API Endpoints', () => {
  let token;

  beforeAll(async () => {
    // Login untuk mendapatkan token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    token = res.body.data.accessToken;
  });

  describe('GET /api/users', () => {
    it('harus mengembalikan 401 tanpa token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('harus mengembalikan 200 dengan token valid', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
```

## Struktur Proyek

```
adhivasindo/
├── src/
│   ├── app.js                      # Entry point aplikasi Express
│   ├── server.js                   # Server startup
│   ├── config/                     # Konfigurasi aplikasi
│   │   ├── database.js             # Konfigurasi Knex/PostgreSQL
│   │   └── jwt.js                  # Konfigurasi JWT (secret & expiry)
│   ├── modules/                    # Module per feature (modular structure)
│   │   ├── auth/
│   │   │   ├── auth.controller.js  # Controller autentikasi
│   │   │   ├── auth.service.js     # Business logic autentikasi
│   │   │   └── auth.repository.js  # Data access autentikasi
│   │   ├── users/
│   │   │   ├── users.controller.js # Controller user CRUD
│   │   │   ├── users.service.js    # Business logic user
│   │   │   └── users.repository.js # Data access user (extends BaseRepository)
│   │   └── search/
│   │       ├── search.controller.js # Controller pencarian
│   │       └── search.service.js    # External API integration
│   ├── routes/                     # Definisi routes
│   │   ├── index.js                # Main router (aggregator)
│   │   ├── auth.route.js           # Routes autentikasi + Swagger docs
│   │   ├── users.route.js          # Routes user + Swagger docs
│   │   └── search.route.js         # Routes pencarian + Swagger docs
│   ├── middlewares/                # Middleware khusus
│   │   ├── authMiddleware.js       # JWT validation (authenticateToken, requireAdmin)
│   │   ├── errorHandler.js         # Global error handler
│   │   └── validation.js           # Joi schema validation
│   ├── utils/                      # Utility functions
│   │   ├── asyncHandler.js         # Wrapper async error handling
│   │   ├── constants.js            # Konstanta aplikasi (EXTERNAL_API_URL, etc)
│   │   ├── logger.js               # Winston logger configuration
│   │   └── response.js             # Response formatter (successResponse, errorResponse)
│   └── docs/                       # Dokumentasi Swagger
│       └── swagger.js              # Konfigurasi Swagger/OpenAPI 3.0
├── database/
│   ├── migrations/                 # Migration files
│   │   ├── 001_create_users_table.js
│   │   └── 002_create_refresh_tokens_table.js
│   └── seeders/                    # Seeder files
│       └── 001_users_seeder.js     # Default admin & user
├── tests/                          # Unit dan Integration tests (126 tests)
│   ├── unit/                       # 15 unit test files
│   └── integration/                # 2 integration test files
├── docker/
│   └── Dockerfile                  # Docker image configuration
├── coverage/                       # Test coverage reports (generated)
├── .env.example                    # Environment variables template
├── .eslintrc.json                  # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── docker-compose.yml              # Docker Compose setup
├── knexfile.js                     # Knex migration configuration
├── jest.config.js                  # Jest testing configuration
├── package.json                    # Dependencies & scripts
└── README.md                       # This file
```

## Arsitektur Sistem

Proyek ini menggunakan arsitektur **Modular Layered Architecture** dengan pemisahan concerns yang jelas:

### Layer Structure

1. **Routes Layer** (`src/routes/`)
   - Menangani HTTP requests dan responses
   - Menentukan endpoint mana yang memerlukan autentikasi
   - Validasi input menggunakan Joi

2. **Controller Layer** (`src/modules/*/`)
   - Menerima request dari routes
   - Memanggil service yang sesuai
   - Mengembalikan response

3. **Service Layer** (`src/modules/*/`)
   - Menangani business logic
   - Memanggil repository untuk akses data
   - Tidak tahu tentang HTTP/request/response

4. **Repository Layer** (`src/modules/*/`)
   - Menangani akses ke database
   - Menggunakan Knex.js untuk query
   - Mengembalikan data ke service

### Keuntungan Arsitektur

- **Modular**: Setiap feature (auth, users, search) memiliki folder sendiri
- **Scalable**: Mudah menambahkan feature baru
- **Testable**: Setiap layer bisa di-test secara independen
- **Maintainable**: Kode terorganisir dengan baik

## Middleware

### Auth Middleware (`src/middlewares/authMiddleware.js`)
- **`authenticateToken`**: Memvalidasi JWT access token dari header Authorization
  - Mengembalikan 401 jika token tidak ada
  - Mengembalikan 403 jika token invalid/expired
  - Menyimpan user data ke `req.user` jika valid

- **`requireAdmin`**: Memastikan user memiliki role 'admin'
  - Harus dipanggil setelah `authenticateToken`
  - Mengembalikan 403 jika user bukan admin

### Validation Middleware (`src/middlewares/validation.js`)
Menggunakan Joi untuk validasi input dengan schema:
- `schemas.login` - Validasi username & password
- `schemas.createUser` - Validasi data user baru
- `schemas.updateUser` - Validasi data update user
- `schemas.refreshToken` - Validasi refresh token
- `schemas.searchQuery` - Validasi query parameter pencarian
- `schemas.paginationQuery` - Validasi pagination

### Error Handling
- **Global error handler** di `src/middlewares/errorHandler.js`
  - Menangani database errors (unique constraint, foreign key)
  - Menangani Joi validation errors
  - Menangani custom errors dengan statusCode
  - Logging semua errors dengan Winston
  - Response format konsisten: `{ success: false, data: null, message: "..." }`

- **Async error wrapper** di `src/utils/asyncHandler.js`
  - Menangkap errors dari async route handlers
  - Meneruskan errors ke global error handler

## Database Schema

### Tabel Users
| Kolom | Tipe | Constraints |
|-------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| username | VARCHAR(100) | NOT NULL, UNIQUE |
| password | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| full_name | VARCHAR(255) | NOT NULL |
| role | ENUM | 'admin' atau 'user' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### Tabel Refresh Tokens
| Kolom | Tipe | Constraints |
|-------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_id | INTEGER | FOREIGN KEY (users.id) |
| token | TEXT | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

## Migration & Seeder

### Command Line

```bash
# Jalankan semua migration
npm run migrate

# Rollback migration terakhir
npm run migrate:rollback

# Jalankan seeder
npm run seed

# Setup lengkap (migrate + seed)
npm run db:setup
```

### File Migration

Migration berada di `database/migrations/001_create_users_table.js`:

```javascript
// database/migrations/001_create_users_table.js

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
```

### File Seeder

Seeder berada di `database/seeders/001_users_seeder.js`:

```javascript
// database/seeders/001_users_seeder.js

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
```

### Membuat Migration Baru

```bash
# Membuat migration baru
npx knex migrate:make create_new_table

# Membuat seeder baru
npx knex seed:make new_seeder
```

## Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| PORT | 3000 | Port server |
| NODE_ENV | development | Environment |
| DB_HOST | localhost | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | adhivasindo | Nama database |
| DB_USER | postgres | Database user |
| DB_PASSWORD | postgres | Database password |
| JWT_SECRET | - | Secret key JWT |
| JWT_REFRESH_SECRET | - | Secret key refresh token |
| JWT_EXPIRES_IN | 15m | Masa berlaku access token |
| JWT_REFRESH_EXPIRES_IN | 7d | Masa berlaku refresh token |
| EXTERNAL_API_URL | ogienurdiana.com/... | URL external API |

## 🔒 Security Features

- **Password Hashing**: bcrypt dengan 10 rounds
- **JWT Authentication**: Access token (15m) + Refresh token (7d)
- **Helmet**: Security headers (XSS, clickjacking protection)
- **CORS**: Configured untuk cross-origin requests
- **Input Validation**: Joi schema validation untuk semua endpoints
- **SQL Injection Prevention**: Knex.js parameterized queries
- **Role-Based Access Control**: Admin vs User permissions

## 📊 Response Format

Semua API responses menggunakan format konsisten:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Berhasil"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Error message"
}
```

## 🔄 External API Integration

Fitur pencarian mengintegrasikan external API dengan:
- **Dynamic Header Parsing**: Mendukung urutan kolom yang berubah-ubah
- **Error Handling**: Timeout 10 detik, retry logic
- **Data Mapping**: Otomatis mapping nim, nama, ymd dari response
- **Filtering**: Support filter by name (partial), nim (exact), ymd (exact)

## 🛠️ Development

### Code Quality Tools

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
```

### ESLint Configuration
- Extends: `eslint:recommended`
- Environment: Node.js, ES2021, Jest
- Rules: Standard JavaScript style

### Prettier Configuration
- Single quotes
- No semicolons
- 2 spaces indentation
- Trailing commas: ES5

## 📝 Logging

Winston logger dengan konfigurasi:
- **Console**: Colorized output untuk development
- **File**: `logs/error.log` untuk errors
- **File**: `logs/combined.log` untuk semua logs
- **Format**: Timestamp + JSON
- **Level**: info (production), debug (development)

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Pastikan PostgreSQL running
sudo systemctl status postgresql

# Atau gunakan Docker
docker-compose up -d postgres
```

### Migration Error
```bash
# Reset database
npm run migrate:rollback
npm run migrate
npm run seed
```

### Test Failures
```bash
# Clear Jest cache
npx jest --clearCache

# Run tests dengan verbose
npm test -- --verbose
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT secrets
- [ ] Configure production database
- [ ] Enable SSL/TLS
- [ ] Set up reverse proxy (nginx)
- [ ] Configure firewall
- [ ] Set up monitoring & logging
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Run migrations

### Docker Production

```bash
# Build production image
docker build -f docker/Dockerfile -t adhivasindo-api:latest .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Knex.js Documentation](https://knexjs.org/)
- [Jest Documentation](https://jestjs.io/)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Commit Convention

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## 📄 License

MIT

## 👨‍💻 Author

Amir Mufid

---

**Built with ❤️ using Node.js, Express, and PostgreSQL**