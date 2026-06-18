const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: IP ${req.ip} requested ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/register attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded: IP ${req.ip} attempted login/register`);
    res.status(options.statusCode).send(options.message);
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
