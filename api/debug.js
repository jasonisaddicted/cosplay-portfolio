module.exports = (req, res) => {
  const creds = process.env.FIREBASE_CREDENTIALS || 'NOT SET';
  const projectId = process.env.FIREBASE_PROJECT_ID || 'NOT SET';

  res.status(200).json({
    firebase_credentials_first_100_chars: creds.substring(0, 100),
    firebase_credentials_length: creds.length,
    firebase_project_id: projectId,
    error: creds.length > 0 ? null : 'Firebase credentials not set',
    note: 'Check if the JSON starts with { and verify the format'
  });
};
