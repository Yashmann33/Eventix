const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, verifyOTP, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../config/cloudinary.js');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOTP);
router.put('/profile', protect, uploadProfile.single('profileImage'), updateProfile);
router.post('/change-password', protect, changePassword);

module.exports = router;
