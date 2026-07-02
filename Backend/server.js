const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { initializeDB, pool, seedUserPortfolio } = require('./db');
const nseService = require('./nseService');
const webpush = require('web-push');

let aiRoundRobinIndex = 0;
async function recordAiUsageStat(endpoint) {
  try {
    await pool.query(`
      INSERT INTO ai_usage_stats (endpoint, success_count, last_used) 
      VALUES ($1, 1, NOW())
      ON CONFLICT (endpoint) 
      DO UPDATE SET success_count = ai_usage_stats.success_count + 1, last_used = NOW()
    `, [endpoint]);
  } catch (err) {
    console.error('Failed to record AI usage stat:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'securejwtsecrettokenstocksapp';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@stockisland.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Middleware
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*';
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// JWT Verification Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const userRes = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0 || userRes.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('requireAdmin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

let appSettingsCache = {
  maintenance_mode: false,
  alerts_interval_min: 1,
  announcements_interval_min: 5,
  corp_action_interval_min: 10
};

const refreshAppSettings = async () => {
  try {
    const res = await pool.query('SELECT * FROM app_settings LIMIT 1');
    if (res.rows.length > 0) {
      appSettingsCache = res.rows[0];
    }
  } catch (e) {
    console.error('Failed to load app settings:', e);
  }
};

const checkMaintenanceMode = (req, res, next) => {
  if (appSettingsCache.maintenance_mode) {
    // Allow auth and admin routes to pass through so admin can login and disable it
    if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
      return next();
    }
    return res.status(503).json({ error: 'Service is currently down for maintenance.' });
  }
  next();
};

app.use(checkMaintenanceMode);

global.workerStatus = {
  alerts: { lastRun: null, status: 'idle' },
  announcements: { lastRun: null, status: 'idle' },
  corpActions: { lastRun: null, status: 'idle' }
};

// ---------------- ADMIN ROUTES ----------------
app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await pool.query('SELECT * FROM ai_settings LIMIT 1');
    if (settings.rows.length === 0) {
      return res.json({ 
        provider: 'gemini', 
        gemini_keys: [], 
        active_gemini_key: '', 
        ollama_url: 'http://localhost:11434', 
        ollama_models: ['gpt-oss:20b-cloud'],
        active_ollama_model: 'gpt-oss:20b-cloud'
      });
    }
    const data = settings.rows[0];
    data.gemini_keys = data.gemini_keys || [];
    data.ollama_models = data.ollama_models || ['gpt-oss:20b-cloud'];
    res.json(data);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ error: 'Server error fetching settings' });
  }
});

app.post('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
  const { provider, gemini_keys, active_gemini_key, ollama_url, ollama_models, active_ollama_model } = req.body;
  try {
    const check = await pool.query('SELECT COUNT(*) FROM ai_settings');
    if (parseInt(check.rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO ai_settings (provider, gemini_keys, active_gemini_key, ollama_url, ollama_models, active_ollama_model) VALUES ($1, $2, $3, $4, $5, $6)',
        [provider, JSON.stringify(gemini_keys || []), active_gemini_key, ollama_url, JSON.stringify(ollama_models || ['gpt-oss:20b-cloud']), active_ollama_model]
      );
    } else {
      await pool.query(
        'UPDATE ai_settings SET provider = $1, gemini_keys = $2, active_gemini_key = $3, ollama_url = $4, ollama_models = $5, active_ollama_model = $6',
        [provider, JSON.stringify(gemini_keys || []), active_gemini_key, ollama_url, JSON.stringify(ollama_models || ['gpt-oss:20b-cloud']), active_ollama_model]
      );
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({ error: 'Server error updating settings' });
  }
});

app.post('/api/admin/ai/test', authenticateToken, requireAdmin, async (req, res) => {
  const { provider, active_gemini_key, ollama_url, active_ollama_model } = req.body;
  try {
    if (provider === 'gemini') {
      if (!active_gemini_key) return res.status(400).json({ error: 'No Gemini key provided' });
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: active_gemini_key });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Reply with exactly the word "SUCCESS" if you receive this.'
      });
      res.json({ message: 'Gemini connection successful!', response: result.text.trim() });
    } else if (provider === 'ollama') {
      if (!ollama_url || !active_ollama_model) return res.status(400).json({ error: 'Missing Ollama URL or Model' });
      const axios = require('axios');
      const result = await axios.post(`${ollama_url}/api/generate`, {
        model: active_ollama_model,
        prompt: 'Reply with exactly the word "SUCCESS" if you receive this.',
        stream: false
      }, { timeout: 15000 });
      res.json({ message: 'Ollama connection successful!', response: result.data.response.trim() });
    } else {
      res.status(400).json({ error: 'Unknown provider' });
    }
  } catch (error) {
    console.error('AI Test Error:', error.message);
    res.status(500).json({ error: `Connection failed: ${error.message}` });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

app.post('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating role' });
  }
});

app.get('/api/admin/ai-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT endpoint, success_count, last_used FROM ai_usage_stats ORDER BY success_count DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching AI stats' });
  }
});

app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const aiCountRes = await pool.query('SELECT COUNT(*) FROM processed_announcements WHERE ai_summary IS NOT NULL');
    const alertsCountRes = await pool.query('SELECT COUNT(*) FROM alerts WHERE status = $1', ['ACTIVE']);
    const topWishlistRes = await pool.query('SELECT symbol, COUNT(*) as count FROM wishlists GROUP BY symbol ORDER BY count DESC LIMIT 5');
    
    res.json({
      aiSummaries: parseInt(aiCountRes.rows[0].count),
      activeAlerts: parseInt(alertsCountRes.rows[0].count),
      topWishlisted: topWishlistRes.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
});

app.get('/api/admin/system/status', authenticateToken, requireAdmin, (req, res) => {
  res.json(global.workerStatus);
});

