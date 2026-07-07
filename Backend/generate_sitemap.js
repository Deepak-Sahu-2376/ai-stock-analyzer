const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function generateSitemap() {
  try {
    const res = await pool.query('SELECT symbol FROM stocks');
    const stocks = res.rows;
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.deepaksahu.co.in/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.deepaksahu.co.in/markets</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.deepaksahu.co.in/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.deepaksahu.co.in/screener</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    for (let stock of stocks) {
      xml += `  <url>
    <loc>https://www.deepaksahu.co.in/quote/${encodeURIComponent(stock.symbol)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    }

    xml += `</urlset>`;

    const outputPath = path.join(__dirname, '../Frontend/public/sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`Sitemap generated successfully at ${outputPath} with ${stocks.length} stocks.`);
    process.exit(0);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    process.exit(1);
  }
}

generateSitemap();
