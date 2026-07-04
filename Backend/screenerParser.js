const { exec } = require('child_process');
const path = require('path');
const { pool } = require('./db');

const parseNumber = (val) => {
  if (!val || val === 'N/A' || val === '%') return null;
  const cleaned = val.toString().replace(/%/g, '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

const runScreenerAndSave = (symbol) => {
  return new Promise((resolve, reject) => {
    // Run the shell script
    const scriptPath = path.resolve(__dirname, '../Stock_Screener.sh');
    exec(`bash "${scriptPath}" "${symbol}"`, { cwd: path.resolve(__dirname, '../') }, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Screener error for ${symbol}: ${error}`);
        return reject({ error: 'Screener failed', details: stderr });
      }

      const lines = stdout.split('\n');
      const parsedData = [];
      let currentSection = null;

      const dbData = {
        symbol: symbol.toUpperCase(),
        sales_growth_10y: null, sales_growth_5y: null, sales_growth_3y: null, sales_growth_ttm: null,
        profit_growth_10y: null, profit_growth_5y: null, profit_growth_3y: null, profit_growth_ttm: null,
        cagr_10y: null, cagr_5y: null, cagr_3y: null, cagr_1y: null,
        roe_10y: null, roe_5y: null, roe_3y: null, roe_1y: null,
      };

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        if (line.startsWith('>>>') && line.endsWith('<<<')) {
          const title = line.replace('>>>', '').replace('<<<', '').trim();
          currentSection = { title, data: [] };
          parsedData.push(currentSection);
        } else if (line.startsWith('---')) {
          continue;
        } else if (line.includes('|')) {
          if (currentSection) {
            const parts = line.split('|');
            if (parts.length === 2) {
              const label = parts[0].trim().replace(/:$/, '');
              let value = parts[1].trim();
              
              if (label && value) {
                // Populate dbData based on section and label
                const numVal = parseNumber(value);
                const title = currentSection.title;
                
                if (title === 'Compounded Sales Growth') {
                  if (label === '10 Years') dbData.sales_growth_10y = numVal;
                  if (label === '5 Years') dbData.sales_growth_5y = numVal;
                  if (label === '3 Years') dbData.sales_growth_3y = numVal;
                  if (label === 'TTM') dbData.sales_growth_ttm = numVal;
                } else if (title === 'Compounded Profit Growth') {
                  if (label === '10 Years') dbData.profit_growth_10y = numVal;
                  if (label === '5 Years') dbData.profit_growth_5y = numVal;
                  if (label === '3 Years') dbData.profit_growth_3y = numVal;
                  if (label === 'TTM') dbData.profit_growth_ttm = numVal;
                } else if (title === 'Stock Price CAGR') {
                  if (label === '10 Years') dbData.cagr_10y = numVal;
                  if (label === '5 Years') dbData.cagr_5y = numVal;
                  if (label === '3 Years') dbData.cagr_3y = numVal;
                  if (label === '1 Year') dbData.cagr_1y = numVal;
                } else if (title === 'Return on Equity') {
                  if (label === '10 Years') dbData.roe_10y = numVal;
                  if (label === '5 Years') dbData.roe_5y = numVal;
                  if (label === '3 Years') dbData.roe_3y = numVal;
                  if (label === 'Last Year') dbData.roe_1y = numVal;
                }

                if (value === 'N/A') value = '%';
                currentSection.data.push({ label, value });
              }
            }
          }
        }
      }

      // Clean up duplicates if the bash script output them
      parsedData.forEach(section => {
        const uniqueData = [];
        const seenLabels = new Set();
        for (const item of section.data) {
          if (!seenLabels.has(item.label)) {
            seenLabels.add(item.label);
            uniqueData.push(item);
          }
        }
        section.data = uniqueData;
      });

      // Update Database
      try {
        const query = `
          INSERT INTO stock_financials (
            symbol, 
            sales_growth_10y, sales_growth_5y, sales_growth_3y, sales_growth_ttm,
            profit_growth_10y, profit_growth_5y, profit_growth_3y, profit_growth_ttm,
            cagr_10y, cagr_5y, cagr_3y, cagr_1y,
            roe_10y, roe_5y, roe_3y, roe_1y,
            last_updated
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
          ) ON CONFLICT (symbol) DO UPDATE SET 
            sales_growth_10y = EXCLUDED.sales_growth_10y,
            sales_growth_5y = EXCLUDED.sales_growth_5y,
            sales_growth_3y = EXCLUDED.sales_growth_3y,
            sales_growth_ttm = EXCLUDED.sales_growth_ttm,
            profit_growth_10y = EXCLUDED.profit_growth_10y,
            profit_growth_5y = EXCLUDED.profit_growth_5y,
            profit_growth_3y = EXCLUDED.profit_growth_3y,
            profit_growth_ttm = EXCLUDED.profit_growth_ttm,
            cagr_10y = EXCLUDED.cagr_10y,
            cagr_5y = EXCLUDED.cagr_5y,
            cagr_3y = EXCLUDED.cagr_3y,
            cagr_1y = EXCLUDED.cagr_1y,
            roe_10y = EXCLUDED.roe_10y,
            roe_5y = EXCLUDED.roe_5y,
            roe_3y = EXCLUDED.roe_3y,
            roe_1y = EXCLUDED.roe_1y,
            last_updated = NOW();
        `;

        const values = [
          dbData.symbol,
          dbData.sales_growth_10y, dbData.sales_growth_5y, dbData.sales_growth_3y, dbData.sales_growth_ttm,
          dbData.profit_growth_10y, dbData.profit_growth_5y, dbData.profit_growth_3y, dbData.profit_growth_ttm,
          dbData.cagr_10y, dbData.cagr_5y, dbData.cagr_3y, dbData.cagr_1y,
          dbData.roe_10y, dbData.roe_5y, dbData.roe_3y, dbData.roe_1y
        ];

        await pool.query(query, values);
        // console.log(`Successfully updated database for ${dbData.symbol}`);
      } catch (dbErr) {
        console.error(`Failed to update database for ${dbData.symbol}:`, dbErr.message);
      }

      resolve({ output: stdout, parsedData });
    });
  });
};

module.exports = {
  runScreenerAndSave
};
