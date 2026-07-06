const { pool } = require('./db');
const nseService = require('./nseService');

async function fixDatesApi3() {
  try {
    const { rows } = await pool.query('SELECT news_id, symbol FROM processed_order_announcements WHERE anndate IS NULL');
    console.log(`Found ${rows.length} records missing anndate.`);

    const toDateObj = new Date();
    const fromDateObj = new Date();
    fromDateObj.setMonth(fromDateObj.getMonth() - 6);

    const formatDate = (date) => {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}-${m}-${y}`;
    };
    
    let updated = 0;
    for (const row of rows) {
      try {
        let nseData = await nseService.getIndexAnnouncements('equities', { 
          symbol: row.symbol,
          from_date: formatDate(fromDateObj),
          to_date: formatDate(toDateObj)
        });
        
        if (nseData && !Array.isArray(nseData) && nseData.data) {
          nseData = nseData.data;
        }

        if (Array.isArray(nseData) && nseData.length > 0) {
          const match = nseData.find(d => String(d.seq_id) === String(row.news_id));
          const actualDate = match ? (match.an_dt || match.anndate) : null;
          if (match && actualDate) {
            await pool.query('UPDATE processed_order_announcements SET anndate = $1 WHERE news_id = $2', [actualDate, row.news_id]);
            updated++;
            console.log(`Updated ${row.symbol} (${row.news_id}) with date ${actualDate}`);
          } else {
             const orderMatch = nseData.find(d => d.subject && d.subject.toLowerCase().includes('order'));
             const orderDate = orderMatch ? (orderMatch.an_dt || orderMatch.anndate) : null;
             if (orderMatch && orderDate) {
                console.log(`Matched by subject for ${row.symbol} (news_id: ${row.news_id}), date: ${orderDate}`);
                await pool.query('UPDATE processed_order_announcements SET anndate = $1 WHERE news_id = $2', [orderDate, row.news_id]);
                updated++;
             } else {
                console.log(`No perfect match for ${row.symbol} in symbol announcements (news_id: ${row.news_id})`);
             }
          }
        } else {
           console.log(`No data for ${row.symbol}`);
        }
      } catch (e) {
        console.error(`Error processing ${row.symbol}: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log(`Done! Updated ${updated} records.`);
  } catch (err) {
    console.error('Fatal Error:', err);
  } finally {
    await pool.end();
  }
}

fixDatesApi3();
