import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER || "yashbaing",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "postgres",
  password: process.env.PGPASSWORD || "",
  port: parseInt(process.env.PGPORT || "5432"),
});

export const initDb = async () => {
  console.log("🐘 Connecting to PostgreSQL and initializing schema...");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(42) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Create Watchlist Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS watchlists (
        user_id VARCHAR(42) REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(10) NOT NULL,
        PRIMARY KEY (user_id, symbol)
      );
    `);

    // 3. Create Transactions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(66) PRIMARY KEY,
        user_id VARCHAR(42) REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(10) NOT NULL,
        symbol VARCHAR(10),
        qty NUMERIC(36, 18) DEFAULT 0,
        price NUMERIC(20, 6) DEFAULT 0,
        amount NUMERIC(20, 6) DEFAULT 0,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

    // 4. Create Portfolios Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        user_id VARCHAR(42) REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(10) NOT NULL,
        qty NUMERIC(36, 18) NOT NULL DEFAULT 0,
        avg_price NUMERIC(20, 6) NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, symbol)
      );
    `);

    await client.query("COMMIT");
    console.log("✅ PostgreSQL schema initialized successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Failed to initialize PostgreSQL database:", error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