app.get('/api/admin/app-settings', authenticateToken, requireAdmin, async (req, res) => {
  res.json(appSettingsCache);
});

app.post('/api/admin/app-settings', authenticateToken, requireAdmin, async (req, res) => {
  const { maintenance_mode, alerts_interval_min, announcements_interval_min, corp_action_interval_min, summarize_all_announcements } = req.body;
  try {
    await pool.query(
      'UPDATE app_settings SET maintenance_mode = $1, alerts_interval_min = $2, announcements_interval_min = $3, corp_action_interval_min = $4, summarize_all_announcements = $5',
      [maintenance_mode, alerts_interval_min, announcements_interval_min, corp_action_interval_min, summarize_all_announcements]
    );
    await refreshAppSettings();
    res.json({ message: 'App settings updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating app settings' });
  }
});

app.post('/api/admin/broadcast', authenticateToken, requireAdmin, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
  
  res.json({ message: 'Broadcast initiated' });
  
  try {
    const subsRes = await pool.query('SELECT * FROM push_subscriptions');
    const payload = JSON.stringify({ title, body });
    for (const sub of subsRes.rows) {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
      };
      await webpush.sendNotification(pushConfig, payload).catch(async (e) => {
        if (e.statusCode === 410 || e.statusCode === 404) {
          await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
        }
      });
    }
  } catch (e) {
    console.error('Broadcast error:', e);
  }
});

// ---------------- AUTH ROUTES ----------------

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP Route
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the OTP in the database (replace existing if any)
    await pool.query('DELETE FROM otps WHERE email = $1', [email]);
    await pool.query('INSERT INTO otps (email, otp) VALUES ($1, $2)', [email, otp]);

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Stock Island Verification OTP',
      text: `Your OTP for account registration is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ error: 'Failed to send OTP email. Make sure App Password is configured.' });
      }
      res.json({ message: 'OTP sent successfully' });
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Server error generating OTP' });
  }
});

// Forgot Password OTP
app.post('/api/auth/forgot-password-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await pool.query('DELETE FROM otps WHERE email = $1', [email]);
    await pool.query('INSERT INTO otps (email, otp) VALUES ($1, $2)', [email, otp]);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Stock Island Password Reset OTP',
      text: `Your OTP to reset your password is: ${otp}\nIf you did not request this, please ignore this email.`
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending forgot password OTP email:', error);
        return res.status(500).json({ error: 'Failed to send OTP email.' });
      }
      res.json({ message: 'OTP sent successfully' });
    });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    res.status(500).json({ error: 'Server error generating OTP' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }

  try {
    const otpCheck = await pool.query('SELECT * FROM otps WHERE email = $1 AND otp = $2', [email, otp]);
    if (otpCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [passwordHash, email]);
    await pool.query('DELETE FROM otps WHERE email = $1', [email]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error resetting password' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, otp } = req.body;
  if (!email || !password || !otp) {
    return res.status(400).json({ error: 'Email, password, and OTP are required' });
  }

  try {
    // Check OTP
    const otpCheck = await pool.query('SELECT * FROM otps WHERE email = $1 AND otp = $2', [email, otp]);
    if (otpCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if user already exists (just in case)
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name || '']
    );

    const userId = newUser.rows[0].id;

    // Delete used OTP
    await pool.query('DELETE FROM otps WHERE email = $1', [email]);

    // Seed initial portfolio data (Holdings, Positions, Alerts) for demonstration
    await seedUserPortfolio(userId);

    // Generate JWT token
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userRes = await pool.query('SELECT id, email, name, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(userRes.rows[0]);
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Server error checking profile' });
  }
});

// ---------------- PUSH NOTIFICATIONS ----------------
app.get('/api/push/vapidPublicKey', (req, res) => {
  res.send(process.env.VAPID_PUBLIC_KEY);
});

app.post('/api/push/test', authenticateToken, async (req, res) => {
  try {
    const subsRes = await pool.query('SELECT * FROM push_subscriptions WHERE user_id = $1', [req.user.id]);
    if (subsRes.rows.length === 0) {
      return res.status(404).json({ error: 'No push subscriptions found for this user.' });
    }

    const payload = JSON.stringify({
      title: 'Test Notification',
      body: 'Your push notifications are working perfectly! You will receive alerts here.',
      url: '/dashboard'
    });

    const sendPromises = subsRes.rows.map(sub => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
      };
      return webpush.sendNotification(pushSub, payload).catch(err => {
        console.error('Test Push Error:', err);
        if (err.statusCode === 404 || err.statusCode === 410) {
          return pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
        }
      });
    });

    await Promise.all(sendPromises);
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Error sending test push:', error);
    res.status(500).json({ error: 'Failed to send test push' });
  }
});

app.post('/api/push/subscribe', authenticateToken, async (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  try {
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, endpoint) DO NOTHING`,
      [req.user.id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );
    res.status(201).json({});
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Server error saving subscription' });
  }
});

// ---------------- NSE PROXY ROUTES ----------------

// Market Status (Pre-Open status)
app.get('/api/stocks/market-status', async (req, res) => {
  try {
    const data = await nseService.getPreOpenMarketStatus();
    res.json(data);
  } catch (error) {
    console.warn('NSE market status request failed, returning mock status.');
    res.json({
      marketState: [
        {
          market: 'Capital Market',
          marketStatus: 'Open',
          tradeDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        }
      ]
    });
  }
});

// ---------------- WISHLIST ROUTES ----------------

