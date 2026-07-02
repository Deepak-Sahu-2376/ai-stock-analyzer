#!/bin/bash
set -e

# Configuration
# Moved to a completely hidden directory. 
# Change ".secret-vault" to any random word only you know! (e.g. "/opt/.my-secret-xyz")
REPO_DIR="/opt/.secret-vault" 
DB_NAME="stocks_db"
DB_USER="stocks_user"
DB_PASS=$(openssl rand -hex 16) # Auto-generates a secure 32-character password
NODE_VERSION="20"
DOMAIN="www.deepaksahu.co.in"

echo "=========================================="
echo "   🚀 Stock Island Full Deployment Script   "
echo "=========================================="

echo "[0/8] Creating 16GB Swapfile to prevent AI Out-of-Memory crashes..."
if [ ! -f /swapfile ]; then
  sudo fallocate -l 16G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "16GB Swapfile created and enabled!"
else
  echo "Swapfile already exists. Skipping."
fi

# 1. Update and Install System Dependencies
echo "[1/7] Installing system dependencies (skipping full upgrade to protect existing projects)..."
sudo apt update
sudo apt install -y curl git python3-venv python3-pip postgresql postgresql-contrib build-essential nginx

# 2. Install Node.js and PM2 safely
echo "[2/7] Checking for Node.js and PM2..."
if ! command -v node &> /dev/null; then
  echo "Node.js not found. Installing (v${NODE_VERSION})..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "Node.js is already installed ($(node -v)). Skipping installation."
fi

if ! command -v pm2 &> /dev/null; then
  echo "PM2 not found. Installing..."
  sudo npm install -g pm2
else
  echo "PM2 is already installed. Skipping."
fi

# 3. Setup PostgreSQL
echo "[3/7] Configuring PostgreSQL (safely)..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
# We use DO blocks to avoid errors if the user/db already exists
sudo -u postgres psql -c "
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;" || true
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};" || true

# 4. Install Ollama and setup Multiple Instances (Round Robin)
echo "[4/7] Checking for Ollama..."
if ! command -v ollama &> /dev/null; then
  echo "Ollama not found. Installing..."
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo "Ollama is already installed. Skipping base installation."
fi

# Configure primary Ollama instance (Port 11434)
sudo mkdir -p /etc/systemd/system/ollama.service.d
echo "[Service]
Environment=\"OLLAMA_HOST=0.0.0.0:11434\"" | sudo tee /etc/systemd/system/ollama.service.d/override.conf

# Create secondary Ollama instance (Port 11435)
sudo cp /etc/systemd/system/ollama.service /etc/systemd/system/ollama2.service
sudo sed -i 's/Description=Ollama Service/Description=Ollama Secondary Service/g' /etc/systemd/system/ollama2.service
sudo mkdir -p /etc/systemd/system/ollama2.service.d
sudo mkdir -p /var/lib/ollama2
sudo chown ollama:ollama /var/lib/ollama2

echo "[Service]
Environment=\"OLLAMA_HOST=0.0.0.0:11435\"
Environment=\"OLLAMA_MODELS=/var/lib/ollama2\"
Environment=\"HOME=/var/lib/ollama2\"" | sudo tee /etc/systemd/system/ollama2.service.d/override.conf

# Reload daemon and start Ollama services
sudo systemctl daemon-reload
sudo systemctl enable ollama ollama2
sudo systemctl restart ollama ollama2

echo "Waiting for Ollama to generate keys..."
sleep 5

echo "=========================================="
echo " 🔑 OLLAMA AUTHENTICATION REQUIRED"
echo "=========================================="
echo "You requested multiple Ollama instances using different accounts (emails)."
echo "Please add the following public keys to your respective Ollama accounts at https://ollama.com/settings/keys"
echo ""
echo "INSTANCE 1 (Port 11434):"
sudo cat /usr/share/ollama/.ollama/id_ed25519.pub || echo "(Key not found yet)"
echo ""
echo "INSTANCE 2 (Port 11435):"
sudo cat /var/lib/ollama2/.ollama/id_ed25519.pub || echo "(Key not found yet)"
echo ""
echo "Skipping interactive pause for Ollama keys. Please register them manually later."

echo "Pulling models... (this might take a while)"
# Pull models for both instances
ollama run nemotron-3-nano:30b-cloud &
OLLAMA_HOST="http://127.0.0.1:11435" ollama run nemotron-3-nano:30b-cloud &
wait

