const express = require('express');
const router = express.Router();
const { validateRegister } = require('../../middlewares/validateRegister');
const { validatePasswordResetRequest, validatePasswordReset } = require('../../middlewares/validatePasswordReset');
const userController = require('../../controllers/userController');

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', validateRegister, userController.register);

router.post('/request-password-reset', validatePasswordResetRequest, userController.requestPasswordReset);
router.post('/password-reset', validatePasswordReset, userController.resetPassword);

router.get('/verify/:token', userController.verifyEmail);

module.exports = router;
