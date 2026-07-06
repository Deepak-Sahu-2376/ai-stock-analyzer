const { pool } = require('./db');
const nseService = require('./nseService');
const { runScreenerAndSave } = require('./screenerParser');

// The delay between each stock request in milliseconds (15 seconds)
const WORKER_INTERVAL_MS = 15000;

let isWorking = false;

const seedNifty500 = async () => {
  try {
    console.log('[Worker] Fetching NIFTY 500 components for seeding...');
    const indexData = await nseService.getEquityStockIndices('NIFTY 500');
    
    if (indexData && indexData.data && Array.isArray(indexData.data)) {
      const symbols = indexData.data
        .map(item => item.symbol)
        .filter(symbol => symbol && symbol !== 'NIFTY 500'); // exclude the index itself

      console.log(`[Worker] Found ${symbols.length} symbols. Seeding into database...`);
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const symbol of symbols) {
          // Insert missing symbols with NULL data
          await client.query(`
            INSERT INTO stock_financials (symbol)
            VALUES ($1)
            ON CONFLICT (symbol) DO NOTHING;
          `, [symbol]);
        }
        await client.query('COMMIT');
        console.log('[Worker] Database seeded successfully.');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Worker] Error seeding database:', err.message);
      } finally {
        client.release();
      }
    }
  } catch (error) {
    console.error('[Worker] Failed to fetch NIFTY 500 for seeding:', error.message);
  }
};

const processNextStock = async () => {
  if (isWorking) return;
  isWorking = true;

  try {
    // Find the oldest updated stock (or NULL)
    const result = await pool.query(`
      SELECT symbol FROM stock_financials 
      ORDER BY last_updated ASC NULLS FIRST 
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      // console.log('[Worker] No stocks found in database to process.');
      isWorking = false;
      return;
    }

    const symbolToProcess = result.rows[0].symbol;
    console.log(`[Worker] Processing ${symbolToProcess}...`);

    // Fetch market cap directly from Screener.in
    let marketCapCr = null;
    try {
      const axios = require('axios');
      const response = await axios.get(`https://www.screener.in/company/${symbolToProcess}/`, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36'
        }
      });
      const html = response.data;
      const match = html.match(/Market Cap[\s\S]{0,100}?<span class="number">([^<]+)<\/span>/);
      if (match && match[1]) {
        marketCapCr = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(marketCapCr)) {
          await pool.query(
            `UPDATE stock_financials SET market_cap = $1 WHERE symbol = $2`,
            [marketCapCr, symbolToProcess]
          );
        }
      }
    } catch (err) {
      console.error(`[Worker] Failed to fetch market cap for ${symbolToProcess} from Screener:`, err.message);
    }

    // Run screener parsing and DB upsert logic
    await runScreenerAndSave(symbolToProcess);
  } catch (error) {
    console.error(`[Worker] Error in processNextStock loop:`, error.message);
  } finally {
    isWorking = false;
  }
};

const startWorker = async () => {
  console.log('[Worker] Starting Golden Stocks background worker...');
  
  // Seed DB in the background
  seedNifty500();

  // Start the continuous loop
  setInterval(() => {
    processNextStock();
  }, WORKER_INTERVAL_MS);
};

module.exports = {
  startWorker
};
