export function notFound(req, res) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }); }
export function errorHandler(error, req, res, next) {
  console.error(`[${req.id || 'request'}]`, error);
  if (error.code === 11000) return res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with that value already exists' } });
  if (error.name === 'ValidationError') return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'The submitted data is invalid' } });
  res.status(error.status || 500).json({ error: { code: error.code || 'SERVER_ERROR', message: error.status ? error.message : 'Something went wrong' } });
}
