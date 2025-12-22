import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FiBarChart2, FiCalendar, FiSettings, FiLogOut, FiCreditCard, FiUsers, FiCheckSquare, FiTrendingUp, FiColumns, FiBell, FiUpload, FiMail, FiFileText, FiChevronLeft, FiChevronRight, FiMenu, FiX } from 'react-icons/fi';
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
import EmailTemplates from './pages/EmailTemplates';
import Reports from './pages/Reports';
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import NotificationCenter from './components/Notifications/NotificationCenter';
import { useNotifications } from './hooks/useNotifications';
import './App.css';

function Layout({ children, sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { onNotification } = useNotifications(user?._id, user?.team);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'text-gray-400 hover:text-white';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop */}
      <nav className={`hidden md:flex ${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl border-r border-slate-700 flex-col transition-all duration-300`}>
        {/* Brand */}
        <div className="px-6 py-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FiBarChart2 size={24} className="text-blue-600" />
              </div>
              <span className="text-xl font-bold text-white">Deal Clarity</span>
            </div>
          )}
          {!sidebarOpen && (
            <div className="p-2 bg-white rounded-lg">
              <FiBarChart2 size={24} className="text-blue-600" />
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <FiChevronLeft size={20} className="text-white" /> : <FiChevronRight size={20} className="text-white" />}
          </button>
        </div>
        
        {/* Menu */}
        <ul className="flex-1 px-4 py-6 space-y-2">
          <li>
            <Link to="/" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/')}`} title="Dashboard">
              <FiBarChart2 size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link to="/analytics" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/analytics')}`} title="Analytics">
              <FiTrendingUp size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Analytics</span>}
            </Link>
          </li>
          <li>
            <Link to="/kanban" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/kanban')}`} title="Pipeline">
              <FiColumns size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Pipeline</span>}
            </Link>
          </li>
          <li>
            <Link to="/contacts" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/contacts')}`} title="Contacts">
              <FiUsers size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Contacts</span>}
            </Link>
          </li>
          <li>
            <Link to="/tasks" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/tasks')}`} title="Tasks">
              <FiCheckSquare size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Tasks</span>}
            </Link>
          </li>
          <li>
            <Link to="/notifications" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/notifications')}`} title="Notifications">
              <FiBell size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Notifications</span>}
            </Link>
          </li>
          <li>
            <Link to="/calendar" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/calendar')}`} title="Calendar">
              <FiCalendar size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Calendar</span>}
            </Link>
          </li>
          <li>
            <Link to="/import-export" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/import-export')}`} title="Import/Export">
              <FiUpload size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Import/Export</span>}
            </Link>
          </li>
          <li>
            <Link to="/email" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/email')}`} title="Email">
              <FiMail size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Email</span>}
            </Link>
          </li>
          <li>
            <Link to="/reports" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/reports')}`} title="Reports">
              <FiFileText size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Reports</span>}
            </Link>
          </li>
          <li>
            <Link to="/email-templates" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/email-templates')}`} title="Email Templates">
              <FiMail size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Email Templates</span>}
            </Link>
          </li>
          <li>
            <Link to="/subscriptions" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/subscriptions')}`} title="Subscriptions">
              <FiCreditCard size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Subscriptions</span>}
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/settings')}`} title="Settings">
              <FiSettings size={20} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">Settings</span>}
            </Link>
          </li>
        </ul>
        
        {/* Logout */}
        <div className="px-4 py-6 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            title="Logout"
          >
            <FiLogOut size={20} className="flex-shrink-0" />
            {sidebarOpen && <span className="truncate">Logout</span>}
          </button>
        </div>
      </nav>
      
      {/* Mobile Sidebar - Drawer */}
      {mobileMenuOpen && (
        <nav className="fixed inset-0 w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl border-r border-slate-700 flex flex-col z-40 md:hidden">
          {/* Brand */}
          <div className="px-6 py-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FiBarChart2 size={24} className="text-blue-600" />
              </div>
              <span className="text-xl font-bold text-white">Deal Clarity</span>
            </div>
            <button 
              onClick={closeMobileMenu}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <FiX size={20} className="text-white" />
            </button>
          </div>
          
          {/* Menu */}
          <ul className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <li>
              <Link to="/" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/')}`} onClick={closeMobileMenu}>
                <FiBarChart2 size={20} className="flex-shrink-0" />
                <span className="truncate">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/analytics" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/analytics')}`} onClick={closeMobileMenu}>
                <FiTrendingUp size={20} className="flex-shrink-0" />
                <span className="truncate">Analytics</span>
              </Link>
            </li>
            <li>
              <Link to="/kanban" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/kanban')}`} onClick={closeMobileMenu}>
                <FiColumns size={20} className="flex-shrink-0" />
                <span className="truncate">Pipeline</span>
              </Link>
            </li>
            <li>
              <Link to="/contacts" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/contacts')}`} onClick={closeMobileMenu}>
                <FiUsers size={20} className="flex-shrink-0" />
                <span className="truncate">Contacts</span>
              </Link>
            </li>
            <li>
              <Link to="/tasks" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/tasks')}`} onClick={closeMobileMenu}>
                <FiCheckSquare size={20} className="flex-shrink-0" />
                <span className="truncate">Tasks</span>
              </Link>
            </li>
            <li>
              <Link to="/notifications" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/notifications')}`} onClick={closeMobileMenu}>
                <FiBell size={20} className="flex-shrink-0" />
                <span className="truncate">Notifications</span>
              </Link>
            </li>
            <li>
              <Link to="/calendar" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/calendar')}`} onClick={closeMobileMenu}>
                <FiCalendar size={20} className="flex-shrink-0" />
                <span className="truncate">Calendar</span>
              </Link>
            </li>
            <li>
              <Link to="/import-export" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/import-export')}`} onClick={closeMobileMenu}>
                <FiUpload size={20} className="flex-shrink-0" />
                <span className="truncate">Import/Export</span>
              </Link>
            </li>
            <li>
              <Link to="/email" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/email')}`} onClick={closeMobileMenu}>
                <FiMail size={20} className="flex-shrink-0" />
                <span className="truncate">Email</span>
              </Link>
            </li>
            <li>
              <Link to="/reports" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/reports')}`} onClick={closeMobileMenu}>
                <FiFileText size={20} className="flex-shrink-0" />
                <span className="truncate">Reports</span>
              </Link>
            </li>
            <li>
              <Link to="/email-templates" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/email-templates')}`} onClick={closeMobileMenu}>
                <FiMail size={20} className="flex-shrink-0" />
                <span className="truncate">Email Templates</span>
              </Link>
            </li>
            <li>
              <Link to="/subscriptions" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/subscriptions')}`} onClick={closeMobileMenu}>
                <FiCreditCard size={20} className="flex-shrink-0" />
                <span className="truncate">Subscriptions</span>
              </Link>
            </li>
            <li>
              <Link to="/settings" className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 ${isActive('/settings')}`} onClick={closeMobileMenu}>
                <FiSettings size={20} className="flex-shrink-0" />
                <span className="truncate">Settings</span>
              </Link>
            </li>
          </ul>
          
          {/* Logout */}
          <div className="px-4 py-6 border-t border-slate-700">
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <FiLogOut size={20} className="flex-shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </nav>
      )}
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header with Mobile Menu and Notification Bell */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between shadow-sm">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Menu"
          >
            <FiMenu size={24} className="text-gray-700" />
          </button>
          <div className="hidden md:block" />
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

function AppRoutes({ sidebarOpen, setSidebarOpen }) {
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

  // Helper function to check if user is logged in (allow free plan users)
  const isLoggedIn = () => {
    return user && user.emailVerified;
  };

  return (
    <Routes>
      {user ? (
        <>
          {/* Routes accessible to all logged-in users (free and pro) */}
          {isLoggedIn() ? (
            <>
              <Route path="/" element={<ManagerView />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/import-export" element={<BulkImportExport />} />
              <Route path="/email" element={<EmailIntegration />} />
              <Route path="/email-templates" element={<EmailTemplates />} />
              <Route path="/reports" element={<Reports />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/subscriptions" replace />} />
          )}
          
          {/* Routes accessible without subscription */}
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Landing />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContainer sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContainer({ sidebarOpen, setSidebarOpen }) {
  const { user } = useAuth();

  if (!user) {
    return <AppRoutes sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
  }

  return (
    <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <AppRoutes sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </Layout>
  );
}

export default App;
