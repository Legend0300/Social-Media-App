const jwt = require('jsonwebtoken');

// Middleware for JWT authentication
function authMiddleware(req, res, next) {
  // Get the token from the request header
    const token = req.cookies.token || '';

  // Check if token is present
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

module.exports = authMiddleware;
