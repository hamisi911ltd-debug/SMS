const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:", "https://cdn.jsdelivr.net"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'glotech-school-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/glotech_school'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const mongoUri = process.env.MONGODB_URI;
let isDemoMode = !mongoUri; // Start in demo mode if no MongoDB URI provided

const setupRoutes = () => {
  // Routes - conditionally use demo routes if no database
  if (isDemoMode) {
    app.use('/api/auth', require('./routes/demo-auth'));
    console.log('📡 Using demo authentication routes');
  } else {
    app.use('/api/auth', require('./routes/auth'));
    console.log('📡 Using database authentication routes');
  }

  app.use('/api/students', require('./routes/students'));
  app.use('/api/teachers', require('./routes/teachers'));
  app.use('/api/academics', require('./routes/academics'));
  app.use('/api/finance', require('./routes/finance'));
  app.use('/api/attendance', require('./routes/attendance'));
  app.use('/api/messaging', require('./routes/messaging'));
  app.use('/api/dashboard', require('./routes/dashboard'));
  app.use('/api/reports', require('./routes/reports'));
};

if (mongoUri) {
  // Only try to connect if MongoDB URI is provided
  mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    isDemoMode = false;
    
    // Auto-setup database in production if no users exist
    if (process.env.NODE_ENV === 'production') {
      const User = require('./models/User');
      const userCount = await User.countDocuments();
      
      if (userCount === 0) {
        console.log('🔧 Setting up production database...');
        const setupProduction = require('./scripts/start-production');
        // Don't await this, let it run in background
        setupProduction().catch(console.error);
      }
    }
    
    setupRoutes();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Falling back to DEMO MODE...');
    isDemoMode = true;
    setupRoutes();
  });
} else {
  console.log('⚠️  No MONGODB_URI provided - starting in DEMO MODE');
  console.log('📖 See DEPLOYMENT_GUIDE.md for database setup instructions.');
  console.log('🎭 Demo credentials: admin/admin123, john.teacher/teacher123, jane.student/student123');
  setupRoutes();
}

// Make demo mode available to routes
app.set('isDemoMode', () => isDemoMode);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Socket.IO for real-time features
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Make io available to routes
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Glotech School Management System running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});

module.exports = app;