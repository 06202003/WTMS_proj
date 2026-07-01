import mysql, { Pool } from 'mysql2/promise';

declare global {
  var _mysqlPool: Pool | undefined;
}

export const db = globalThis._mysqlPool || mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wtms_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis._mysqlPool = db;
}
