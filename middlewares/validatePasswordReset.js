const { check, validationResult } = require('express-validator');

exports.validatePasswordResetRequest = [
    check('email', 'Please include a valid email').isEmail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validatePasswordReset = [
    check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('token', 'Reset token is required').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
