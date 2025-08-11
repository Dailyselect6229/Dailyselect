const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const UserModel = require('../model/user.model');

const router = express.Router();

// ======== Admin Auth Middleware ========
const isAdminAuth = async (req, res, next) => {
    if (req.session.islogin) {
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

// ======== Google Login Route ========
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

router.post('/google', async (req, res) => {
    const { idToken, name, email } = req.body;
    if (!idToken) return res.status(400).json({ error: 'No idToken' });

    try {
        const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
        const payload = ticket.getPayload();

        const googleId = payload.sub;
        const verifiedEmail = payload.email;
        const userEmail = email || verifiedEmail;

        let user = await UserModel.findOne({ $or: [{ googleId }, { email: userEmail }] });

        if (!user) {
            user = await UserModel.create({
                name: name || payload.name || userEmail,
                email: userEmail,
                googleId
            });
        } else {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        }

        res.json({
            ok: true,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error('Token verify error:', err);
        res.status(401).json({ error: 'Invalid ID token' });
    }
});

module.exports = { isAdminAuth, authRouter: router };
