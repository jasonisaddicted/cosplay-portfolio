const functions = require('firebase-functions');
const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '.next/standalone/public')));
app.use('/_next', express.static(path.join(__dirname, '.next/standalone/.next')));

// Load and run the Next.js server
let nextApp;
try {
  nextApp = require(path.join(__dirname, './server.js'));
} catch (err) {
  console.error('Error loading server:', err);
}

// Handle all requests
app.all('*', (req, res) => {
  if (nextApp && typeof nextApp === 'function') {
    return nextApp(req, res);
  }
  res.status(500).send('Server not initialized');
});

// Export as Cloud Function
exports.nextjsServer = functions
  .https
  .onRequest(app);
