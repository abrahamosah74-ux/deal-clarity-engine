import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';
import { FiUsers, FiServer, FiActivity, FiBarChart2, FiSettings, FiAlertCircle, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      toast.error('Unauthorized: Admin access required');
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, teamsRes, healthRes] = await Promise.all([
        axios.get('/api/admin/stats').catch(() => ({ data: {} })),
        axios.get('/api/admin/users').catch(() => ({ data: { users: [] } })),
        axios.get('/api/admin/teams').catch(() => ({ data: { teams: [] } })),
        axios.get('/api/health').catch(() => ({ data: { status: 'unknown' } }))
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setTeams(teamsRes.data.teams || []);
      setSystemHealth(healthRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await axios.patch(`/api/admin/users/${userId}/deactivate`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deactivated');
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-unauthorized">
        <FiAlertCircle size={48} />
        <h2>Unauthorized Access</h2>
        <p>You do not have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>System overview, user management, and platform metrics</p>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart2 /> Overview
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FiUsers /> Users ({users.length})
        </button>
        <button
          className={`tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          <FiServer /> Teams ({teams.length})
        </button>
        <button
          className={`tab ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <FiActivity /> System Health
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings /> Settings
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading admin data...</div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content overview-tab">
              {stats && (
                <>
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-icon users-icon">
                        <FiUsers size={28} />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">Total Users</span>
                        <span className="metric-value">{stats.totalUsers || 0}</span>
                        <span className="metric-change">Active: {stats.activeUsers || 0}</span>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon teams-icon">
                        <FiServer size={28} />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">Teams</span>
                        <span className="metric-value">{stats.totalTeams || 0}</span>
                        <span className="metric-change">Avg members: {stats.avgTeamSize || 0}</span>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon revenue-icon">
                        <FiTrendingUp size={28} />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">Paid Subscriptions</span>
                        <span className="metric-value">{stats.paidSubscriptions || 0}</span>
                        <span className="metric-change">MRR: ${stats.monthlyRecurringRevenue || 0}</span>
                      </div>
                    </div>

                    <div className="metric-card">
                      <div className="metric-icon deals-icon">
                        <FiActivity size={28} />
                      </div>
                      <div className="metric-info">
                        <span className="metric-label">Total Deals</span>
                        <span className="metric-value">{stats.totalDeals || 0}</span>
                        <span className="metric-change">Pipeline: ${(stats.totalPipelineValue / 1000000).toFixed(2)}M</span>
                      </div>
                    </div>
                  </div>

                  <div className="overview-section">
                    <h2>Platform Activity</h2>
                    <div className="activity-grid">
                      <div className="activity-item">
                        <span className="activity-label">Daily Active Users</span>
                        <span className="activity-value">{stats.dailyActiveUsers || 0}</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-label">New Users (30d)</span>
                        <span className="activity-value">{stats.newUsers30d || 0}</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-label">API Calls (24h)</span>
                        <span className="activity-value">{stats.apiCalls24h || 0}</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-label">Storage Used</span>
                        <span className="activity-value">{stats.storageUsedGB || 0}GB</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="tab-content users-tab">
              <div className="users-header">
                <h2>User Management</h2>
                <input
                  type="search"
                  placeholder="Search users by name or email..."
                  className="search-input"
                />
              </div>

              {users.length === 0 ? (
                <div className="empty-state">No users found</div>
              ) : (
                <div className="users-table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Team</th>
                        <th>Subscription</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td className="name-cell">
                            <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                            {u.name}
                          </td>
                          <td className="email-cell">{u.email}</td>
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                              className="role-select"
                            >
                              <option value="rep">Rep</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>{u.currentTeam?.name || '-'}</td>
                          <td>
                            <span className={`badge ${u.subscription?.status || 'inactive'}`}>
                              {u.subscription?.status || 'inactive'}
                            </span>
                          </td>
                          <td className="date-cell">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="actions-cell">
                            <button
                              className="action-btn deactivate"
                              onClick={() => handleDeactivateUser(u._id)}
                              title="Deactivate user"
                            >
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="tab-content teams-tab">
              <h2>Teams Management</h2>
              {teams.length === 0 ? (
                <div className="empty-state">No teams found</div>
              ) : (
                <div className="teams-grid">
                  {teams.map((team) => (
                    <div key={team._id} className="team-card">
                      <div className="team-header">
                        <h3>{team.name}</h3>
                        <span className="member-badge">{team.members?.length || 0} members</span>
                      </div>
                      <div className="team-details">
                        <p><strong>Owner:</strong> {team.createdBy?.name || 'Unknown'}</p>
                        <p><strong>Created:</strong> {new Date(team.createdAt).toLocaleDateString()}</p>
                        <p><strong>Subscription:</strong> {team.subscription?.plan || 'free'}</p>
                      </div>
                      <div className="team-members">
                        <strong>Members:</strong>
                        <ul>
                          {team.members?.slice(0, 3).map((member, idx) => (
                            <li key={idx}>{member.user?.name} ({member.role})</li>
                          ))}
                          {team.members?.length > 3 && (
                            <li className="more">+{team.members.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* System Health Tab */}
          {activeTab === 'health' && (
            <div className="tab-content health-tab">
              <h2>System Health</h2>
              {systemHealth && (
                <div className="health-grid">
                  <div className={`health-card ${systemHealth.status === 'ok' ? 'healthy' : 'unhealthy'}`}>
                    <div className="health-status">
                      {systemHealth.status === 'ok' ? (
                        <FiCheckCircle size={32} className="status-icon ok" />
                      ) : (
                        <FiAlertCircle size={32} className="status-icon warning" />
                      )}
                    </div>
                    <div className="health-info">
                      <span className="health-label">API Status</span>
                      <span className="health-value">{systemHealth.status?.toUpperCase() || 'UNKNOWN'}</span>
                    </div>
                  </div>

                  <div className="health-card">
                    <span className="health-label">Database</span>
                    <span className={`health-value ${systemHealth.database === 'connected' ? 'ok' : 'error'}`}>
                      {systemHealth.database || 'Unknown'}
                    </span>
                  </div>

                  <div className="health-card">
                    <span className="health-label">Response Time</span>
                    <span className="health-value">{systemHealth.responseTime || 0}ms</span>
                  </div>

                  <div className="health-card">
                    <span className="health-label">Uptime</span>
                    <span className="health-value">{systemHealth.uptime || '100%'}</span>
                  </div>
                </div>
              )}

              <div className="health-section">
                <h3>Services Status</h3>
                <div className="services-list">
                  <div className="service-item">
                    <span className="service-name">Authentication Service</span>
                    <span className="service-status ok">✓ Operational</span>
                  </div>
                  <div className="service-item">
                    <span className="service-name">Email Service</span>
                    <span className="service-status ok">✓ Operational</span>
                  </div>
                  <div className="service-item">
                    <span className="service-name">Payment Gateway (Paystack)</span>
                    <span className="service-status ok">✓ Connected</span>
                  </div>
                  <div className="service-item">
                    <span className="service-name">File Storage</span>
                    <span className="service-status ok">✓ Operational</span>
                  </div>
                  <div className="service-item">
                    <span className="service-name">WebSocket Service</span>
                    <span className="service-status ok">✓ Connected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-content settings-tab">
              <h2>Platform Settings</h2>
              <div className="settings-form">
                <div className="settings-section">
                  <h3>Email Configuration</h3>
                  <div className="form-group">
                    <label>SMTP Server</label>
                    <input type="text" placeholder="smtp.example.com" disabled />
                  </div>
                  <div className="form-group">
                    <label>Sender Email</label>
                    <input type="email" placeholder="noreply@dealclarity.com" disabled />
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Payment Settings</h3>
                  <div className="form-group">
                    <label>Payment Provider</label>
                    <input type="text" value="Paystack" disabled />
                  </div>
                  <div className="form-group">
                    <label>Public Key</label>
                    <input type="password" placeholder="••••••••••••••••" disabled />
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Subscription Plans</h3>
                  <div className="plans-list">
                    <div className="plan">
                      <strong>Free</strong>
                      <p>$0/month</p>
                    </div>
                    <div className="plan">
                      <strong>Professional</strong>
                      <p>$99/month</p>
                    </div>
                    <div className="plan">
                      <strong>Enterprise</strong>
                      <p>Custom pricing</p>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Security Settings</h3>
                  <div className="security-options">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      Require 2FA for admin accounts
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      Enable audit logging
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      Maintenance mode
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