// Get user's wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wishlists WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Toggle stock in wishlist
app.post('/api/wishlist/toggle', authenticateToken, async (req, res) => {
  const { symbol, companyName } = req.body;
  if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

  try {
    const existing = await pool.query('SELECT * FROM wishlists WHERE user_id = $1 AND symbol = $2', [req.user.id, symbol]);
    
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM wishlists WHERE user_id = $1 AND symbol = $2', [req.user.id, symbol]);
      res.json({ message: 'Removed from wishlist', status: 'removed' });
    } else {
      await pool.query('INSERT INTO wishlists (user_id, symbol, company_name) VALUES ($1, $2, $3)', [req.user.id, symbol, companyName || symbol]);
      res.json({ message: 'Added to wishlist', status: 'added' });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

// ---------------- ALERTS ROUTES ----------------

// Get ALL alerts for a user (Global view)
app.get('/api/alerts/all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});


// Get alerts for specific symbol
app.get('/api/alerts/:symbol', authenticateToken, async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const result = await pool.query('SELECT * FROM alerts WHERE user_id = $1 AND symbol = $2 ORDER BY created_at DESC', [req.user.id, symbol]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching symbol alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts for symbol' });
  }
});

// Broad indices (getIndexData)
app.get('/api/stocks/indices', async (req, res) => {
  try {
    const type = req.query.type || 'All';
    const data = await nseService.getIndexData(type);
    res.json(data);
  } catch (error) {
    console.warn('NSE indices request failed, returning fallback indexes list.');
    // Mock indices fallback
    res.json({
      data: [
        { indexName: 'NIFTY 50', last: 23500.20, pChange: 0.85, open: 23350, high: 23550, low: 23300, prevClose: 23302.20 },
        { indexName: 'NIFTY BANK', last: 51200.50, pChange: 1.20, open: 50800, high: 51300, low: 50700, prevClose: 50593.30 },
        { indexName: 'NIFTY NEXT 50', last: 64500.10, pChange: -0.15, open: 64650, high: 64700, low: 64300, prevClose: 64597.10 },
        { indexName: 'NIFTY MIDCAP 50', last: 14200.00, pChange: 0.45, open: 14100, high: 14250, low: 14100, prevClose: 14136.35 }
      ]
    });
  }
});

// Heatmap symbols
app.get('/api/stocks/heatmap-symbols', async (req, res) => {
  try {
    const { type, indices } = req.query;
    const data = await nseService.getHeatmapSymbols(type, indices);
    res.json(data);
  } catch (error) {
    console.warn('NSE heatmap symbols request failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch heatmap symbols', details: error.message });
  }
});

// Gift Nifty Index
app.get('/api/stocks/giftnifty', async (req, res) => {
  try {
    const data = await nseService.getGiftNifty();
    res.json(data);
  } catch (error) {
    console.warn('NSE Gift Nifty request failed, returning mock fallback.');
    res.json({
      data: {
        indexName: 'GIFT NIFTY',
        last: 23620.00,
        change: 110.50,
        pChange: 0.47
      }
    });
  }
});

// Helper to format Index data into a pseudo-quote structure
async function getIndexPseudoQuote(symbol) {
  try {
    const allIndices = await nseService.getIndexData('All');
    if (!allIndices || !allIndices.data) return null;

    const aliases = {
      'BANKNIFTY': 'NIFTY BANK',
      'NIFTY': 'NIFTY 50',
      'NIFTYIT': 'NIFTY IT'
    };
    const targetName = aliases[symbol] || symbol;

    const match = allIndices.data.find(d =>
      (d.indexSymbol || '').toUpperCase() === targetName ||
      (d.indexName || '').toUpperCase() === targetName ||
      (d.indexName || '').toUpperCase().replace(/\s+/g, '') === targetName ||
      (d.indexName || '').toUpperCase().replace(/\s+/g, '') === symbol
    );
    if (match) {
      return {
        match,
        priceInfo: {
          lastPrice: match.last,
          change: match.last - match.previousClose,
          pChange: match.percChange,
          previousClose: match.previousClose,
          open: match.open,
          dayHigh: match.high,
          dayLow: match.low,
          close: match.last
        }
      };
    }
  } catch (e) { }
  return null;
}

// Simple in-memory cache for static stock data
const cache = new Map();

// Consolidated Stock Details (Quote) Proxy Endpoint
app.get('/api/stocks/quote/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    // Check if it's an index first
    const indexData = await getIndexPseudoQuote(symbol);
    if (indexData) {
      return res.json({
        symbol: indexData.match.indexName,
        name: indexData.match.indexName,
        meta: { companyName: indexData.match.indexName, activeSeries: ['EQ'] },
        priceInfo: indexData.priceInfo,
        yearwise: null,
        indices: null,
        corpAction: null,
        announcements: null
      });
    }

    const now = Date.now();
    let staticData = cache.get(symbol);

    if (!staticData || now - staticData.timestamp > 300000) {
      // Fetch metadata first to get the correct series
      const metaDataPromise = nseService.getMetaData(symbol);
      const nameDataPromise = nseService.getSymbolName(symbol);

      const metaDataResult = await Promise.allSettled([metaDataPromise]);
      let metaData = null;
      let series = 'EQ';

      if (metaDataResult[0].status === 'fulfilled' && metaDataResult[0].value) {
        metaData = metaDataResult[0].value;
        if (metaData.activeSeries && metaData.activeSeries.length > 0) {
          series = metaData.activeSeries[0];
        }
      }

      const [nameData, yearwiseData, indexList, corpActionData, corpAnnounceData] = await Promise.allSettled([
        nameDataPromise,
        nseService.getYearwiseData(symbol),
        nseService.getIndexList(symbol),
        nseService.getCorpAction(symbol),
        nseService.getCorporateAnnouncement(symbol)
      ]);

      staticData = {
        timestamp: now,
        series,
        meta: metaData,
        name: nameData.status === 'fulfilled' && nameData.value ? nameData.value.companyName : `${symbol} Industries Ltd.`,
        yearwise: yearwiseData.status === 'fulfilled' ? yearwiseData.value : null,
        indices: indexList.status === 'fulfilled' ? indexList.value : null,
        corpAction: corpActionData.status === 'fulfilled' ? corpActionData.value : null,
        announcements: corpAnnounceData.status === 'fulfilled' ? corpAnnounceData.value : null
      };

      cache.set(symbol, staticData);
    }

    // Always fetch the live price/orderbook uncached
    const symbolData = await nseService.getSymbolData(symbol, staticData.series).catch(() => null);

    const result = {
      symbol,
      name: staticData.name,
      meta: staticData.meta,
      priceInfo: symbolData || null,
      yearwise: staticData.yearwise,
      indices: staticData.indices,
      corpAction: staticData.corpAction,
      announcements: staticData.announcements
    };

    res.json(result);
  } catch (error) {
    console.error(`NSE quote request failed for ${symbol}:`, error.message);
    res.status(500).json({ error: 'NSE API Failed', details: error.message });
  }
});

