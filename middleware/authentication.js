const jwt = require('jsonwebtoken');
const UserModel = require('../model/user.model');

const isJWTAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const parts = header.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Token error' });

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ======== Admin Auth Middleware ========
const isAdminAuth = async (req, res, next) => {
  if (req.session?.islogin) {
    const user = await UserModel.findById(req.session?.user).exec();
    if (user && user.role === 'admin') {
      next();
    } else {
      return res.status(400).json({ message: 'authorized' });
    }
  } else {
    res.status(400).json('Unauthication');
  }
};

module.exports = { isJWTAuth, isAdminAuth };
