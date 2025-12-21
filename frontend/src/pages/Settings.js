import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiDatabase, 
  FiBell, 
  FiShield,
  FiLink,
  FiCheck,
  FiGlobe
} from 'react-icons/fi';
import { api } from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    company: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  const [integrations, setIntegrations] = useState({
    calendar: false,
    crm: false,
    email: false
  });

  useEffect(() => {
    fetchUserData();
    fetchIntegrations();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userFromStorage = localStorage.getItem('user');
      
      // Use mock data if no API response or use stored data
      if (userFromStorage) {
        const user = JSON.parse(userFromStorage);
        setUserData({
          name: user.name || 'Sales Manager',
          email: user.email || 'manager@dealclarity.com',
          company: user.company || 'Acme Corporation',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      } else {
        // Use default mock data
        setUserData({
          name: 'Sales Manager',
          email: 'manager@dealclarity.com',
          company: 'Acme Corporation',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set default data on error
      setUserData({
        name: 'Sales Manager',
        email: 'manager@dealclarity.com',
        company: 'Acme Corporation',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  };

  const fetchIntegrations = async () => {
    try {
      // Use mock integration data
      setIntegrations({
        calendar: false,
        crm: true,
        email: false
      });
    } catch (error) {
      console.error('Error loading integrations:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (integration) => {
    try {
      let authUrl;
      
      switch (integration) {
        case 'google-calendar':
          authUrl = generateGoogleAuthUrl('calendar');
          break;
        case 'outlook-calendar':
          authUrl = generateMicrosoftAuthUrl('calendar');
          break;
        case 'salesforce':
          authUrl = generateSalesforceAuthUrl();
          break;
        case 'hubspot':
          authUrl = generateHubSpotAuthUrl();
          break;
        default:
          toast('Integration available soon!', { icon: '🔧' });
          return;
      }
      
      if (authUrl) {
        toast.success(`Connecting to ${integration}...`);
        // In production, this would redirect to auth URL
        // window.location.href = authUrl;
      }
    } catch (error) {
      toast.error(`Failed to connect ${integration}`);
    }
  };

  const disconnectIntegration = (integration) => {
    toast.success(`${integration} disconnected successfully`);
  };

  const generateGoogleAuthUrl = (scope) => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scopes = scope === 'calendar' 
      ? 'https://www.googleapis.com/auth/calendar.readonly'
      : 'https://www.googleapis.com/auth/gmail.send';
    
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `access_type=offline&` +
      `prompt=consent`;
  };

  const generateMicrosoftAuthUrl = (scope) => {
    const clientId = process.env.REACT_APP_MICROSOFT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/microsoft/callback`;
    const scopes = scope === 'calendar'
      ? 'Calendars.Read offline_access'
      : 'Mail.Send offline_access';
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_mode=query`;
  };

  const generateSalesforceAuthUrl = () => {
    const clientId = process.env.REACT_APP_SALESFORCE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/salesforce/callback`;
    
    return `https://login.salesforce.com/services/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=api%20refresh_token`;
  };

  const generateHubSpotAuthUrl = () => {
    const clientId = process.env.REACT_APP_HUBSPOT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/hubspot/callback`;
    const scopes = 'crm.objects.contacts.read crm.objects.deals.read';
    
    return `https://app.hubspot.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}`;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'integrations', label: 'Integrations', icon: FiLink },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'preferences', label: 'Preferences', icon: FiGlobe },
    { id: 'security', label: 'Security', icon: FiShield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account, integrations, and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-72">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <h3 className="text-white font-bold text-lg">Settings Menu</h3>
              </div>
              <nav className="p-4 space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              {activeTab === 'profile' && (
                <ProfileTab 
                  userData={userData} 
                  setUserData={setUserData}
                  onSubmit={handleProfileUpdate}
                  loading={loading}
                />
              )}
              
              {activeTab === 'integrations' && (
                <IntegrationsTab 
                  integrations={integrations}
                  onConnect={connectIntegration}
                  onDisconnect={disconnectIntegration}
                />
              )}
              
              {activeTab === 'notifications' && <NotificationsTab />}
              {activeTab === 'preferences' && <PreferencesTab userData={userData} />}
              {activeTab === 'security' && <SecurityTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = ({ userData, setUserData, onSubmit, loading }) => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiUser className="text-blue-600" size={28} />
          Profile Information
        </h2>
        <p className="text-gray-500 mt-2">Update your personal and account details</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white hover:border-gray-300"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-gray-500">📧 Contact support to change email</p>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Company</label>
            <input
              type="text"
              value={userData.company}
              onChange={(e) => setUserData({ ...userData, company: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white hover:border-gray-300"
              placeholder="Acme Inc"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Timezone</label>
            <select
              value={userData.timezone}
              onChange={(e) => setUserData({ ...userData, timezone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white hover:border-gray-300"
            >
              {Intl.supportedValuesOf('timeZone').map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="pt-8 border-t-2 border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? '💾 Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Integrations Tab Component
const IntegrationsTab = ({ integrations, onConnect, onDisconnect }) => {
  const integrationList = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your Google Calendar events',
      icon: FiCalendar,
      connected: integrations.calendar,
      color: 'from-red-50 to-red-100 border-red-200'
    },
    {
      id: 'outlook-calendar',
      name: 'Outlook Calendar',
      description: 'Sync your Outlook Calendar events',
      icon: FiCalendar,
      connected: integrations.calendar,
      color: 'from-blue-50 to-blue-100 border-blue-200'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Sync commitments to Salesforce deals',
      icon: FiDatabase,
      connected: integrations.crm,
      color: 'from-indigo-50 to-indigo-100 border-indigo-200'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync commitments to HubSpot deals',
      icon: FiDatabase,
      connected: integrations.crm,
      color: 'from-orange-50 to-orange-100 border-orange-200'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send follow-up emails via Gmail',
      icon: FiMail,
      connected: integrations.email,
      color: 'from-red-50 to-red-100 border-red-200'
    },
    {
      id: 'outlook-email',
      name: 'Outlook Email',
      description: 'Send follow-up emails via Outlook',
      icon: FiMail,
      connected: integrations.email,
      color: 'from-blue-50 to-blue-100 border-blue-200'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiLink className="text-blue-600" size={28} />
          Connected Integrations
        </h2>
        <p className="text-gray-500 mt-2">Connect your favorite apps and services</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrationList.map(integration => (
          <div 
            key={integration.id} 
            className={`bg-gradient-to-br ${integration.color} border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg ${
              integration.connected ? 'opacity-100' : 'opacity-75 hover:opacity-100'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <integration.icon size={24} className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{integration.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                </div>
              </div>
              
              {integration.connected ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700 whitespace-nowrap ml-2">
                  <FiCheck className="mr-1" size={18} />
                  Connected
                </span>
              ) : (
                <button
                  onClick={() => onConnect(integration.id)}
                  className="px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all whitespace-nowrap ml-2"
                >
                  Connect
                </button>
              )}
            </div>
            
            {integration.connected && (
              <div className="pt-4 border-t-2 border-gray-200">
                <button 
                  onClick={() => onDisconnect(integration.name)}
                  className="text-sm text-red-600 hover:text-red-800 font-bold hover:underline transition-colors"
                >
                  🔌 Disconnect
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Notifications Tab Component
const NotificationsTab = () => {
  const [notifications, setNotifications] = useState({
    emailSummary: true,
    beforeCall: true,
    overdueCommitments: true,
    dealUpdates: false,
    weeklyReport: true,
    marketing: false
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async () => {
    try {
      toast.loading('Saving notification preferences...');
      await new Promise(resolve => setTimeout(resolve, 600));
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save notification settings');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiBell className="text-blue-600" size={28} />
          Notification Preferences
        </h2>
        <p className="text-gray-500 mt-2">Choose how and when to receive notifications</p>
      </div>
      
      <div className="space-y-4">
        {[
          { key: 'emailSummary', label: '📧 Daily email summary', description: 'Get a daily digest of your commitments and overdue items' },
          { key: 'beforeCall', label: '📞 Pre-call reminders', description: 'Get notified 15 minutes before scheduled calls' },
          { key: 'overdueCommitments', label: '⏰ Overdue commitments', description: 'Get alerts when commitments become overdue' },
          { key: 'dealUpdates', label: '📊 Deal updates', description: 'Receive updates when deals change stage in CRM' },
          { key: 'weeklyReport', label: '📈 Weekly performance report', description: 'Get a weekly summary of your deal velocity' },
          { key: 'marketing', label: '💡 Product updates & tips', description: 'Receive occasional product updates and best practices' }
        ].map(item => (
          <div key={item.key} className="flex items-start justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all bg-white hover:shadow-md">
            <div className="flex-1 pr-4">
              <h3 className="font-bold text-gray-900 text-lg">{item.label}</h3>
              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
            </div>
            <button
              onClick={() => handleToggle(item.key)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full ml-4 flex-shrink-0 transition-all ${
                notifications[item.key] ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-300' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all ${
                notifications[item.key] ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-8 border-t-2 border-gray-100">
        <button 
          onClick={handleSaveNotifications}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200"
        >
          ✓ Save Notification Settings
        </button>
      </div>
    </div>
  );
};

// Preferences Tab Component
const PreferencesTab = ({ userData }) => {
  const [preferences, setPreferences] = useState({
    autoRecord: false,
    defaultTemplate: 'standard',
    showClarityScore: true,
    sendCopyToSelf: true,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00'
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiGlobe className="text-blue-600" size={28} />
          App Preferences
        </h2>
        <p className="text-gray-500 mt-2">Customize your app experience</p>
      </div>
      
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100">
          <label className="block text-sm font-bold text-gray-700 mb-3">📧 Default Email Template</label>
          <select
            value={preferences.defaultTemplate}
            onChange={(e) => setPreferences({ ...preferences, defaultTemplate: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
          >
            <option value="standard">Standard Follow-up</option>
            <option value="brief">Brief & Direct</option>
            <option value="friendly">Friendly & Collaborative</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100">
            <label className="block text-sm font-bold text-gray-700 mb-3">⏰ Working Hours Start</label>
            <input
              type="time"
              value={preferences.workingHoursStart}
              onChange={(e) => setPreferences({ ...preferences, workingHoursStart: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white"
            />
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100">
            <label className="block text-sm font-bold text-gray-700 mb-3">⏰ Working Hours End</label>
            <input
              type="time"
              value={preferences.workingHoursEnd}
              onChange={(e) => setPreferences({ ...preferences, workingHoursEnd: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-white"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
            <div>
              <h3 className="font-bold text-gray-900">🎙️ Auto-record calls</h3>
              <p className="text-sm text-gray-600 mt-1">Automatically start recording when calls begin</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, autoRecord: !preferences.autoRecord })}
              className={`relative inline-flex h-7 w-14 items-center rounded-full flex-shrink-0 transition-all ${
                preferences.autoRecord ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-300' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all ${
                preferences.autoRecord ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
            <div>
              <h3 className="font-bold text-gray-900">📊 Show clarity score</h3>
              <p className="text-sm text-gray-600 mt-1">Display commitment clarity score in dashboard</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, showClarityScore: !preferences.showClarityScore })}
              className={`relative inline-flex h-7 w-14 items-center rounded-full flex-shrink-0 transition-all ${
                preferences.showClarityScore ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-300' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all ${
                preferences.showClarityScore ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
            <div>
              <h3 className="font-bold text-gray-900">✉️ Send copy to yourself</h3>
              <p className="text-sm text-gray-600 mt-1">BCC yourself on all follow-up emails</p>
            </div>
            <button
              onClick={() => setPreferences({ ...preferences, sendCopyToSelf: !preferences.sendCopyToSelf })}
              className={`relative inline-flex h-7 w-14 items-center rounded-full flex-shrink-0 transition-all ${
                preferences.sendCopyToSelf ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-300' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all ${
                preferences.sendCopyToSelf ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t-2 border-gray-100">
        <button 
          onClick={async () => {
            toast.loading('Saving preferences...');
            await new Promise(resolve => setTimeout(resolve, 600));
            toast.success('Preferences saved');
          }}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200"
        >
          ✓ Save Preferences
        </button>
      </div>
    </div>
  );
};

// Security Tab Component
const SecurityTab = () => {
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (security.newPassword !== security.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (security.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    toast.loading('Changing password...');
    await new Promise(resolve => setTimeout(resolve, 800));
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Password changed successfully');
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiShield className="text-blue-600" size={28} />
          Security & Privacy
        </h2>
        <p className="text-gray-500 mt-2">Manage your password and active sessions</p>
      </div>
      
      <div className="space-y-8">
        {/* Change Password Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🔑 Change Password
          </h3>
          
          <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Current Password</label>
              <input
                type="password"
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">New Password</label>
              <input
                type="password"
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Confirm New Password</label>
              <input
                type="password"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200"
            >
              🔐 Change Password
            </button>
          </form>
        </div>
        
        {/* Active Sessions */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            📱 Active Sessions
          </h3>
          
          <div className="bg-white border-2 border-green-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900">💻 Current Session</p>
                <p className="text-sm text-gray-600 mt-2">
                  {navigator.userAgent.split('(')[1]?.split(')')[0] || 'Device'} • {new Date().toLocaleDateString()}
                </p>
              </div>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700">
                🟢 Active
              </span>
            </div>
            
            <button className="mt-5 text-sm text-gray-600 hover:text-gray-900 font-bold hover:underline transition-colors">
              📤 Sign out of all other sessions
            </button>
          </div>
        </div>
        
        {/* Danger Zone */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 p-8 rounded-2xl border-2 border-red-200">
          <h3 className="text-xl font-bold text-red-700 mb-6 flex items-center gap-2">
            ⚠️ Danger Zone
          </h3>
          
          <div className="bg-white border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-red-800 text-lg">Delete Account</h4>
                <p className="text-sm text-red-600 mt-2">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold whitespace-nowrap ml-4 transition-colors">
                🗑️ Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;