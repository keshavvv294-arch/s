
import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'db.json');

// Initial Data Structure
const initialDb = {
  users: [],
  globalData: {
    transactions: [],
    accounts: [
      { id: '1', name: 'Main Wallet', type: 'cash', initialBalance: 0, currency: 'USD', color: 'bg-indigo-500' }
    ],
    assets: [],
    debts: [],
    budgets: [],
    settings: {
      currency: 'USD',
      theme: 'midnight',
      compactMode: false,
      soundEnabled: true,
      hapticsEnabled: true,
      privacyMode: false,
      pin: '1234'
    }
  }
};

// Load or Initialize DB
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialDb, null, 2));
}

const getDb = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const saveDb = (db: unknown) => fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- Auth Routes ---
  app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    const db = getDb();
    
    if (db.users.find((u: { email: string }) => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      password, // In a real app, hash this!
      joinDate: new Date().toISOString(),
      streak: 0,
      onboardingComplete: false
    };

    db.users.push(newUser);
    saveDb(db);

    const { password: _password, ...userProfile } = newUser;
    void _password;
    console.log(`User signed up: ${userProfile.email}`);
    res.json({ user: userProfile, token: 'mock-jwt-token' });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
    
    const user = db.users.find((u: { email: string; password: string }) => u.email === email && u.password === password);
    
    if (!user) {
      // If user doesn't exist, the requirement says "when user login store that"
      // This could mean auto-signup or just a strict login. 
      // Let's implement auto-signup if not found to be user-friendly as requested.
      const newUser = {
        id: Math.random().toString(36).substring(7),
        name: email.split('@')[0],
        email,
        password,
        joinDate: new Date().toISOString(),
        streak: 0,
        onboardingComplete: false
      };
      db.users.push(newUser);
      saveDb(db);
      const { password: _password, ...userProfile } = newUser;
      void _password;
      console.log(`User auto-registered: ${userProfile.email}`);
      return res.json({ user: userProfile, token: 'mock-jwt-token' });
    }

    const { password: _password, ...userProfile } = user;
    void _password;
    console.log(`User logged in: ${userProfile.email}`);
    res.json({ user: userProfile, token: 'mock-jwt-token' });
  });

  app.post('/api/auth/update-profile', (req, res) => {
    const { userId, updates } = req.body;
    const db = getDb();
    const userIndex = db.users.findIndex((u: { id: string }) => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    saveDb(db);
    const { password: _password, ...userProfile } = db.users[userIndex];
    void _password;
    console.log(`User profile updated: ${userProfile.email}`);
    res.json(userProfile);
  });

  // --- Global Data Routes ---
  app.get('/api/data', (req, res) => {
    const db = getDb();
    res.json(db.globalData);
  });

  app.post('/api/data', (req, res) => {
    const { transactions, accounts, assets, debts, budgets, settings } = req.body;
    const db = getDb();
    
    if (transactions) db.globalData.transactions = transactions;
    if (accounts) db.globalData.accounts = accounts;
    if (assets) db.globalData.assets = assets;
    if (debts) db.globalData.debts = debts;
    if (budgets) db.globalData.budgets = budgets;
    if (settings) db.globalData.settings = settings;

    saveDb(db);
    res.json({ status: 'ok' });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
