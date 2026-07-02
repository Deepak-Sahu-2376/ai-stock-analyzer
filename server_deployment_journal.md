# Stock Island - Deployment & Architecture Journal

*Save this file! You can paste this journal into future AI chats to instantly give the AI full context about your server's architecture, workarounds, and deployment state.*

## 1. Core Architecture
- **Server:** Hostinger VPS (IP: `72.62.198.1`).
- **Domain:** `deepaksahu.co.in` and `www.deepaksahu.co.in`.
- **Nginx:** Configured to serve the Frontend React build directly and proxy API requests. We permanently deleted a rogue `sys-daemon` configuration from an old `AffiliatePro` project that was hijacking the domain.
- **SSL:** Secured with Let's Encrypt (`certbot`) to satisfy Cloudflare's Strict SSL requirements.
- **Process Manager (PM2):** Manages three active Stock Island processes:
  1. `si-backend`: Node.js Express API (Port 5150).
  2. `si-frontend`: (Static files served via Nginx, PM2 manages related build scripts if necessary).
  3. `si-ai-service`: Python FastAPI wrapper for Langchain & Ollama (Port 8000).

## 2. NSE 403 Firewall Bypass (Reverse SSH Tunnel)
**Problem:** The National Stock Exchange (NSE) blocks datacenter IPs (like Hostinger). When the backend tried to fetch live data, NSE returned a `403 Forbidden` error.
**Solution:** We turned your local laptop into a "Residential Proxy Node" and tunneled the server's requests backward through your laptop's internet connection.
- **Code Changes:** We injected `https-proxy-agent` into `nseService.js` to route `axios` calls through the proxy if `PROXY_URL` is defined in the `.env` file.
- **Server Config:** `.env` contains `PROXY_URL=http://localhost:8080`.

**How to Start the Tunnel (If the laptop restarts):**
Run these two commands in separate terminals on your local laptop:
1. Start local proxy: `npx proxy --port 8080`
2. Connect tunnel: `ssh -o ExitOnForwardFailure=yes -R 8080:localhost:8080 hostinger -N`
*(Only the NSE API requests use this tunnel. All other server traffic flows normally).*

## 3. Ollama & AI Summarization
**Problem:** `si-ai-service` was throwing `500 Internal Server Error` and Ollama was returning `401 Unauthorized` because it didn't have permission to pull the cloud model (e.g., `llama3.2:1b`).
**Solution:** We extracted the two generated `id_ed25519.pub` SSH keys from the Hostinger server's Ollama installations and added them directly to your Ollama.com account.
- **Ollama Ports:** Running locally on the server on ports `11434` and `11435`.
- **AI Service Port:** We updated the FastAPI service to strictly run on Port `8000` to perfectly match the hardcoded calls in `server.js`.

## 4. Current State
Everything is fully operational. Live data is routing through the laptop's proxy, AI models are pulling securely, and the frontend is resolving perfectly on the domain.
