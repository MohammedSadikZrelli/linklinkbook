const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, sendVerification, verifyEmail, forgotPassword, resetPassword, updateProfile, changePassword } = require('../controllers/authController');
const protect = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new student/user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get user profile data
// @access  Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/send-verification
// @desc    Send verification OTP
// @access  Public
router.post('/send-verification', sendVerification);

// @route   POST /api/auth/verify-email
// @desc    Verify email with OTP
// @access  Public
router.post('/verify-email', verifyEmail);

// @route   POST /api/auth/forgot
// @desc    Send password reset email
// @access  Public
router.post('/forgot', forgotPassword);

// @route   POST /api/auth/reset/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset/:token', resetPassword);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', protect, changePassword);

module.exports = router;

