const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/authentication');

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

module.exports = router;
