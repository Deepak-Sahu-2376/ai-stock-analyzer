const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function test() {
  try {
    const res = await axios.get('https://www.nseindia.com/get-quote/equity?symbol=BAJAJ-AUTO', {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9' },
      timeout: 10000,
      httpsAgent: new HttpsProxyAgent('http://localhost:8000'),
      proxy: false
    });
    console.log("Status:", res.status);
    console.log("Cookies:", res.headers['set-cookie'] ? "Yes" : "No");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
