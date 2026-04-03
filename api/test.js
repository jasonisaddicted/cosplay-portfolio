module.exports = (req, res) => {
  res.status(200).json({
    message: 'OG Service API is working!',
    timestamp: new Date().toISOString()
  });
};