# 5. Setup Project Codebase
echo "[5/7] Setting up the project..."
# Note: If deploying from git, you'd clone it here:
# git clone <YOUR_REPO_URL> $REPO_DIR
# cd $REPO_DIR

# 6. Install Project Dependencies
echo "[6/7] Installing Backend and Frontend dependencies..."
cd Backend
npm install
# Create .env file for Backend if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env template..."
  echo "# ==========================" > .env
  echo "# Database Configuration" >> .env
  echo "# ==========================" >> .env
  echo "DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}" >> .env
  echo "# Using 5005 to avoid collisions with other projects on a shared server" >> .env
  echo "PORT=5005" >> .env
  echo "" >> .env
  
  echo "# ==========================" >> .env
  echo "# Security & Authentication" >> .env
  echo "# ==========================" >> .env
  echo "# Auto-generated 32-byte secure key for user sessions" >> .env
  echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
  echo "" >> .env
  
  echo "# ==========================" >> .env
  echo "# App Settings & URLs" >> .env
  echo "# ==========================" >> .env
  echo "# The public URL of your frontend (e.g. https://www.deepaksahu.co.in)" >> .env
  echo "FRONTEND_URL=http://your-domain.com" >> .env
  echo "" >> .env
  
  echo "# ==========================" >> .env
  echo "# Email Configuration (Nodemailer)" >> .env
  echo "# ==========================" >> .env
  echo "# Used for sending forgot password emails and alerts" >> .env
  echo "EMAIL_USER=your-email@gmail.com" >> .env
  echo "EMAIL_PASS=your-app-password" >> .env
  echo "" >> .env
  
  echo "# ==========================" >> .env
  echo "# Web Push Notifications (VAPID)" >> .env
  echo "# ==========================" >> .env
  echo "# Generate these using: npx web-push generate-vapid-keys" >> .env
  echo "VAPID_PUBLIC_KEY=" >> .env
  echo "VAPID_PRIVATE_KEY=" >> .env
  echo "" >> .env
  
  echo "# ==========================" >> .env
  echo "# AI Providers" >> .env
  echo "# ==========================" >> .env
  echo "# Google Gemini API key for cloud AI generation" >> .env
  echo "GEMINI_API_KEY=" >> .env
  echo "" >> .env
  
  echo "# ==========================" >> .env
  echo "# Default Admin Account" >> .env
  echo "# ==========================" >> .env
  echo "ADMIN_EMAIL=admin@stockisland.com" >> .env
  echo "ADMIN_PASSWORD=Admin@123" >> .env
fi

echo "=========================================="
echo " ⚙️ ENVIRONMENT CONFIGURATION REQUIRED"
echo "=========================================="
echo "A .env file has been generated in the Backend directory."
echo "You must configure your API keys, email passwords, and Frontend URL before starting the app."
echo ""
echo "Skipping interactive nano since this is an automated deployment."
cd ..

cd Frontend
npm install
npm run build
cd ..

echo "Setting up AI Service (Python)..."
cd AIService
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# 7. Start Services via PM2
echo "[7/7] Starting services with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup | sudo bash || true

echo "[8/8] Configuring Nginx Reverse Proxy..."
sudo bash -c "cat > /etc/nginx/sites-available/stock-island << 'EOF'
server {
    listen 80;
    server_name ${DOMAIN};

    # Serve built frontend statically
    root ${REPO_DIR}/Frontend/dist;
    index index.html index.htm;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy backend API requests
    location /api/ {
        proxy_pass http://localhost:5005/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF"

sudo ln -sf /etc/nginx/sites-available/stock-island /etc/nginx/sites-enabled/
# Remove default nginx site if it conflicts
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl reload nginx

# Enforce strict privacy permissions on the project folder
echo "Securing project directory..."
sudo chown -R \$USER:\$USER ${REPO_DIR}
sudo chmod -R 700 ${REPO_DIR}
# Make sure Nginx can read the Frontend dist folder to serve it
sudo chmod 755 ${REPO_DIR}
sudo chmod 755 ${REPO_DIR}/Frontend
sudo chmod -R 755 ${REPO_DIR}/Frontend/dist

echo "=========================================="
echo " 🎉 Deployment Complete!"
echo " Services managed by PM2. Run 'pm2 status' to view them."
echo " Your site is now live at http://${DOMAIN}"
echo "=========================================="
