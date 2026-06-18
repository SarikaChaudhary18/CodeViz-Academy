const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`Unauthorized API request from IP ${req.ip}`);
    return res.status(401).json({
      status: 'fail',
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'studyquest_access_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Invalid JWT token verification attempt from IP ${req.ip}`);
    
    let message = 'Invalid or expired token.';
    if (err.name === 'TokenExpiredError') {
      message = 'Token has expired. Please refresh.';
    }

    return res.status(401).json({
      status: 'fail',
      message
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn(`User ${req.user ? req.user.id : 'unknown'} unauthorized for role access`);
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
