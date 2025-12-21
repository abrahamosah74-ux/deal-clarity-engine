import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiBriefcase, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
        
        // Check if email needs verification
        if (result.requiresVerification) {
          setVerificationEmail(formData.email);
          setShowVerification(true);
          toast.error('Please verify your email first');
        } else if (result.success) {
          toast.success('Welcome back!');
          navigate(from, { replace: true });
        } else {
          toast.error(result.error);
        }
      } else {
        result = await register(formData);
        
        if (result.requiresVerification) {
          // Show verification screen
          setVerificationEmail(formData.email);
          setShowVerification(true);
          toast.success('Check your email for verification code');
        } else if (result.success) {
          toast.success('Account created successfully!');
          navigate('/subscriptions', { replace: true });
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast.error('Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: verificationEmail,
          verificationCode: verificationCode.toUpperCase()
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Email verified successfully!');
        setShowVerification(false);
        setVerificationCode('');
        
        // Auto login after verification
        if (data.token) {
          localStorage.setItem('token', data.token);
          navigate(from, { replace: true });
        } else {
          // If no token, go to login
          setIsLogin(true);
        }
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: verificationEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Verification code sent to your email');
      } else {
        toast.error(data.error || 'Failed to resend code');
      }
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <span className="text-2xl font-bold text-white">DC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Deal Clarity Engine</h1>
          <p className="text-gray-600 mt-2">Turn discovery calls into deal momentum</p>
        </div>

        {/* Verification Screen */}
        {showVerification ? (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={() => {
                setShowVerification(false);
                setVerificationCode('');
                setIsLogin(true);
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              <FiArrowLeft className="mr-2" />
              Back to Login
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600 mb-8">
              We've sent a verification code to <span className="font-medium">{verificationEmail}</span>. Enter it below to confirm your email.
            </p>

            <form onSubmit={handleVerifyEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 text-sm mb-4">
                Didn't receive a code?
              </p>
              <button
                onClick={handleResendCode}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              >
                Resend Verification Code
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 text-center font-medium rounded-lg transition-colors ${
                  isLogin 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 text-center font-medium rounded-lg transition-colors ${
                  !isLogin 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="block text-sm font-medium text-gray-700">
                    <FiLock className="inline mr-2" />
                    Password
                  </label>
                  {isLogin && (
                    <Link 
                      to="/forgot-password"
                      style={{
                        fontSize: '12px',
                        color: '#667eea',
                        textDecoration: 'none',
                        fontWeight: '500',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                      onMouseLeave={(e) => e.target.style.color = '#667eea'}
                    >
                      Forgot?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiBriefcase className="inline mr-2" />
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Acme Inc"
                  />
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-center text-gray-600">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        )}
        
        {!showVerification && (
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Forgot your password?{' '}
              <Link to="/reset-password" className="text-blue-600 hover:text-blue-800 font-medium">
                Reset it here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;