const express = require('express');
const router = express.Router();
const { validateRegister } = require('../../middlewares/validateRegister');
const userController = require('../../controllers/userController');

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', validateRegister, userController.register);

// Add the new verification route
router.get('/verify/:token', userController.verifyEmail);

module.exports = router;
