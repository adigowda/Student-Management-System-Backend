const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'student_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  port: 3305,
  password: 'root',
});

module.exports = { pool };
