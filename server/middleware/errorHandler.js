const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({ message: 'Validation error', errors });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `Duplicate value for ${field}` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
};

module.exports = errorHandler;
