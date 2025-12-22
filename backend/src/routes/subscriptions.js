// backend/src/routes/subscriptions.js
const express = require('express');
const router = express.Router();
const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
const auth = require('../middleware/auth');
const { getUserFeatures } = require('../middleware/featureAccess');
const User = require('../models/User');

// Initialize Paystack transaction
router.post('/initialize', auth, async (req, res) => {
  try {
    const { plan, amount, email } = req.body;
    
    // Generate unique reference using crypto
    const crypto = require('crypto');
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const uniqueRef = `DCE_${req.user.id}_${Date.now()}_${randomBytes}`;
    
    console.log(`💳 Initializing payment - User: ${email}, Plan: ${plan}, Amount: ${amount}, Ref: ${uniqueRef}`);
    
    const transaction = await Paystack.transaction.initialize({
      email: email || req.user.email,
      amount: amount * 100, // Paystack expects amount in pesewas
      plan: plan === 'yearly' ? process.env.PAYSTACK_YEARLY_PLAN : process.env.PAYSTACK_MONTHLY_PLAN,
      callback_url: `${process.env.FRONTEND_URL}/subscription/success`,
      reference: uniqueRef,
      metadata: {
        userId: req.user.id,
        plan: plan
      }
    });
    
    console.log(`✅ Payment initialized - Reference: ${transaction.data.reference}`);
    
    res.json({ 
      authorization_url: transaction.data.authorization_url,
      reference: transaction.data.reference 
    });
  } catch (error) {
    console.error('Paystack initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// Verify Paystack payment
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const verification = await Paystack.transaction.verify(req.params.reference);
    
    if (verification.data.status === 'success') {
      const user = await User.findById(req.user.id);
      
      // Update user subscription
      user.subscription.status = 'active';
      user.subscription.plan = req.query.plan || 'pro';
      user.subscription.paystackCustomerCode = verification.data.customer.customer_code;
      user.subscription.paystackSubscriptionCode = verification.data.subscription?.subscription_code;
      user.subscription.currentPeriodEnd = new Date(Date.now() + (req.query.plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);
      
      await user.save();
      
      res.json({ 
        success: true, 
        message: 'Subscription activated successfully',
        plan: user.subscription.plan
      });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Paystack verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get subscription status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('subscription');
    res.json(user.subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.subscription.paystackSubscriptionCode) {
      await Paystack.subscription.disable({
        code: user.subscription.paystackSubscriptionCode,
        token: user.subscription.paystackCustomerCode
      });
    }
    
    user.subscription.status = 'inactive';
    user.subscription.plan = 'free';
    await user.save();
    
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get user's available features
router.get('/features', auth, getUserFeatures);

module.exports = router;