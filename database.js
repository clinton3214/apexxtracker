require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        startDate TEXT NOT NULL,
        deadline TEXT NOT NULL,
        totalPlannedMinutes INTEGER NOT NULL,
        currentDailyCapacityMin INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        completedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        goalId VARCHAR(255),
        title TEXT NOT NULL,
        priority TEXT NOT NULL,
        targetDay TEXT NOT NULL,
        estimatedMinutes INTEGER NOT NULL,
        spentMinutes INTEGER NOT NULL,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS logs (
        id VARCHAR(255) PRIMARY KEY,
        goalId VARCHAR(255) REFERENCES goals(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        minutesLogged INTEGER NOT NULL,
        note TEXT
      );
    `);
    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing database", error);
  }
};

module.exports = {
  pool,
  initDB
};
