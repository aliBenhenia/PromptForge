const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const bodyParser = require('body-parser');

dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8000; // Changed to 8000 for Koyeb

// FIX 1: Add trust proxy for Koyeb
app.set('trust proxy', 1);

// FIX 2: MongoDB connection - REMOVE DEPRECATED OPTIONS
const mongo_uri = process.env.MONGODB_URI || process.env.MONGO_URI; // Try both names

console.log('=== DEBUG INFO ===');
console.log('MongoDB URI provided?', !!mongo_uri);
console.log('Environment:', process.env.NODE_ENV);

if (mongo_uri) {
  // FIX 3: Simple connection without deprecated options
  mongoose.connect(mongo_uri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('Trying to continue without database...');
    });
} else {
  console.log('⚠️ No MongoDB URI found in environment variables');
  console.log('Available env vars:', Object.keys(process.env));
}

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true
}));
app.use(morgan('dev'));

// FIX 4: Rate limiting with trust proxy
const apiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1000,
  message: 'Too many requests from this IP, please try again after 24 hours',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true // Add this
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Import routes AFTER middleware
const authRoutes = require('./routes/auth');
const toolsRoutes = require('./routes/tools');
const userRoutes = require('./routes/user');
const statsRoutes = require('./routes/stats');
const authMiddleware = require('./middleware/auth');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tools', authMiddleware, toolsRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'PromptForge API is running!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    url: 'https://famous-melamie-aliben-87cca0aa.koyeb.app'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Access at: https://famous-melamie-aliben-87cca0aa.koyeb.app`);
});

module.exports = app;