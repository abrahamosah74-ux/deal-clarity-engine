// frontend/src/components/Notifications/NotificationCenter.js
import React, { useState, useEffect } from 'react';
import { FiBell, FiX, FiCheck, FiArchive, FiTrash2 } from 'react-icons/fi';
import { api } from '../../services/api';
import socketService from '../../services/socket';
import './NotificationCenter.css';

const NotificationCenter = ({ userId, teamId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('unread'); // 'all', 'unread', 'read'
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchNotifications();
    setupSocketListeners();

    return () => {
      socketService.off('notification', handleNewNotification);
      socketService.off('team_notification', handleTeamNotification);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const readParam = filter === 'unread' ? 'false' : filter === 'read' ? 'true' : undefined;

      const response = await api.get('/notifications', {
        params: {
          read: readParam,
          limit: 20,
          skip: page * 20
        }
      });

      if (page === 0) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }

      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('notification', handleNewNotification);
    socketService.on('team_notification', handleTeamNotification);
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    showBrowserNotification(notification);
  };

  const handleTeamNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    showBrowserNotification(notification);
  };

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      });
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all/read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleArchive = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/archive`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'deal_created':
        return '📋';
      case 'deal_stage_changed':
        return '📈';
      case 'deal_closed':
        return '✅';
      case 'task_assigned':
        return '✓';
      case 'workflow_executed':
        return '⚙️';
      case 'team_member_added':
        return '👥';
      default:
        return '📢';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <div className="notification-center">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="notification-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => { setFilter('all'); setPage(0); }}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => { setFilter('unread'); setPage(0); }}
            >
              Unread
            </button>
            <button
              className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
              onClick={() => { setFilter('read'); setPage(0); }}
            >
              Read
            </button>
            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <p>No notifications</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''} priority-${notification.priority}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    {notification.message && (
                      <div className="notification-message">{notification.message}</div>
                    )}
                    <div className="notification-time">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        className="action-btn mark-read"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <FiCheck />
                      </button>
                    )}
                    <button
                      className="action-btn archive"
                      onClick={() => handleArchive(notification._id)}
                      title="Archive"
                    >
                      <FiArchive />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(notification._id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredNotifications.length > 0 && (
            <div className="notification-footer">
              <button
                className="load-more-btn"
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