// Lightweight Orderbook endpoint to be polled without overloading the server
app.get('/api/stocks/orderbook/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const series = req.query.series || 'EQ';
  try {
    // Check if index
    const indexData = await getIndexPseudoQuote(symbol);
    if (indexData) {
      return res.json({ orderBook: null, priceInfo: indexData.priceInfo });
    }

    const symbolData = await nseService.getSymbolData(symbol, series);
    res.json({
      orderBook: symbolData?.equityResponse?.[0]?.orderBook || symbolData?.marketDeptOrderBook || null,
      priceInfo: symbolData
    });
  } catch (error) {
    console.error(`NSE orderbook request failed for ${symbol}:`, error.message);
    res.status(500).json({ error: 'NSE API Failed', details: error.message });
  }
});

// Global Search Proxy Endpoint
app.get('/api/stocks/search', async (req, res) => {
  const q = req.query.q;
  const filter = req.query.filter || 'equity';
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }
  try {
    const data = await nseService.getSearchSymbol(q, filter);
    res.json(data);
  } catch (error) {
    console.error(`NSE search request failed for ${q}:`, error.message);
    res.status(500).json({ error: 'NSE API Failed', details: error.message });
  }
});

// Peer Comparison Quarters Endpoint
app.get('/api/stocks/peers/:symbol/quarters', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const data = await nseService.getPeerComparisonQuaters(symbol);
    res.json(data);
  } catch (error) {
    console.error(`NSE peer quarters request failed for ${symbol}:`, error.message);
    res.status(500).json({ error: 'NSE API Failed', details: error.message });
  }
});

// Peer Comparison Indices Endpoint
app.get('/api/stocks/peers/:symbol/indices', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    const data = await nseService.getIndexList(symbol);
    res.json(data);
  } catch (error) {
    console.error(`NSE peer indices request failed for ${symbol}:`, error.message);
    res.status(500).json({ error: 'NSE API Failed', details: error.message });
  }
});

// Peer Comparison Endpoint
app.get('/api/stocks/peers/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const { type = 'S', quarter = '', param = 'industry', index = '' } = req.query;
  try {
    const data = await nseService.getPeerComparisonData(symbol, { type, quarter, param, index });
    res.json(data);
  } catch (error) {
    console.error(`NSE peer comparison request failed for ${symbol}:`, error.message);
    res.status(500).json({ error: 'NSE API Failed', details: error.message });
  }
});

// Stock 1D Chart proxy
app.get('/api/stocks/chart/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const { days = '1D' } = req.query;

  try {
    const metaDataResult = await nseService.getMetaData(symbol).catch(() => null);
    let series = 'EQ';
    if (metaDataResult && metaDataResult.activeSeries && metaDataResult.activeSeries.length > 0) {
      series = metaDataResult.activeSeries[0];
    }

    const data = await nseService.getSymbolChartData(symbol, days, series);
    res.json(data);
  } catch (error) {
    console.error(`NSE chart request failed for ${symbol}:`, error.message);
    res.status(500).json({ error: 'NSE API Failed', details: error.message });
  }
});

// Candlestick Charts Historical proxy
app.get('/api/stocks/candles/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const timeInterval = parseInt(req.query.timeInterval) || 5;
  const daysLimit = parseInt(req.query.daysLimit) || 30;

  try {
    const metaDataResult = await nseService.getMetaData(symbol).catch(() => null);
    let series = 'EQ';
    if (metaDataResult && metaDataResult.activeSeries && metaDataResult.activeSeries.length > 0) {
      series = metaDataResult.activeSeries[0];
    }

    const data = await nseService.getSymbolHistoricalData(symbol, timeInterval, daysLimit, series);
    res.json(data);
  } catch (error) {
    console.error(`NSE historical candles failed for ${symbol}:`, error.message);
    res.status(500).json({ error: 'NSE API Failed', details: error.message });
  }
});


// ---------------- PORTFOLIO ROUTES ----------------

// Get user holdings
app.get('/api/portfolio/holdings', authenticateToken, async (req, res) => {
  try {
    const holdings = await pool.query(
      'SELECT id, symbol, company_name as "companyName", quantity, buy_price as "buyPrice" FROM holdings WHERE user_id = $1 ORDER BY symbol',
      [req.user.id]
    );
    res.json(holdings.rows);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ error: 'Server error fetching holdings' });
  }
});

// Get user positions
app.get('/api/portfolio/positions', authenticateToken, async (req, res) => {
  try {
    const positions = await pool.query(
      'SELECT id, symbol, quantity, buy_price as "buyPrice", type, product FROM positions WHERE user_id = $1 ORDER BY id DESC',
      [req.user.id]
    );
    res.json(positions.rows);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Server error fetching positions' });
  }
});

