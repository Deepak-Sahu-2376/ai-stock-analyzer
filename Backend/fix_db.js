const { pool } = require('./db.js');

async function fixUrl() {
  try {
    const updatedUrl = 'http://localhost:11434, http://localhost:11435';
    await pool.query('UPDATE ai_settings SET ollama_url = $1', [updatedUrl]);
    console.log('Successfully updated ollama_url back to', updatedUrl);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

fixUrl();
