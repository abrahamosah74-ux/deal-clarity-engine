const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const { emailVerificationLimiter, emailResendLimiter } = require('../config/rateLimit');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength (at least 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Generate verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    console.log('\n🔐 NEW USER REGISTRATION');
    console.log(`User: ${name} (${email})`);
    console.log(`Verification Code: ${verificationCode}`);

    // Create user
    const user = new User({
      name,
      email,
      password,
      company,
      role: 'rep',
      emailVerificationCode: verificationCode,
      emailVerificationExpiry: verificationExpiry,
      emailVerified: false
    });
    
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, name, verificationCode);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      requiresVerification: true,
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify email
router.post('/verify-email', emailVerificationLimiter, async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Check verification code
    if (user.emailVerificationCode !== verificationCode) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Check if code expired
    if (new Date() > user.emailVerificationExpiry) {
      return res.status(401).json({ error: 'Verification code expired' });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpiry = null;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Resend verification code
router.post('/resend-verification', emailResendLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification code
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save();

    console.log(`📨 Resending verification code to: ${email}`);
    // Send verification email
    await sendVerificationEmail(email, user.name, verificationCode);

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification code' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'Email not verified',
        requiresVerification: true,
        email: user.email
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        integrations: user.integrations
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Forgot password - request reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, a reset code has been sent' 
      });
    }

    // Generate password reset code (6 characters)
    const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const resetExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save reset code to user
    user.passwordResetCode = resetCode;
    user.passwordResetExpiry = resetExpiry;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, user.name, resetCode);

    res.json({ 
      success: true, 
      message: 'If an account exists with this email, a reset code has been sent' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// Reset password - verify code and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    // Validate input
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ error: 'Email, reset code, and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify reset code
    if (!user.passwordResetCode || user.passwordResetCode !== resetCode) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Check if code has expired
    if (new Date() > user.passwordResetExpiry) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpiry = null;
    await user.save();

    console.log(`\n✅ PASSWORD RESET SUCCESSFUL for ${email}\n`);

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. Please login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;