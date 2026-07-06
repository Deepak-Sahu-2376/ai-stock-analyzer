const { pool } = require('./db');

async function fixUndefined() {
  try {
    const result = await pool.query(`
      UPDATE processed_order_announcements 
      SET anndate = NULL 
      WHERE anndate = 'undefined' OR anndate = 'null'
    `);
    console.log(`Cleaned up ${result.rowCount} records with 'undefined' anndate.`);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

fixUndefined();
