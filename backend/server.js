require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const atsRoutes = require('./routes/atsRoutes');
const resumeBuilderRoutes = require('./routes/resumeBuilderRoutes');
const skillRoutes = require('./routes/skillRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const aiRoutes = require('./routes/aiRoutes');
const coverLetterRoutes = require('./routes/coverLetterRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const jobRoutes = require('./routes/jobRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    application: 'Smart Resume Ranker Backend',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', userRoutes);
app.use('/api', resumeRoutes);
app.use('/api', atsRoutes);
app.use('/api', resumeBuilderRoutes);
app.use('/api', skillRoutes);
app.use('/api', roadmapRoutes);
app.use('/api', aiRoutes);
app.use('/api', coverLetterRoutes);
app.use('/api', recruiterRoutes);
app.use('/api', interviewRoutes);
app.use('/api', jobRoutes);
app.use('/api', dashboardRoutes);

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback route for SPA / direct HTML navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const filePath = path.join(frontendPath, req.path.endsWith('.html') ? req.path : `${req.path}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
});

// Centralized error handling
app.use(errorHandler);

// Start server (when running locally or on traditional VM)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Smart Resume Ranker Server running on port ${PORT}`);
    console.log(`🌐 Local Web URL: http://localhost:${PORT}`);
    console.log(`📡 API Base URL:  http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}

module.exports = app;
