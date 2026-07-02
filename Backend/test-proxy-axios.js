const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function test() {
  try {
    console.log("Fetching through proxy...");
    const res = await axios.get('https://www.nseindia.com/api/allIndices', {
      headers: { 'User-Agent': USER_AGENT, 'Accept': '*/*' },
      timeout: 10000,
      httpsAgent: new HttpsProxyAgent('http://localhost:8000'),
      proxy: false
    });
    console.log("Status:", res.status);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