// Order Execution Endpoint (Buy/Sell Trade placement)
app.post('/api/portfolio/trade', authenticateToken, async (req, res) => {
  const { symbol, companyName, quantity, price, type, product } = req.body; // type: 'BUY' or 'SELL', product: 'MIS' or 'CNC'

  if (!symbol || !quantity || !price || !type) {
    return res.status(400).json({ error: 'Missing required trade details' });
  }

  const qty = parseInt(quantity);
  const tradePrice = parseFloat(price);

  if (qty <= 0) {
    return res.status(400).json({ error: 'Quantity must be positive' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Record trade in positions table
    const tradeQty = type === 'BUY' ? qty : -qty;
    await client.query(
      'INSERT INTO positions (user_id, symbol, quantity, buy_price, type, product) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user.id, symbol, tradeQty, tradePrice, type, product || 'MIS']
    );

    // 2. If it's a Delivery (CNC) trade, we also update the holdings table
    if (product === 'CNC') {
      const holdingRes = await client.query(
        'SELECT * FROM holdings WHERE user_id = $1 AND symbol = $2',
        [req.user.id, symbol]
      );

      if (type === 'BUY') {
        if (holdingRes.rows.length > 0) {
          // Average pricing update
          const existing = holdingRes.rows[0];
          const newQty = existing.quantity + qty;
          const newBuyPrice = ((parseFloat(existing.buy_price) * existing.quantity) + (tradePrice * qty)) / newQty;

          await client.query(
            'UPDATE holdings SET quantity = $1, buy_price = $2 WHERE id = $3',
            [newQty, newBuyPrice, existing.id]
          );
        } else {
          // Create new holding
          await client.query(
            'INSERT INTO holdings (user_id, symbol, company_name, quantity, buy_price) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, symbol, companyName || `${symbol} Ltd.`, qty, tradePrice]
          );
        }
      } else if (type === 'SELL') {
        if (holdingRes.rows.length === 0 || holdingRes.rows[0].quantity < qty) {
          throw new Error('Insufficient holdings to sell');
        }

        const existing = holdingRes.rows[0];
        const newQty = existing.quantity - qty;

        if (newQty === 0) {
          await client.query('DELETE FROM holdings WHERE id = $1', [existing.id]);
        } else {
          await client.query('UPDATE holdings SET quantity = $1 WHERE id = $2', [newQty, existing.id]);
        }
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Order executed successfully', order: { symbol, quantity: qty, price: tradePrice, type, product } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Trade error:', error.message);
    res.status(400).json({ error: error.message || 'Server error placing order' });
  } finally {
    client.release();
  }
});


// ---------------- ALERTS ROUTES ----------------

// Get user active alerts
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await pool.query(
      'SELECT id, symbol, target_price as "targetPrice", condition, status FROM alerts WHERE user_id = $1 AND status IN (\'ACTIVE\', \'EXECUTED\') ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(alerts.rows);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Server error fetching alerts' });
  }
});

// Create new alert
app.post('/api/alerts', authenticateToken, async (req, res) => {
  const { symbol, targetPrice, condition } = req.body; // condition: 'ABOVE' or 'BELOW'
  if (!symbol || !targetPrice || !condition) {
    return res.status(400).json({ error: 'Missing required alert settings' });
  }

  try {
    const newAlert = await pool.query(
      'INSERT INTO alerts (user_id, symbol, target_price, condition) VALUES ($1, $2, $3, $4) RETURNING id, symbol, target_price as "targetPrice", condition, status',
      [req.user.id, symbol, parseFloat(targetPrice), condition]
    );
    res.status(201).json(newAlert.rows[0]);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Server error creating alert' });
  }
});

// Delete alert (disable it)
app.delete('/api/alerts/:id', authenticateToken, async (req, res) => {
  const alertId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM alerts WHERE id = $1 AND user_id = $2 RETURNING id',
      [alertId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found or unauthorized' });
    }

    res.json({ message: 'Alert deactivated successfully', id: alertId });
  } catch (error) {
    console.error('Error disabling alert:', error);
    res.status(500).json({ error: 'Server error deleting alert' });
  }
});



