const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendEmail } = require('../utils/mailSender');

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            email,
            password
        });

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            async (err, token) => {
                if (err) throw err;

                const verificationToken = new VerificationToken({
                    owner: user._id,
                    token: crypto.randomBytes(16).toString('hex')
                });

                await verificationToken.save();

                await sendEmail({
                    to: user.email,
                    subject: 'Verify your email address',
                    html: `<p>Please verify your email by clicking on the link below:</p><p><a href=\"${req.protocol}://${req.get('host')}/api/users/verify/${verificationToken.token}\">Verify Email</a></p>`
                });

                res.status(201).json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const token = await VerificationToken.findOne({ token: req.params.token });

        if (!token) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        const user = await User.findById(token.owner);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.isVerified = true;
        await user.save();

        await token.deleteOne();

        res.status(200).send('Email successfully verified');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const token = new PasswordResetToken({
            owner: user._id,
            token: crypto.randomBytes(16).toString('hex'),
            expires: new Date(Date.now() + 3600000) // 1 hour
        });

        await token.save();

        await sendEmail({
            to: user.email,
            subject: 'Password Reset',
            html: `<p>You requested a password reset. Click the link to reset it:</p>
                   <a href=\"${req.protocol}://${req.get('host')}/api/users/password-reset/${token.token}\">Reset Password</a>`
        });

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const passwordResetToken = await PasswordResetToken.findOne({ token });

        if (!passwordResetToken || passwordResetToken.expires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired password reset token' });
        }

        const user = await User.findById(passwordResetToken.owner);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        await passwordResetToken.deleteOne();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
