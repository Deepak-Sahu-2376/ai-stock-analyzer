#!/bin/bash
echo "Starting local Proxy Server on port 8000..."
# Run the proxy server in the background
node /home/deepak-sahu/Stocks/proxy.js &
PROXY_PID=$!

echo "Establishing SSH Reverse Tunnel to Hostinger (Port 8888 -> Local 8000)..."
echo "Automatically opening PM2 logs for si-backend..."

# Start the SSH tunnel and immediately run pm2 logs inside it
# The -t flag forces pseudo-terminal allocation so the logs stream correctly
ssh -t -R 8888:localhost:8000 hostinger "pm2 logs si-backend"

# When the user exits the SSH session (Ctrl+C), kill the background proxy server
echo -e "\nDisconnected. Shutting down local proxy..."
kill $PROXY_PID
