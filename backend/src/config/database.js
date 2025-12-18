/**
 * MySQL Database Configuration
 *
 * Uses mysql2/promise for asynchronous operations
 *
 * @author Bartłomiej Król
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vetcrm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Execute query with parameters
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<any>} Query results
 */
async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Initialize database schema
 */
async function initializeSchema() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Users (Receptionists)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clients
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pets
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        client_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        species ENUM('dog', 'cat', 'rabbit', 'hamster', 'bird', 'other') NOT NULL,
        breed VARCHAR(100),
        date_of_birth DATE,
        weight DECIMAL(5,2),
        sex ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
        color VARCHAR(50),
        microchip_id VARCHAR(50),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
      )
    `);

    // Doctors
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(20),
        is_active TINYINT DEFAULT 1
      )
    `);

    // Working Hours
    await connection.query(`
      CREATE TABLE IF NOT EXISTS working_hours (
        id INT PRIMARY KEY AUTO_INCREMENT,
        doctor_id INT NOT NULL,
        day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
      )
    `);

    // Appointments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        client_id INT NOT NULL,
        pet_id INT NOT NULL,
        doctor_id INT NOT NULL,
        scheduled_at DATETIME NOT NULL,
        duration_minutes INT DEFAULT 30,
        status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
        reason TEXT,
        notes TEXT,
        cancelled_at DATETIME,
        cancellation_fee DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (pet_id) REFERENCES pets(id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id),
        UNIQUE KEY uk_appointments_doctor_time (doctor_id, scheduled_at)
      )
    `);

    // Vaccinations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vaccinations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        pet_id INT NOT NULL,
        vaccine_name VARCHAR(255) NOT NULL,
        vaccination_date DATE NOT NULL,
        next_due_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
      )
    `);

    // Medications
    await connection.query(`
        CREATE TABLE IF NOT EXISTS medications (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            dose_per_kg DECIMAL(10, 4) NOT NULL,
            unit VARCHAR(20) NOT NULL,
            max_dose DECIMAL(10, 2),
            min_weight DECIMAL(10, 2),
            species VARCHAR(50),
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Breed Weights
    await connection.query(`
        CREATE TABLE IF NOT EXISTS breed_weights (
            id INT PRIMARY KEY AUTO_INCREMENT,
            species VARCHAR(50) NOT NULL,
            breed VARCHAR(100) NOT NULL,
            min_weight DECIMAL(5, 2),
            ideal_weight DECIMAL(5, 2),
            max_weight DECIMAL(5, 2),
            size_category VARCHAR(50),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await connection.commit();
    console.log('Database schema initialized.');
  } catch (error) {
    await connection.rollback();
    console.error('Schema initialization failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Reset database (for testing)
 * Warning: This will delete all data!
 */
async function resetDatabase() {
  // Be careful with this in production!
  if (process.env.NODE_ENV === 'production') return;

  const connection = await pool.getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['vaccinations', 'appointments', 'working_hours', 'pets', 'clients', 'doctors', 'users'];
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    connection.release();
  }
}

/**
 * Close database connection pool
 */
async function closeDatabase() {
  await pool.end();
}

module.exports = {
  pool,
  query,
  initializeSchema,
  resetDatabase,
  closeDatabase
};
