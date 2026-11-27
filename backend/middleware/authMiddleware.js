
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. Please login first.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'owner') {
      return res.status(403).json({
        message: 'Only the owner can perform this action.'
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired login session.'
    });
  }
};

module.exports = authMiddleware;
