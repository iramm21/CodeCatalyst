const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
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

        // Use remove instead of findByIdAndRemove
        await token.remove();

        res.status(200).send('Email successfully verified');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
