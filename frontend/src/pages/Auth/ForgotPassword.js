import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      console.log('Forgot password response:', response);
      
      // API returns data directly from interceptor
      // Check for success in response itself or HTTP 200 status
      if (response && (response.success === true || response.message || Object.keys(response).length > 0)) {
        setSubmitted(true);
        toast.success('Reset code sent! Check your email or spam folder.');
        
        // Redirect to reset password page after 2 seconds
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 2000);
      } else {
        toast.error(response?.error || 'Failed to send reset code. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        data: error.response?.data,
        headers: error.config?.headers,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
      const errorMsg = error.response?.data?.error || error.message || 'Failed to send reset code. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '400px',
        padding: '40px 30px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#333',
            margin: '0 0 10px 0'
          }}>
            Reset Password
          </h1>
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: '0'
          }}>
            Enter your email to receive a reset code
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              style={{
                width: '100%',
                padding: '12px',
                background: isLoading || !email ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading || !email ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '10px'
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '10px'
            }}>
              ✅
            </div>
            <h3 style={{
              color: '#22c55e',
              margin: '0 0 10px 0',
              fontSize: '18px'
            }}>
              Code Sent!
            </h3>
            <p style={{
              color: '#666',
              fontSize: '14px',
              margin: '0'
            }}>
              Check your email or spam folder for your reset code. You'll be redirected in a moment...
            </p>
          </div>
        )}

        {/* Footer Links */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            Remember your password?{' '}
            <Link to="/login" style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }} onMouseEnter={(e) => e.target.style.color = '#764ba2'}
               onMouseLeave={(e) => e.target.style.color = '#667eea'}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
