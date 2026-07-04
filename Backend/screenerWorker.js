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

    // Run screener parsing and DB upsert logic
    await runScreenerAndSave(symbolToProcess);
    
    // console.log(`[Worker] Successfully updated ${symbolToProcess}`);
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
