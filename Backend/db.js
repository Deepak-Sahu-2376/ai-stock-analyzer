const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:SECURE@localhost:5432/stocks_db';

const pool = new Pool({
  connectionString,
});

pool.on('connect', () => {
  // Connection established (silenced extra logs)
});

const initializeDB = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create otps table for email verification
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create holdings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS holdings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(50) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        buy_price NUMERIC(15, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create positions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        buy_price NUMERIC(15, 2) NOT NULL,
        type VARCHAR(10) NOT NULL, -- 'BUY' or 'SELL'
        product VARCHAR(20) DEFAULT 'MIS', -- 'MIS' (Intraday) or 'CNC' (Delivery)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create alerts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(50) NOT NULL,
        target_price NUMERIC(15, 2) NOT NULL,
        condition VARCHAR(10) NOT NULL, -- 'ABOVE' or 'BELOW'
        status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXECUTED', 'DELETED'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create wishlists table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(50) NOT NULL,
        company_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, symbol)
      );
    `);

    // Create push_subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        keys_p256dh TEXT NOT NULL,
        keys_auth TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, endpoint)
      );
    `);

    // Create processed_announcements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS processed_announcements (
        seq_id VARCHAR(255) PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        ai_summary TEXT,
        ai_sentiment VARCHAR(50),
        ai_impact VARCHAR(50),
        attachment_url TEXT,
        anndate TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create processed_corporate_actions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS processed_corporate_actions (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        purpose TEXT NOT NULL,
        record_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(symbol, purpose, record_date)
      );
    `);

    // Create ai_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_settings (
        id SERIAL PRIMARY KEY,
        provider VARCHAR(20) DEFAULT 'gemini',
        gemini_key TEXT,
        ollama_url TEXT DEFAULT 'http://localhost:11434',
        ollama_model TEXT DEFAULT 'gpt-oss:20b-cloud',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Upgrade ai_settings to support multiple keys and models
    await client.query(`
      ALTER TABLE ai_settings
      ADD COLUMN IF NOT EXISTS gemini_keys JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS active_gemini_key TEXT,
      ADD COLUMN IF NOT EXISTS ollama_models JSONB DEFAULT '["gpt-oss:20b-cloud"]',
      ADD COLUMN IF NOT EXISTS active_ollama_model TEXT DEFAULT 'gpt-oss:20b-cloud';
    `);

    // Create app_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        maintenance_mode BOOLEAN DEFAULT false,
        alerts_interval_min INTEGER DEFAULT 1,
        announcements_interval_min INTEGER DEFAULT 5,
        corp_action_interval_min INTEGER DEFAULT 10,
        summarize_all_announcements BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default ai_settings if empty
    const aiSettingsRes = await client.query('SELECT COUNT(*) FROM ai_settings');
    if (parseInt(aiSettingsRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO ai_settings (provider, gemini_key, ollama_url, ollama_model) 
        VALUES ('gemini', '', 'http://localhost:11434', 'gpt-oss:20b-cloud')
      `);
    }

    // Seed default app_settings if empty
    const appSettingsRes = await client.query('SELECT COUNT(*) FROM app_settings');
    if (parseInt(appSettingsRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO app_settings (maintenance_mode, alerts_interval_min, announcements_interval_min, corp_action_interval_min, summarize_all_announcements) 
        VALUES (false, 1, 5, 10, false)
      `);
    }

    // Upgrade app_settings to support new toggles
    await client.query(`
      ALTER TABLE app_settings
      ADD COLUMN IF NOT EXISTS summarize_all_announcements BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS brave_api_key TEXT,
      ADD COLUMN IF NOT EXISTS blog_fetches_per_day INTEGER DEFAULT 2,
      ADD COLUMN IF NOT EXISTS blog_search_topic TEXT DEFAULT 'india stock market';
    `);

    // Create blogs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category VARCHAR(50),
        category_color VARCHAR(50),
        url TEXT UNIQUE NOT NULL,
        image_url TEXT,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create stock_financials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_financials (
        symbol VARCHAR(50) PRIMARY KEY,
        sales_growth_10y NUMERIC,
        sales_growth_5y NUMERIC,
        sales_growth_3y NUMERIC,
        sales_growth_ttm NUMERIC,
        profit_growth_10y NUMERIC,
        profit_growth_5y NUMERIC,
        profit_growth_3y NUMERIC,
        profit_growth_ttm NUMERIC,
        roe_10y NUMERIC,
        roe_5y NUMERIC,
        roe_3y NUMERIC,
        roe_1y NUMERIC,
        cagr_10y NUMERIC,
        cagr_5y NUMERIC,
        cagr_3y NUMERIC,
        cagr_1y NUMERIC,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add market_cap to stock_financials
    await client.query(`
      ALTER TABLE stock_financials
      ADD COLUMN IF NOT EXISTS market_cap NUMERIC;
    `);

    // Create processed_order_announcements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS processed_order_announcements (
        news_id VARCHAR(255) PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        ai_summary TEXT,
        order_value_cr NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add anndate to processed_order_announcements
    await client.query(`
      ALTER TABLE processed_order_announcements
      ADD COLUMN IF NOT EXISTS anndate TEXT;
    `);

    // Create api_health_status table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_health_status (
        id SERIAL PRIMARY KEY,
        api_name VARCHAR(100) UNIQUE NOT NULL,
        endpoint TEXT NOT NULL,
        status VARCHAR(10) DEFAULT 'UP',
        last_success TIMESTAMP,
        last_failure TIMESTAMP,
        error_message TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('Database tables initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

const seedUserPortfolio = async (userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user already has holdings
    const holdingsRes = await client.query('SELECT 1 FROM holdings WHERE user_id = $1 LIMIT 1', [userId]);
    if (holdingsRes.rowCount === 0) {
      // Seed holdings
      await client.query(`
        INSERT INTO holdings (user_id, symbol, company_name, quantity, buy_price) VALUES
        ($1, 'BAJAJ-AUTO', 'Bajaj Auto Limited', 10, 9550.50),
        ($1, 'TVSMOTOR', 'TVS Motor Company Limited', 25, 2150.20),
        ($1, 'HEROMOTOCO', 'Hero MotoCorp Limited', 8, 4620.00);
      `, [userId]);

      // Seed positions
      await client.query(`
        INSERT INTO positions (user_id, symbol, quantity, buy_price, type, product) VALUES
        ($1, 'BAJAJ-AUTO', 5, 9620.00, 'BUY', 'MIS'),
        ($1, 'RELIANCE', 15, 2940.30, 'BUY', 'MIS'),
        ($1, 'INFY', -10, 1530.00, 'SELL', 'MIS');
      `, [userId]);

      // Seed alerts
      await client.query(`
        INSERT INTO alerts (user_id, symbol, target_price, condition) VALUES
        ($1, 'BAJAJ-AUTO', 10000.00, 'ABOVE'),
        ($1, 'BAJAJ-AUTO', 9300.00, 'BELOW'),
        ($1, 'TVSMOTOR', 2300.00, 'ABOVE');
      `, [userId]);

      console.log(`Seeded mock portfolio data for user ${userId}`);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding user portfolio:', error);
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initializeDB,
  seedUserPortfolio,
};
