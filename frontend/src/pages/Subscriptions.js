// frontend/src/pages/Subscriptions.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiCreditCard, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import paystackService from '../services/paystack';
import api from '../services/api';

const Subscriptions = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState({
    free: {
      name: 'Free',
      price: 0,
      priceUSD: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      headline: 'Test the basics',
      features: [
        { name: 'Up to 5 deals', included: true },
        { name: 'Basic commitment tracking', included: true },
        { name: 'Manual CRM sync', included: false },
        { name: 'Email notifications', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Priority support', included: false }
      ],
      cta: 'Current Plan',
      buttonStyle: 'secondary'
    },
    monthly: {
      name: 'Pro Monthly',
      price: 349,
      priceUSD: '$29',
      period: 'month',
      description: 'Most popular for sales teams',
      headline: 'Automate your entire sales process',
      features: [
        { name: 'Unlimited deals', included: true },
        { name: 'Commitment tracking', included: true },
        { name: 'Auto CRM sync', included: true },
        { name: 'Email notifications', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Email support', included: true }
      ],
      cta: 'Upgrade Now',
      buttonStyle: 'primary',
      savingsPercent: '17%'
    },
    yearly: {
      name: 'Pro Yearly',
      price: 3490,
      priceUSD: '$290',
      period: 'year',
      description: 'Best value plan',
      headline: 'Scale your sales with confidence',
      features: [
        { name: 'Unlimited deals', included: true },
        { name: 'Commitment tracking', included: true },
        { name: 'Auto CRM sync', included: true },
        { name: 'Email notifications', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true }
      ],
      cta: 'Upgrade Now',
      buttonStyle: 'primary',
      badge: 'Save 17%'
    }
  });

  useEffect(() => {
    if (user?.subscription) {
      setCurrentSubscription(user.subscription);
    }
  }, [user]);

  const handleUpgrade = async (planType) => {
    console.log('🔵 handleUpgrade called with plan:', planType);
    
    if (!user?.email) {
      console.error('❌ No user email found');
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Direct Paystack shop links with success/cancel redirects
      const paystackLinks = {
        monthly: `https://paystack.shop/pay/dbrgpheeqc?email=${encodeURIComponent(user.email)}&redirect_url=${encodeURIComponent(window.location.origin + '/dashboard?upgrade=success')}`,
        yearly: `https://paystack.shop/pay/j-1wh5btbx?email=${encodeURIComponent(user.email)}&redirect_url=${encodeURIComponent(window.location.origin + '/dashboard?upgrade=success')}`
      };

      const link = paystackLinks[planType];
      if (link) {
        console.log(`🔗 Redirecting to Paystack shop: ${link}`);
        toast.success('Opening payment portal...');
        // Store plan type for post-payment verification
        localStorage.setItem('pendingUpgradePlan', planType);
        window.location.href = link;
      } else {
        toast.error('Invalid plan selected');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to process upgrade');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await api.subscription.cancel();
      toast.success('Subscription cancelled');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const isCurrentPlan = (planType) => {
    if (planType === 'free') {
      return currentSubscription?.status !== 'active';
    }
    return currentSubscription?.plan === 'pro' && 
           ((planType === 'monthly' && currentSubscription?.interval === 'monthly') ||
            (planType === 'yearly' && currentSubscription?.interval === 'yearly'));
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount / 12); // Convert to monthly equivalent for display
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-8 pb-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💳 Subscription Plans
          </h1>
          <p className="text-lg text-gray-600">
            Choose the perfect plan for your sales team
          </p>
        </div>

        {/* Current Status */}
        {currentSubscription && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Current Plan: <span className="text-blue-600">{currentSubscription.plan}</span>
                </h3>
                <p className="text-gray-600 mt-1">
                  Status: <span className={`font-semibold ${currentSubscription.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {currentSubscription.status}
                  </span>
                </p>
                {currentSubscription.currentPeriodEnd && (
                  <p className="text-sm text-gray-500 mt-1">
                    Renews: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              {currentSubscription.status === 'active' && currentSubscription.plan !== 'free' && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Social Proof */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center mb-12">
          <p className="text-lg font-semibold text-gray-900">
            ⭐ <span className="text-blue-600">Over 120 teams</span> use Deal Clarity to manage their pipeline
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className={`rounded-2xl shadow-lg overflow-hidden transition-all transform hover:scale-105 ${
            isCurrentPlan('free') ? 'ring-4 ring-blue-600 bg-white' : 'bg-white hover:shadow-xl'
          }`}>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plans.free.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{plans.free.description}</p>
              <p className="text-blue-600 font-semibold text-sm mb-6">{plans.free.headline}</p>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">Free</span>
                  <span className="text-gray-600 ml-2">{plans.free.period}</span>
                </div>
              </div>

              {isCurrentPlan('free') && (
                <button disabled className="w-full py-3 px-4 bg-blue-100 text-blue-600 rounded-lg font-bold mb-8 cursor-default">
                  ✓ Current Plan
                </button>
              )}

              {!isCurrentPlan('free') && (
                <button disabled className="w-full py-3 px-4 bg-gray-100 text-gray-600 rounded-lg font-bold mb-8 cursor-default">
                  Downgrade
                </button>
              )}

              {/* Features */}
              <div className="space-y-4">
                {plans.free.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center">
                    {feature.included ? (
                      <FiCheck className="text-green-600 mr-3 flex-shrink-0" size={20} />
                    ) : (
                      <FiX className="text-gray-300 mr-3 flex-shrink-0" size={20} />
                    )}
                    <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Plan */}
          <div className={`rounded-2xl shadow-lg overflow-hidden transition-all transform hover:scale-105 relative ${
            isCurrentPlan('monthly') ? 'ring-4 ring-blue-600 bg-white' : 'bg-white hover:shadow-xl'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 text-center font-bold">
              🌟 Most Popular
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plans.monthly.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{plans.monthly.description}</p>
              <p className="text-blue-600 font-semibold text-sm mb-6">{plans.monthly.headline}</p>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">
                    {plans.monthly.priceUSD}
                  </span>
                  <span className="text-gray-600 ml-2">/{plans.monthly.period}</span>
                </div>
              </div>

              {isCurrentPlan('monthly') && (
                <button disabled className="w-full py-3 px-4 bg-blue-100 text-blue-600 rounded-lg font-bold mb-8 cursor-default">
                  ✓ Current Plan
                </button>
              )}

              {!isCurrentPlan('monthly') && (
                <button
                  onClick={() => handleUpgrade('monthly')}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-bold mb-8 flex items-center justify-center transition-all"
                >
                  {loading ? 'Processing...' : (
                    <>
                      {plans.monthly.cta}
                      <FiArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              )}

              {/* Features */}
              <div className="space-y-4">
                {plans.monthly.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center">
                    {feature.included ? (
                      <FiCheck className="text-green-600 mr-3 flex-shrink-0" size={20} />
                    ) : (
                      <FiX className="text-gray-300 mr-3 flex-shrink-0" size={20} />
                    )}
                    <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className={`rounded-2xl shadow-lg overflow-hidden transition-all transform hover:scale-105 relative ${
            isCurrentPlan('yearly') ? 'ring-4 ring-blue-600 bg-white' : 'bg-white hover:shadow-xl'
          }`}>
            {plans.yearly.badge && (
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 text-center font-bold">
                {plans.yearly.badge}
              </div>
            )}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plans.yearly.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{plans.yearly.description}</p>
              <p className="text-green-600 font-semibold text-sm mb-6">{plans.yearly.headline}</p>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">
                    {plans.yearly.priceUSD}
                  </span>
                  <span className="text-gray-600 ml-2">/{plans.yearly.period}</span>
                </div>
              </div>

              {isCurrentPlan('yearly') && (
                <button disabled className="w-full py-3 px-4 bg-blue-100 text-blue-600 rounded-lg font-bold mb-8 cursor-default">
                  ✓ Current Plan
                </button>
              )}

              {!isCurrentPlan('yearly') && (
                <button
                  onClick={() => handleUpgrade('yearly')}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-bold mb-8 flex items-center justify-center transition-all shadow-lg"
                >
                  {loading ? 'Processing...' : (
                    <>
                      {plans.yearly.cta}
                      <FiArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              )}

              {/* Features */}
              <div className="space-y-4">
                {plans.yearly.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center">
                    {feature.included ? (
                      <FiCheck className="text-green-600 mr-3 flex-shrink-0" size={20} />
                    ) : (
                      <FiX className="text-gray-300 mr-3 flex-shrink-0" size={20} />
                    )}
                    <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major cards via Paystack (Visa, Mastercard, Verve). Paystack is PCI DSS compliant.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! Start with our Free plan and upgrade anytime. No credit card required for the free tier.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                What happens when my subscription expires?
              </h3>
              <p className="text-gray-600">
                Your subscription auto-renews. You'll receive a reminder 7 days before renewal. Cancel anytime, no questions asked.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day money-back guarantee if you're not satisfied. Contact support for more details.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Need help choosing?
              </h3>
              <p className="text-gray-600">
                Contact our support team at webmatrix90s@protonmail.com. We're happy to help you find the right plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
