import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiCalendar, FiSettings, FiLogOut, FiCreditCard, FiUsers, FiCheckSquare, FiTrendingUp, FiColumns, FiBell, FiUpload, FiMail, FiFileText } from 'react-icons/fi';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import ManagerView from './components/Dashboard/ManagerView';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Subscriptions from './pages/Subscriptions';
import Contacts from './pages/Contacts';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Kanban from './pages/Kanban';
import Notifications from './pages/Notifications';
import BulkImportExport from './pages/BulkImportExport';
import EmailIntegration from './pages/EmailIntegration';
import Reports from './pages/Reports';
import Login from './pages/Auth/Login';
import NotificationCenter from './components/Notifications/NotificationCenter';
import { useNotifications } from './hooks/useNotifications';
import './App.css';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { onNotification } = useNotifications(user?._id, user?.team);

  const isActive = (path) => location.pathname === path ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'text-gray-400 hover:text-white';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <nav className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl border-r border-slate-700 flex flex-col">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-slate-700 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="p-2 bg-white rounded-lg">
            <FiBarChart2 size={24} className="text-blue-600" />
          </div>
          <span className="text-xl font-bold text-white">Deal Clarity</span>
        </div>
        
        {/* Menu */}
        <ul className="flex-1 px-4 py-6 space-y-2">
          <li>
            <Link to="/" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/')}`}>
              <FiBarChart2 size={20} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/analytics" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/analytics')}`}>
              <FiTrendingUp size={20} />
              Analytics
            </Link>
          </li>
          <li>
            <Link to="/kanban" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/kanban')}`}>
              <FiColumns size={20} />
              Pipeline
            </Link>
          </li>
          <li>
            <Link to="/contacts" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/contacts')}`}>
              <FiUsers size={20} />
              Contacts
            </Link>
          </li>
          <li>
            <Link to="/tasks" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/tasks')}`}>
              <FiCheckSquare size={20} />
              Tasks
            </Link>
          </li>
          <li>
            <Link to="/notifications" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/notifications')}`}>
              <FiBell size={20} />
              Notifications
            </Link>
          </li>
          <li>
            <Link to="/calendar" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/calendar')}`}>
              <FiCalendar size={20} />
              Calendar
            </Link>
          </li>
          <li>
            <Link to="/import-export" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/import-export')}`}>
              <FiUpload size={20} />
              Import/Export
            </Link>
          </li>
          <li>
            <Link to="/email" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/email')}`}>
              <FiMail size={20} />
              Email
            </Link>
          </li>
          <li>
            <Link to="/reports" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/reports')}`}>
              <FiFileText size={20} />
              Reports
            </Link>
          </li>
          <li>
            <Link to="/subscriptions" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/subscriptions')}`}>
              <FiCreditCard size={20} />
              Subscriptions
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/settings')}`}>
              <FiSettings size={20} />
              Settings
            </Link>
          </li>
        </ul>
        
        {/* Logout */}
        <div className="px-4 py-6 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header with Notification Bell */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end shadow-sm">
          <NotificationCenter userId={user?._id} teamId={user?.team} />
        </div>
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" element={<Layout><ManagerView /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/kanban" element={<Layout><Kanban /></Layout>} />
          <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
          <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
          <Route path="/notifications" element={<Layout><Notifications /></Layout>} />
          <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
          <Route path="/import-export" element={<Layout><BulkImportExport /></Layout>} />
          <Route path="/email" element={<Layout><EmailIntegration /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/subscriptions" element={<Layout><Subscriptions /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/login" element={<Login />} />
        </>
      ) : (
        <Route path="*" element={<Login />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