// Announcement Subjects Endpoint
app.get('/api/markets/announcements/subjects/:index', async (req, res) => {
  try {
    const data = await nseService.getAnnouncementSubjects(req.params.index);
    res.json(data);
  } catch (error) {
    console.error(`Failed to fetch announcement subjects for ${req.params.index}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch announcement subjects' });
  }
});

// Consolidated Corporate Announcements Endpoint
app.get('/api/markets/announcements/:index', async (req, res) => {
  try {
    const data = await nseService.getIndexAnnouncements(req.params.index, req.query);
    res.json(data);
  } catch (error) {
    console.error(`Failed to fetch announcements for ${req.params.index}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Fetch Saved AI Summaries
app.get('/api/announcements/summary/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const result = await pool.query(`
      SELECT ai_summary, ai_sentiment, ai_impact, attachment_url, anndate, created_at
      FROM processed_announcements
      WHERE symbol = $1 AND ai_summary IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10
    `, [symbol]);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch AI summaries:', error);
    res.status(500).json({ error: 'Failed to fetch AI summaries' });
  }
});

// Background Worker for Alerts
function startAlertsWorker() {
  const runWorker = async () => {
    global.workerStatus.alerts.status = 'running';
    global.workerStatus.alerts.lastRun = new Date().toISOString();
    try {
      const activeAlerts = await pool.query(`
        SELECT a.*, u.email 
        FROM alerts a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.status = 'ACTIVE'
      `);
      if (activeAlerts.rows.length === 0) return;

      const groupedBySymbol = {};
      for (const alert of activeAlerts.rows) {
        if (!groupedBySymbol[alert.symbol]) {
          groupedBySymbol[alert.symbol] = [];
        }
        groupedBySymbol[alert.symbol].push(alert);
      }

      for (const symbol in groupedBySymbol) {
        try {
          // Check index or stock
          let currentPrice = null;
          const indexData = await getIndexPseudoQuote(symbol);
          if (indexData) {
            currentPrice = indexData.priceInfo.lastPrice;
          } else {
            const symbolData = await nseService.getSymbolData(symbol, 'EQ');
            const realData = symbolData && symbolData.equityResponse ? symbolData.equityResponse[0] : symbolData;
            if (realData) {
              currentPrice = realData.tradeInfo?.lastPrice || realData.metaData?.lastPrice || realData.orderBook?.lastPrice || realData.priceInfo?.lastPrice || realData.lastPrice;
            }
          }

          if (currentPrice === null) continue;

          for (const alert of groupedBySymbol[symbol]) {
            let triggered = false;
            if (alert.condition === 'ABOVE' && currentPrice >= parseFloat(alert.target_price)) {
              triggered = true;
            } else if (alert.condition === 'BELOW' && currentPrice <= parseFloat(alert.target_price)) {
              triggered = true;
            }

            if (triggered) {
              await pool.query('UPDATE alerts SET status = $1 WHERE id = $2', ['EXECUTED', alert.id]);

              const mailOptions = {
                from: process.env.EMAIL_USER,
                to: alert.email,
                subject: `Stock Alert: ${symbol} is ${alert.condition} ${alert.target_price}`,
                text: `Your alert for ${symbol} has been triggered. The current price is ₹${currentPrice}, which is ${alert.condition} your target of ₹${alert.target_price}.`
              };

              transporter.sendMail(mailOptions, (error) => {
                if (error) console.error('Error sending alert email:', error);
                else console.log(`Alert email sent to ${alert.email} for ${symbol}`);
              });

              try {
                const subs = await pool.query('SELECT * FROM push_subscriptions WHERE user_id = $1', [alert.user_id]);
                const payload = JSON.stringify({
                  title: 'Stock Alert Triggered!',
                  body: `${symbol} is ${alert.condition} ₹${alert.target_price}. Current: ₹${currentPrice}`,
                  icon: '/Stock_Island.svg',
                  url: `/quote/${symbol}`
                });
                
                for (const sub of subs.rows) {
                  const pushSub = {
                    endpoint: sub.endpoint,
                    keys: {
                      p256dh: sub.keys_p256dh,
                      auth: sub.keys_auth
                    }
                  };
                  try {
                    await webpush.sendNotification(pushSub, payload);
                    console.log(`Push notification sent to user ${alert.user_id} for ${symbol}`);
                  } catch (pushErr) {
                    if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                      await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
                    } else {
                      console.error('Error sending push:', pushErr);
                    }
                  }
                }
              } catch (err) {
                console.error('Error fetching push subscriptions:', err);
              }
            }
          }
        } catch (err) {
          console.error(`Failed to process alerts for symbol ${symbol}:`, err.message);
        }
      }
    } catch (err) {
      console.error('Alert worker error:', err);
    } finally {
      global.workerStatus.alerts.status = 'idle';
      const delay = (appSettingsCache.alerts_interval_min || 1) * 60 * 1000;
      setTimeout(runWorker, delay);
    }
  };
  runWorker();
}

// Background Worker for Announcements
function startAnnouncementsWorker() {
  let isFirstRun = true;
  const runWorker = async () => {
    global.workerStatus.announcements.status = 'running';
    global.workerStatus.announcements.lastRun = new Date().toISOString();
    try {
      // 1. Get all unique symbols from all wishlists
      const wishlistSymbolsRes = await pool.query('SELECT DISTINCT symbol FROM wishlists');
      if (wishlistSymbolsRes.rows.length === 0) return;
      
      const wishlistSymbols = new Set(wishlistSymbolsRes.rows.map(row => row.symbol));

      // 2. Fetch global announcements
      const announcementsData = await nseService.getIndexAnnouncements('equities');
      if (!Array.isArray(announcementsData)) return;

      // 3. Filter for matching symbols
      const relevantAnnouncements = appSettingsCache.summarize_all_announcements
        ? announcementsData
        : announcementsData.filter(ann => wishlistSymbols.has(ann.symbol));

      for (const ann of relevantAnnouncements) {
        // 4. Check if already processed
        const processedRes = await pool.query('SELECT seq_id FROM processed_announcements WHERE seq_id = $1', [ann.seq_id]);
        if (processedRes.rows.length > 0) continue; // Already sent

        // 5. Insert into processed table
        await pool.query('INSERT INTO processed_announcements (seq_id, symbol) VALUES ($1, $2)', [ann.seq_id, ann.symbol]);

        const dbEmptyRes = await pool.query('SELECT COUNT(*) FROM processed_announcements');
        const isDbEmpty = parseInt(dbEmptyRes.rows[0].count) <= 1; // <= 1 because we just inserted one
        
        if (isFirstRun && isDbEmpty) continue; // Skip AI and push notifications on initial startup for past announcements

        // 6. Find users who have this symbol in their wishlist
        const usersRes = await pool.query(`
          SELECT w.user_id, w.symbol
          FROM wishlists w
          WHERE w.symbol = $1
        `, [ann.symbol]);

        if (usersRes.rows.length === 0 && !appSettingsCache.summarize_all_announcements) continue;

        // NEW: Summarize with AI if attachment exists
        let summaryText = ann.desc || 'New corporate announcement published.';
        if (ann.attchmntFile && (ann.attchmntFile.toLowerCase().endsWith('.pdf') || ann.attchmntFile.toLowerCase().endsWith('.zip'))) {
          try {
            const aiSettingsRes = await pool.query('SELECT * FROM ai_settings LIMIT 1');
            const aiSettings = aiSettingsRes.rows.length > 0 ? aiSettingsRes.rows[0] : { provider: 'gemini', active_gemini_key: process.env.GEMINI_API_KEY, active_ollama_model: 'gpt-oss:20b-cloud' };
            
            // Determine endpoints based on provider strategy
            let endpoints = [];
            if (aiSettings.provider === 'gemini') {
              endpoints = ['gemini'];
            } else if (aiSettings.provider === 'ollama') {
              endpoints = [aiSettings.ollama_url];
            } else if (aiSettings.provider === 'ollama_round_robin') {
              endpoints = aiSettings.ollama_url.split(',').map(s => s.trim()).filter(s => s);
            } else if (aiSettings.provider === 'gemini_ollama_round_robin') {
              const ollamaUrls = aiSettings.ollama_url.split(',').map(s => s.trim()).filter(s => s);
              endpoints = ['gemini', ...ollamaUrls];
            }
            if (endpoints.length === 0) endpoints = ['gemini']; // fallback
            
            const selectedEndpoint = endpoints[aiRoundRobinIndex % endpoints.length];
            aiRoundRobinIndex++;
            
            console.log(`Summarizing attachment for ${ann.symbol} using endpoint: ${selectedEndpoint} (Strategy: ${aiSettings.provider})...`);
            let aiData = null;

            if (selectedEndpoint === 'gemini') {
              const geminiKey = aiSettings.active_gemini_key || process.env.GEMINI_API_KEY;
              if (geminiKey) {
                const { GoogleGenAI } = require('@google/genai');
                const ai = new GoogleGenAI({ apiKey: geminiKey });
                
                const pdfRes = await fetch(ann.attchmntFile);
                if (pdfRes.ok) {
                  const arrayBuffer = await pdfRes.arrayBuffer();
                  let buffer = Buffer.from(arrayBuffer);
                  
                  if (ann.attchmntFile.toLowerCase().endsWith('.zip')) {
                    const AdmZip = require('adm-zip');
                    const zip = new AdmZip(buffer);
                    const zipEntries = zip.getEntries();
                    const pdfEntry = zipEntries.find(e => e.entryName.toLowerCase().endsWith('.pdf'));
                    if (pdfEntry) {
                      buffer = pdfEntry.getData();
                    } else {
                      throw new Error('No PDF found inside ZIP attachment.');
                    }
                  }
                  
                  const aiResult = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                      {
                        role: 'user',
                        parts: [
                          { inlineData: { data: buffer.toString("base64"), mimeType: "application/pdf" } },
                          { text: `Analyze this corporate announcement for ${ann.symbol}. Provide a concise 2-sentence summary, the expected price sentiment (Bullish, Bearish, or Neutral), and the overall company impact (Positive, Negative, or Neutral). Respond strictly in JSON format: {"summary": "...", "sentiment": "...", "impact": "..."}` }
                        ]
                      }
                    ]
                  });
                  
                  let text = aiResult.text.trim();
                  if (text.startsWith("\`\`\`json")) text = text.substring(7, text.length - 3);
                  aiData = JSON.parse(text);
                  await recordAiUsageStat('gemini');
                }
              }
            } else {
               const axios = require('axios');
               const pyServiceUrl = 'http://localhost:8000/api/ai/summarize';
               const response = await axios.post(pyServiceUrl, {
                 pdf_url: ann.attchmntFile,
                 ollama_url: selectedEndpoint,
                 model_name: aiSettings.active_ollama_model,
                 symbol: ann.symbol
               });
               if (response.data && response.data.summary) {
                 aiData = response.data;
                 await recordAiUsageStat(selectedEndpoint);
               }
            }

            if (aiData) {
              summaryText = `𝗜𝗺𝗽𝗮𝗰𝘁: ${aiData.impact}\n𝗦𝗲𝗻𝘁𝗶𝗺𝗲𝗻𝘁: ${aiData.sentiment}\n𝗦𝘂𝗺𝗺𝗮𝗿𝘆: ${aiData.summary}`;
              console.log(`Successfully summarized ${ann.symbol}.`);
              
              await pool.query(`
                UPDATE processed_announcements 
                SET ai_summary = $1, ai_sentiment = $2, ai_impact = $3, attachment_url = $4, anndate = $5, created_at = NOW()
                WHERE seq_id = $6
              `, [aiData.summary, aiData.sentiment, aiData.impact, ann.attchmntFile, ann.anndate, ann.seq_id]);
            }
          } catch (e) {
            console.error('Failed to summarize AI PDF:', e.message);
          }
        }

        // 7. Send push notifications
        for (const userRow of usersRes.rows) {
          const subs = await pool.query('SELECT * FROM push_subscriptions WHERE user_id = $1', [userRow.user_id]);
          
          const payload = JSON.stringify({
            title: `New Announcement: ${ann.symbol}`,
            body: summaryText,
            icon: '/Stock_Island.svg',
            url: `/quote/${ann.symbol}`,
            docUrl: ann.attchmntFile || null
          });

          for (const sub of subs.rows) {
            const pushSub = {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
            };
            try {
              await webpush.sendNotification(pushSub, payload);
            } catch (pushErr) {
              if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Announcements worker error:', err.message);
    } finally {
      isFirstRun = false;
      global.workerStatus.announcements.status = 'idle';
      const delay = (appSettingsCache.announcements_interval_min || 5) * 60 * 1000;
      setTimeout(runWorker, delay);
    }
  };
  runWorker();
}

// Background Worker for Corporate Actions
function startCorporateActionsWorker() {
  let isFirstRun = true;
  const runWorker = async () => {
    global.workerStatus.corpActions.status = 'running';
    global.workerStatus.corpActions.lastRun = new Date().toISOString();
    try {
      const wishlistSymbolsRes = await pool.query('SELECT DISTINCT symbol FROM wishlists');
      if (wishlistSymbolsRes.rows.length === 0) return;
      
      const wishlistSymbols = wishlistSymbolsRes.rows.map(row => row.symbol);

      for (const symbol of wishlistSymbols) {
        try {
          const corpActions = await nseService.getCorpAction(symbol);
          if (!corpActions || !corpActions.corporateActions) continue;

          for (const act of corpActions.corporateActions) {
            if (!act.purpose) continue;
            const recordDate = act.recordDate || act.ndStartDate || '';
            
            const processedRes = await pool.query(
              'SELECT id FROM processed_corporate_actions WHERE symbol = $1 AND purpose = $2 AND record_date = $3',
              [symbol, act.purpose, recordDate]
            );
            
            if (processedRes.rows.length > 0) continue;

            // Insert
            await pool.query(
              'INSERT INTO processed_corporate_actions (symbol, purpose, record_date) VALUES ($1, $2, $3)',
              [symbol, act.purpose, recordDate]
            );

            const corpDbEmptyRes = await pool.query('SELECT COUNT(*) FROM processed_corporate_actions');
            const isCorpDbEmpty = parseInt(corpDbEmptyRes.rows[0].count) <= 1;

            if (isFirstRun && isCorpDbEmpty) continue;

            const usersRes = await pool.query(`
              SELECT w.user_id, w.symbol
              FROM wishlists w
              WHERE w.symbol = $1
            `, [symbol]);

            if (usersRes.rows.length === 0) continue;

            const summaryText = `${act.purpose} ${recordDate ? '(Record: ' + recordDate + ')' : ''}`;

            for (const user of usersRes.rows) {
              try {
                const subs = await pool.query('SELECT * FROM push_subscriptions WHERE user_id = $1', [user.user_id]);
                for (const sub of subs.rows) {
                  const pushConfig = {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
                  };
                  const payload = JSON.stringify({
                    title: `Corporate Action: ${symbol}`,
                    body: summaryText,
                    url: `/quote/${symbol}`
                  });
                  await webpush.sendNotification(pushConfig, payload).catch(async (pushErr) => {
                    if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                      await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
                    }
                  });
                }
              } catch (e) {
                console.error('Error sending corp action push:', e);
              }
            }
          }
        } catch (e) {
          console.error(`Failed to fetch corp actions for ${symbol}:`, e.message);
        }
        await new Promise(res => setTimeout(res, 500)); // Delay between requests
      }
    } catch (err) {
      console.error('Corporate actions worker error:', err);
    } finally {
      isFirstRun = false;
      global.workerStatus.corpActions.status = 'idle';
      const delay = (appSettingsCache.corp_action_interval_min || 10) * 60 * 1000;
      setTimeout(runWorker, delay);
    }
  };
  runWorker();
}

// Start server after initializing DB tables
async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) return;

  try {
    const adminRes = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (adminRes.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)',
        [adminEmail, hashedPassword, 'System Admin', 'admin']
      );
      console.log(`Seeded default admin user: ${adminEmail}`);
    } else {
      // Ensure the existing user has the admin role
      await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', adminEmail]);
    }
  } catch (error) {
    console.error('Failed to seed admin user:', error);
  }
}

initializeDB()
  .then(async () => {
    await refreshAppSettings();
    await seedAdminUser();
    startAlertsWorker();
    startAnnouncementsWorker();
    startCorporateActionsWorker();
    const server = app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });

    // --- WEBSOCKET SERVER ---
    const wss = new WebSocketServer({ server });
    const wsClients = new Map(); // ws -> Set(symbols)

    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          if (data.action === 'subscribe' && Array.isArray(data.symbols)) {
            wsClients.set(ws, new Set(data.symbols));
            // Send an immediate empty update just to acknowledge
            ws.send(JSON.stringify({ action: 'subscribed', count: data.symbols.length }));
          }
        } catch (e) {}
      });
      ws.on('close', () => wsClients.delete(ws));
    });

    // WebSocket Price Poller
    setInterval(async () => {
      if (wsClients.size === 0) return;
      const allSymbols = new Set();
      for (const symbols of wsClients.values()) {
        symbols.forEach(s => allSymbols.add(s));
      }
      
      const priceUpdates = {};
      for (const symbol of allSymbols) {
        try {
          let currentPrice = null;
          let currentPChange = 0;
          const indexData = await getIndexPseudoQuote(symbol);
          if (indexData) {
            currentPrice = indexData.priceInfo.lastPrice;
            currentPChange = indexData.priceInfo.pChange || 0;
          } else {
            const symbolData = await nseService.getSymbolData(symbol, 'EQ').catch(()=>null);
            const realData = symbolData && symbolData.equityResponse ? symbolData.equityResponse[0] : symbolData;
            if (realData) {
              currentPrice = realData.tradeInfo?.lastPrice || realData.metaData?.lastPrice || realData.orderBook?.lastPrice || realData.priceInfo?.lastPrice || realData.lastPrice;
              currentPChange = realData.tradeInfo?.pChange || realData.metaData?.pChange || realData.orderBook?.pChange || realData.priceInfo?.pChange || realData.pChange || 0;
            }
          }
          if (currentPrice !== null && currentPrice !== undefined) {
            priceUpdates[symbol] = { price: currentPrice, pChange: currentPChange };
          }
        } catch(e) {
          // ignore
        }
      }
      
      const updateMsg = JSON.stringify({ action: 'price_update', data: priceUpdates });
      for (const ws of wsClients.keys()) {
        if (ws.readyState === 1 /* OPEN */) {
           ws.send(updateMsg);
        }
      }
    }, 5000); // 5 seconds live update

  })
  .catch(err => {
    console.error('Fatal: Could not initialize database. Express server not started.', err);
  });
