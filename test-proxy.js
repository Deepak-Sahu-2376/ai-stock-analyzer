const ProxyChain = require('proxy-chain');
const server = new ProxyChain.Server({ port: 8001 });
server.listen(() => console.log('Proxy server is running on port 8001!'));
server.on('connectionClosed', ({ connectionId, stats }) => {
    console.log(`Connection ${connectionId} closed`);
});
server.on('requestFailed', ({ request, error }) => {
    console.error(`Request failed: ${error.message}`);
});
