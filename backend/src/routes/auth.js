const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');

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
router.post('/verify-email', async (req, res) => {
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
router.post('/resend-verification', async (req, res) => {
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

    // Send verification email
    await sendVerificationEmail(email, user.name, verificationCode);

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
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

module.exports = router;