require('dotenv').config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'adoptmascota',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
};

// Usado por sequelize-cli y por src/models/index.js
module.exports = {
  development: { ...base, logging: false },
  test: { ...base, database: `${base.database}_test`, logging: false },
  production: { ...base, logging: false },
};
