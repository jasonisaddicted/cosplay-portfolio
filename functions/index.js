const functions = require('firebase-functions');
const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '.next/standalone/public')));
app.use('/_next', express.static(path.join(__dirname, '.next/standalone/.next')));

// Load and run the Next.js server
const { default: nextApp } = require(path.join(__dirname, '.next/standalone/server.js'));

// Handle all requests
app.all('*', (req, res) => {
  if (nextApp) {
    return nextApp(req, res);
  }
  res.status(500).send('Server not ready');
});

// Export as Cloud Function
exports.nextjsServer = functions
  .https
  .onRequest(app);
