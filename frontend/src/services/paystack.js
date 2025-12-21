import { api } from './api';

const PAYSTACK_PUBLIC_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
const MONTHLY_PLAN = process.env.REACT_APP_PAYSTACK_MONTHLY_PLAN;
const ANNUAL_PLAN = process.env.REACT_APP_PAYSTACK_ANNUAL_PLAN;

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('🔑 Paystack Public Key loaded:', PAYSTACK_PUBLIC_KEY ? '✅ Present' : '❌ Missing');
}

class PaystackService {
  constructor() {
    this.loadPaystackSDK();
  }

  // Load Paystack SDK dynamically
  loadPaystackSDK() {
    if (window.PaystackPop) return;

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
  }

  // Initialize payment with Paystack
  async initializePayment(plan, amount, email) {
    try {
      console.log('🌐 Initializing payment with backend:', { plan, amount, email });
      const response = await api.subscription.initializePayment({
        plan,
        amount,
        email
      });

      console.log('✅ Backend response received:', response);
      return response;
    } catch (error) {
      console.error('❌ Payment initialization failed:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Verify payment after redirect
  async verifyPayment(reference, plan) {
    try {
      const response = await api.subscription.verifyPayment(reference, plan);
      return response;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  }

  // Open Paystack inline payment modal
  openInlinePayment({
    email,
    amount,
    reference,
    onSuccess,
    onClose,
    metadata = {}
  }) {
    console.log('🔐 openInlinePayment called with:', {
      email,
      amount,
      reference,
      metadata,
      publicKeyExists: !!PAYSTACK_PUBLIC_KEY,
      sdkLoaded: !!window.PaystackPop
    });

    if (!PAYSTACK_PUBLIC_KEY) {
      console.error('❌ Paystack public key is not configured');
      console.error('Expected env var: REACT_APP_PAYSTACK_PUBLIC_KEY');
      return;
    }

    if (!window.PaystackPop) {
      console.error('❌ Paystack SDK not loaded');
      console.error('window.PaystackPop:', window.PaystackPop);
      return;
    }

    console.log('✅ Paystack SDK ready, setting up handler...');

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Convert to pesewas (GHS minor unit)
      ref: reference,
      currency: 'GHS', // Ghanaian Cedis
      metadata,
      callback: (response) => {
        console.log('💳 Paystack callback received:', response);
        if (onSuccess) onSuccess(response);
      },
      onClose: () => {
        console.log('🚪 Paystack modal closed');
        if (onClose) onClose();
      }
    });

    console.log('📱 Opening Paystack iframe...');
    try {
      handler.openIframe();
    } catch (error) {
      console.error('❌ Error opening Paystack iframe:', error);
    }
  }

  // Get subscription status
  async getSubscriptionStatus() {
    try {
      const response = await api.subscription.getStatus();
      return response;
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await api.subscription.cancel();
      return response;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  // Update subscription plan
  async updatePlan(plan) {
    try {
      const response = await api.subscription.updatePlan(plan);
      return response;
    } catch (error) {
      console.error('Failed to update plan:', error);
      throw error;
    }
  }

  // Format currency
  formatCurrency(amount, currency = 'GHS') {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Generate reference with UUID for guaranteed uniqueness
  generateReference(prefix = 'DCL') {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${randomStr}`;
  }

  // Validate email for Paystack
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get plan details
  getPlanDetails(planType) {
    const plans = {
      'monthly': {
        id: MONTHLY_PLAN,
        name: 'Pro Monthly',
        amount: 349, // GHS 349 ~= $29
        interval: 'monthly',
        features: ['Unlimited commitments', 'Auto CRM sync', 'Advanced analytics']
      },
      'yearly': {
        id: ANNUAL_PLAN,
        name: 'Pro Yearly',
        amount: 3490, // GHS 3490 ~= $290
        interval: 'yearly',
        features: ['All Pro features', '2 months free', 'Priority support']
      }
    };

    return plans[planType] || null;
  }
}

// Create singleton instance
const paystackService = new PaystackService();

export default paystackService;