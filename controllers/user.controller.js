const User = require('../model/user.model');
const jwt = require('jsonwebtoken');

// === Mobile-based Registration (Signup) ===
exports.signup = async (req, res) => {
  try {
    const { name, mobile, lat, lng } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, error: 'Mobile number is required' });
    }

    // Check if user already exists with mobile
    let user = await User.findOne({ mobile });
    if (user) {
      return res.status(400).json({ success: false, error: 'User with this mobile already exists. Please login.' });
    }

    // Create new user with name and mobile
    user = new User({ name, mobile });

    // If location provided, save it
    if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
      user.location = { type: 'Point', coordinates: [lng, lat] };
      user.lastSeen = new Date();
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30d' });

    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// === Mobile-based Login ===
exports.login = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, error: 'Mobile number is required' });
    }

    let user = await User.findOne({ mobile });
    if (!user) {
      // If user doesn't exist, create a new one automatically (optional)
      user = new User({ mobile });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30d' });

    return res.status(200).json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// === Update Location ===
exports.updateLocation = async (req, res) => {
  try {
    const userId = req.params.id;
    const { lat, lng, accuracy, timestamp } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and Longitude are required' });
    }

    const update = {
      location: { type: 'Point', coordinates: [lng, lat] },
      lastSeen: timestamp ? new Date(timestamp) : new Date(),
    };
    if (accuracy) update.accuracy = accuracy;

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// === Logout ===
exports.logout = async (req, res) => {
  try {
    req.session.islogin = false;
    res.status(200).json({ message: 'You have logged out successfully' });
  } catch (error) {
    res.status(400).json({ message: error });
  }
};

// === Check Session Login ===
exports.isLognin = async (req, res) => {
  if (await req.session?.islogin && await req.session?.user) {
    const user = await User.findById(req.session.user);
    const newUser = {
      mobile: user.mobile,
      name: user.name,
      // add other fields you want to expose
    };
    res.status(200).json(newUser);
  } else {
    res.status(404).json({ message: 'User is not logged in' });
  }
};

// Comment or remove these because forgot password and update password not needed now

/*
exports.forgetPassword = async (req, res) => { ... }

exports.updatePassword = async (req, res) => { ... }
*/

