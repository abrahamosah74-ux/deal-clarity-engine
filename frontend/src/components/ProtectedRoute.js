import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 animate-spin">
            <span className="text-2xl font-bold text-white">DC</span>
          </div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but no active subscription - redirect to subscriptions page
  // Allow /subscriptions route and /settings route
  if (!user.subscription?.isActive && location.pathname !== '/subscriptions' && location.pathname !== '/settings') {
    return <Navigate to="/subscriptions" state={{ from: location, requiresSubscription: true }} replace />;
  }

  return children;
};

export default ProtectedRoute;
