const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/authentication');
const User = require('../model/user.model'); // Add User model to query DB in /checklogin route

// Check login session
router.route('/')
     .get(userController.isLognin);

// Signup with mobile and OTP (dummy OTP for now)
router.post('/register', userController.signup);

// Login with mobile and OTP (dummy OTP)
router.post('/login', userController.login);

// Logout
router.get('/logout', userController.logout);

// Update user location (protected route)
router.post('/:id/location', auth.isJWTAuth, userController.updateLocation);

// ========== New Route Added ==========
// Route: GET /checklogin
// Purpose: Token validation route. 
// Middleware: isJWTAuth verifies JWT token.
// Function: Checks if user from token exists in DB and returns basic info.
router.get('/checklogin', auth.isJWTAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    res.json({ success: true, user: { name: user.name, mobile: user.mobile } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
