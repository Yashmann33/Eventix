const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendWelcomeEmail, sendPasswordResetEmail, sendOTPEmail } = require('../services/mailService');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate a short unique ID for proposers
const generateUniqueId = () => {
  return 'PROP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route POST /api/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        if (existingUser.isEmailVerified) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        } else {
            // If user exists but not verified, update them and resend OTP
            existingUser.name = name;
            existingUser.password = password;
            existingUser.role = role || 'user';
            const otp = generateOTP();
            existingUser.otp = otp;
            existingUser.otpExpiry = Date.now() + 600000; // 10 mins
            await existingUser.save();
            await sendOTPEmail(email, name, otp);
            return res.status(200).json({ message: 'Verification code resent to your email.', needsVerification: true });
        }
    }

    const allowedRoles = ['user', 'proposer'];
    const userRole = allowedRoles.includes(role) ? role : 'user';
    const uniqueId = userRole === 'proposer' ? generateUniqueId() : undefined;
    const otp = generateOTP();

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      uniqueId,
      isVerified: false, 
      isEmailVerified: false, 
      otp,
      otpExpiry: Date.now() + 600000, // 10 mins
    });

    await sendOTPEmail(email, name, otp);

    res.status(201).json({
      message: 'Registration successful! Please check your email for the verification code.',
      needsVerification: true,
      email: user.email
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @route POST /api/verify-otp
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email, otp, otpExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code.' });
        }

        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        
        user.isVerified = true;

        await user.save();

        // Send welcome email after verification
        try {
            await sendWelcomeEmail(user);
        } catch (mailErr) {
            console.error('Verified but welcome email failed:', mailErr);
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Email verified successfully!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                uniqueId: user.uniqueId,
                isVerified: user.isVerified,
                profileImage: user.profileImage || '',
                bio: user.bio || '',
                phone: user.phone || '',
                location: user.location || '',
                savedEvents: user.savedEvents || [],
            },
        });
    } catch (err) {
        console.error('OTP verify error:', err);
        res.status(500).json({ message: 'Server error during verification.' });
    }
};

// @route POST /api/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
        return res.status(403).json({ message: 'Please verify your email first. You can resend the code by registering again.' });
    }

    if (user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        uniqueId: user.uniqueId,
        isVerified: user.isVerified,
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        savedEvents: user.savedEvents || [],
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @route POST /api/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'No user found with this email.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await user.save();
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error during password reset request.' });
  }
};

// @route POST /api/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};

// @route PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, bio, phone, location } = req.body;
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    
    if (req.file) {
        user.profileImage = req.file.path;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        isVerified: user.isVerified,
        savedEvents: user.savedEvents || [],
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

// @route POST /api/change-password
const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.password = password;
    await user.save();
    
    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error changing password.' });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, verifyOTP, updateProfile, changePassword };
