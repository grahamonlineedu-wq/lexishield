const apiKeySecret = process.env.API_SECRET_KEY;

if (!apiKeySecret) {
  console.warn('API_SECRET_KEY is not set. Authentication will fail until you configure it in your environment.');
}

function resolveToken(req) {
  const header = req.headers.authorization || req.headers['x-api-key'];

  if (!header) return null;

  if (typeof header === 'string' && header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }

  if (Array.isArray(header)) {
    return String(header[0] || '').trim();
  }

  return String(header).trim();
}

function requireApiKey(req, res, next) {
  const sharedSecret = process.env.API_SECRET_KEY;

  if (!sharedSecret) {
    return res.status(503).json({
      error: 'API authentication is not configured on this server.'
    });
  }

  const token = resolveToken(req);

  if (!token || token !== sharedSecret) {
    return res.status(401).json({
      error: 'Unauthorized. Send a valid Authorization: Bearer <API_SECRET_KEY> header.'
    });
  }

  req.user = { id: 'api-client' };
  next();
}

module.exports = {
  requireApiKey,
  resolveToken
};
