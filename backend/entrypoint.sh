#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Checking if database is initialized..."
# Check if users table has any data
USER_COUNT=$(node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'db',
      user: process.env.DB_USER || 'user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'vetcrm'
    });
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(rows[0].count);
    await connection.end();
  } catch (err) {
    console.log('0');
  }
})();
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "Database is empty. Running initialization..."
  npm run db:init
else
  echo "Database already initialized. Skipping..."
fi

echo "Starting application..."
exec "$@"
