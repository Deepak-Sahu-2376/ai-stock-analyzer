const ProxyChain = require('proxy-chain');
const server = new ProxyChain.Server({ 
  host: '127.0.0.1', 
  port: 8000,
  prepareRequestFunction: ({ request }) => {
    console.log(`[Proxy] Request: ${request.method} ${request.url}`);
    return {};
  }
});
server.listen(() => console.log('Proxy server is running on port 8000!'));
