const { pool } = require('./db.js');
const axios = require('axios');

async function run() {
  const res = await pool.query('SELECT symbol FROM stock_financials WHERE market_cap IS NULL');
  console.log(`Found ${res.rows.length} stocks missing market_cap.`);
  
  for (let i = 0; i < res.rows.length; i++) {
    const symbol = res.rows[i].symbol;
    try {
      const response = await axios.get(`https://www.screener.in/company/${symbol}/`, {
        headers: { 'user-agent': 'Mozilla/5.0' }
      });
      const match = response.data.match(/Market Cap[\s\S]{0,100}?<span class="number">([^<]+)<\/span>/);
      if (match && match[1]) {
        const mc = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(mc)) {
          await pool.query('UPDATE stock_financials SET market_cap = $1 WHERE symbol = $2', [mc, symbol]);
          console.log(`Updated ${symbol}: ${mc}`);
        }
      }
    } catch (e) {
      console.log(`Failed ${symbol}`);
    }
  }
  console.log('Done');
  process.exit(0);
}
run();
