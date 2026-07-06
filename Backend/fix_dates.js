const { pool } = require('./db');

async function fixDates() {
  try {
    console.log('Starting to fix dates...');
    const result = await pool.query(`
      UPDATE processed_order_announcements poa
      SET anndate = pa.anndate
      FROM processed_announcements pa
      WHERE poa.news_id = pa.seq_id AND poa.anndate IS NULL;
    `);
    console.log(`Successfully updated ${result.rowCount} records using processed_announcements.`);
    
    // For any remaining that might not be in processed_announcements, let's see if there are any left.
    const left = await pool.query('SELECT count(*) FROM processed_order_announcements WHERE anndate IS NULL');
    console.log(`Records still missing anndate: ${left.rows[0].count}`);
    
  } catch (err) {
    console.error('Error fixing dates:', err);
  } finally {
    await pool.end();
  }
}

fixDates();
