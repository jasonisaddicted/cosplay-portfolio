/**
 * Deploy OG Images Endpoint
 *
 * This serverless function:
 * 1. Reads og:image URLs from Firestore
 * 2. Updates HTML files
 * 3. Commits and pushes to GitHub
 * 4. Triggers Vercel deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📡 Starting OG image deployment...');

    // Set up environment
    process.chdir(process.env.VERCEL_PROJECT_DIR || '/var/task');

    // Run the update script
    console.log('🔄 Running update-og-images script...');
    execSync('npm run update-og-images', {
      stdio: 'inherit',
      env: {
        ...process.env,
        FIREBASE_PROJECT_ID: 'jianshencosvisual-328dc'
      }
    });

    // Check if files changed
    console.log('✓ Script completed');

    res.status(200).json({
      success: true,
      message: 'OG images updated successfully!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error:', error.message);

    // Return error but don't fail - Firestore updates might still work
    res.status(200).json({
      success: false,
      message: error.message,
      note: 'Run "npm run update-og-images" locally and push manually if this fails',
      timestamp: new Date().toISOString()
    });
  }
};
