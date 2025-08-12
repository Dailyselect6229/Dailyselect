// controllers/users.controller.js
const User = require('../model/user.model');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// === Email/Password Signup ===
exports.signup = async (req, res) => {
  const { password, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      ...req.body,
      password: hashedPassword
    });
    await user.save();
    req.session.islogin = true;
    req.session.user = user._id;
    res.status(201).json({ message: 'You have successfully registered. Please login now' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// === Email/Password Login ===
exports.loginWithEmail = async (req, res) => {
  const { password, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(404).json({ message: 'Invalid email or password' });

    req.session.islogin = true;
    req.session.user = user._id;
    req.session.save();
    user.password = undefined;
    res.status(200).json({ message: 'You have login successfully', user });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

// === Mobile-based Registration ===
exports.register = async (req, res) => {
  try {
    const { name, mobile, lat, lng } = req.body;
    if (!mobile) return res.status(400).json({ success: false, error: 'mobile required' });

    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ name, mobile });
    } else if (name) {
      user.name = name;
    }

    if (lat !== undefined && lng !== undefined && lat !== null && lng !== null) {
      user.location = { type: 'Point', coordinates: [lng, lat] };
      user.lastSeen = new Date();
    }

    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30d' });
    return res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// === Mobile-based Login ===
exports.login = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ success: false, error: 'mobile required' });

    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ mobile });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '30d' });
    return res.json({ success: true, token, user });
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
    if (!lat || !lng) return res.status(400).json({ success: false, error: 'lat and lng required' });

    const update = {
      location: { type: 'Point', coordinates: [lng, lat] },
      lastSeen: timestamp ? new Date(timestamp) : new Date(),
    };
    if (accuracy) update.accuracy = accuracy;

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'user not found' });

    return res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// === Logout ===
exports.logout = async (req, res) => {
  try {
    req.session.islogin = false;
    res.status(200).json({ message: 'You have logout successfully' });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

// === Check Session Login ===
exports.isLognin = async (req, res) => {
  if (await req.session?.islogin && await req.session?.user) {
    const user = await User.findById(req.session.user);
    const newUser = {
      email: user.email,
      role: user.role,
      username: user.username
    };
    res.status(200).json(newUser);
  } else {
    res.status(404).json({ message: 'user is not login' });
  }
};

// === Forget Password ===
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '30m' });
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 900000; // 15 minutes
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your password',
    html: `<p>Please click this <a href="http://localhost:3000/reset-password/${token}">link</a> to reset your password.</p>`,
  };

  transporter.sendMail(mailOptions, () => {
    res.status(200).json({ message: 'Reset link sent to email' });
  });
};

// === Update Password ===
exports.updatePassword = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = await bcrypt.hash(req.body.password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  try {
    await user.save();
    req.session.islogin = true;
    req.session.user = user._id;
    res.status(200).json({ message: 'Password is updated' });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
