// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller'); // keeping old naming
const auth = require('../middleware/authentication');

// Old routes (kept as is)
router.route('/')
     .get(userController.isLognin);

router.route('/signup')
     .post(userController.signup);

router.route('/login')
       .post(userController.login);

router.route('/logout')
       .get(userController.logout);

router.route('/forgetpassword')
       .post(userController.forgetPassword);
       
router.route('/updatepassword/:token')
       .put(userController.updatePassword);

// New routes (added with old naming preserved)
router.post('/:id/location', auth, userController.updateLocation);

module.exports = router;
