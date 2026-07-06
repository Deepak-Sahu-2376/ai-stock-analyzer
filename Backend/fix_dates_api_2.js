const { pool } = require('./db');
const nseService = require('./nseService');

async function fixDatesApi2() {
  try {
    const { rows } = await pool.query('SELECT news_id, symbol FROM processed_order_announcements WHERE anndate IS NULL');
    console.log(`Found ${rows.length} records missing anndate. Fetching from NSE API...`);

    let updated = 0;
    for (const row of rows) {
      try {
        const nseData = await nseService.getSymbolAnnouncements(row.symbol);
        if (nseData && nseData.length > 0) {
          const match = nseData.find(d => d.seq_id == row.news_id);
          if (match && match.anndate) {
            await pool.query('UPDATE processed_order_announcements SET anndate = $1 WHERE news_id = $2', [match.anndate, row.news_id]);
            updated++;
            console.log(`Updated ${row.symbol} (${row.news_id}) with date ${match.anndate}`);
          } else {
             console.log(`No perfect match for ${row.symbol} in symbol announcements (news_id: ${row.news_id})`);
          }
        } else {
           console.log(`No data for ${row.symbol}`);
        }
      } catch (e) {
        console.error(`Error processing ${row.symbol}: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 500));
    }
    
    console.log(`Done! Updated ${updated} records.`);
  } catch (err) {
    console.error('Fatal Error:', err);
  } finally {
    await pool.end();
  }
}

fixDatesApi2();
