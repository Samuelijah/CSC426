const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File path for storing users
const USERS_FILE = path.join(__dirname, 'users.json');

// Load users from file
const loadUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return [];
};

// Save users to file
const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
};

// Initialize users
let users = loadUsers();

// Add demo users if no users exist
const initializeDemoUsers = async () => {
  if (users.length === 0) {
    const demoUsers = [
      { username: 'john_doe', password: 'password123', email: 'john@example.com' },
      { username: 'jane_smith', password: 'securepass', email: 'jane@example.com' },
      { username: 'admin', password: 'admin123', email: 'admin@example.com' }
    ];

    for (const user of demoUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      users.push({
        username: user.username,
        password: hashedPassword,
        email: user.email,
        createdAt: new Date().toISOString()
      });
    }
    saveUsers(users);
    console.log('Demo users initialized and saved to file');
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const generateToken = (username) => {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
};

// ============= API ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

// Get all users (for admin/debugging - remove in production)
app.get('/api/users', (req, res) => {
  const safeUsers = users.map(user => ({
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  }));
  res.json({ users: safeUsers, total: users.length });
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validation
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    const existingEmail = users.find(u => u.email === email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      username,
      password: hashedPassword,
      email,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users); // Save to file immediately

    // Generate token
    const token = generateToken(username);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both username and password'
      });
    }

    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const token = generateToken(username);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Protected route
app.get('/api/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.username === decoded.username);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Debug endpoint to see stored users (remove in production)
app.get('/api/debug/users', (req, res) => {
  const safeUsers = users.map(u => ({
    username: u.username,
    email: u.email,
    createdAt: u.createdAt
  }));
  res.json({ 
    totalUsers: users.length,
    users: safeUsers,
    storageFile: USERS_FILE
  });
});

// Initialize demo users and start server
initializeDemoUsers().then(() => {
  app.listen(PORT, () => {
    console.log(`   Server running on http://localhost:${PORT}`);
    console.log(`   Users stored in: ${USERS_FILE}`);
    console.log(`   API endpoints:`);
    console.log(`   POST   /api/login      - Login`);
    console.log(`   POST   /api/register   - Register`);
    console.log(`   GET    /api/users      - List users`);
    console.log(`   GET    /api/debug/users - Debug - see all users`);
  });
});