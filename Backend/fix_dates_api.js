const { pool } = require('./db');
const nseService = require('./nseService');

async function fixDatesApi() {
  try {
    const { rows } = await pool.query('SELECT news_id, symbol FROM processed_order_announcements WHERE anndate IS NULL');
    console.log(`Found ${rows.length} records missing anndate. Fetching from NSE API...`);

    let updated = 0;
    for (const row of rows) {
      try {
        const nseData = await nseService.getIndexAnnouncements('equities', { 
          symbol: row.symbol, 
          subject: 'Awarding of order(s)/contract(s)'
        });
        if (nseData && nseData.length > 0) {
          const match = nseData.find(d => d.seq_id === row.news_id);
          if (match && match.anndate) {
            await pool.query('UPDATE processed_order_announcements SET anndate = $1 WHERE news_id = $2', [match.anndate, row.news_id]);
            updated++;
            console.log(`Updated ${row.symbol} (${row.news_id}) with date ${match.anndate}`);
          } else {
             // Try to just get the latest one if seq_id doesn't match perfectly
             console.log(`No perfect match for ${row.symbol} - ${row.news_id}, setting to latest anndate: ${nseData[0].anndate}`);
             await pool.query('UPDATE processed_order_announcements SET anndate = $1 WHERE news_id = $2', [nseData[0].anndate, row.news_id]);
             updated++;
          }
        }
      } catch (e) {
        console.error(`Error processing ${row.symbol}: ${e.message}`);
      }
      // Wait a bit to not overwhelm the API
      await new Promise(r => setTimeout(r, 500));
    }
    
    console.log(`Done! Updated ${updated} records.`);
  } catch (err) {
    console.error('Fatal Error:', err);
  } finally {
    await pool.end();
  }
}

fixDatesApi();
