import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiBell, FiCheckCircle, FiClock, FiAlertCircle, FiX } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    taskId: '',
    reminderTime: 'day-before', // day-before, 2-hours, 30-min, custom
    customHours: 24
  });

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await api.get('/tasks/due/today');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const reminders = response.data.map(task => ({
        ...task,
        daysUntilDue: Math.ceil((new Date(task.dueDate) - today) / (1000 * 60 * 60 * 24)),
        hoursUntilDue: Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60))
      }));

      setReminders(reminders);
      generateNotifications(reminders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setLoading(false);
    }
  };

  const generateNotifications = (tasks) => {
    const newNotifications = [];

    tasks.forEach(task => {
      if (task.status !== 'completed') {
        if (task.hoursUntilDue <= 2 && task.hoursUntilDue > 0) {
          newNotifications.push({
            id: `${task._id}-urgent`,
            type: 'urgent',
            title: 'Task Due Soon!',
            message: `"${task.title}" is due in ${task.hoursUntilDue} hours`,
            taskId: task._id,
            icon: FiAlertCircle,
            color: 'bg-red-50 border-red-200'
          });
        } else if (task.hoursUntilDue <= 24 && task.hoursUntilDue > 2) {
          newNotifications.push({
            id: `${task._id}-today`,
            type: 'today',
            title: 'Task Due Today',
            message: `"${task.title}" is due today`,
            taskId: task._id,
            icon: FiClock,
            color: 'bg-yellow-50 border-yellow-200'
          });
        }
      }
    });

    setNotifications(newNotifications);
  };

  const checkReminders = async () => {
    try {
      const response = await api.get('/tasks?status=open');
      const now = new Date();
      const overdueTasks = response.data.tasks.filter(task => 
        new Date(task.dueDate) < now && task.status !== 'completed'
      );

      if (overdueTasks.length > 0) {
        const notification = {
          id: 'overdue-' + Date.now(),
          type: 'overdue',
          title: 'Overdue Tasks',
          message: `You have ${overdueTasks.length} overdue task(s)`,
          color: 'bg-red-100 border-red-300',
          urgent: true
        };
        setNotifications(prev => [notification, ...prev]);
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  const dismissNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const markTaskComplete = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: 'completed' });
      fetchReminders();
      dismissNotification(`${taskId}-urgent`);
      dismissNotification(`${taskId}-today`);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Notifications & Reminders</h1>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            {notifications.length} Active
          </span>
        </div>
      </div>

      {/* Active Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 flex items-start justify-between ${notification.color}`}
            >
              <div className="flex items-start gap-3 flex-1">
                {notification.icon && <notification.icon className="mt-1" size={20} />}
                <div>
                  <h4 className="font-semibold">{notification.title}</h4>
                  <p className="text-sm">{notification.message}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {notification.taskId && (
                  <button
                    onClick={() => markTaskComplete(notification.taskId)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
                  >
                    <FiCheckCircle size={14} /> Done
                  </button>
                )}
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Tasks */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FiBell /> Today's Tasks ({reminders.length})
        </h2>
        
        {reminders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tasks for today. Great job! 🎉</p>
        ) : (
          <div className="space-y-2">
            {reminders.map(task => (
              <div
                key={task._id}
                className={`p-4 rounded-lg border-l-4 flex items-center justify-between ${
                  task.priority === 'urgent'
                    ? 'bg-red-50 border-red-400'
                    : task.priority === 'high'
                    ? 'bg-orange-50 border-orange-400'
                    : 'bg-gray-50 border-gray-400'
                }`}
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className={`px-2 py-1 rounded font-semibold ${
                      task.priority === 'urgent'
                        ? 'bg-red-200 text-red-800'
                        : task.priority === 'high'
                        ? 'bg-orange-200 text-orange-800'
                        : task.priority === 'medium'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="bg-gray-200 px-2 py-1 rounded">{task.type}</span>
                    {task.hoursUntilDue < 24 && (
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">
                        {task.hoursUntilDue}h left
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => markTaskComplete(task._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <FiCheckCircle size={16} /> Mark Done
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Current Settings</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Email reminders: 24 hours before</li>
              <li>✓ In-app notifications: 2 hours before</li>
              <li>✓ Overdue alerts: Enabled</li>
              <li>✓ Daily summary: 9:00 AM</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span>Email reminders for upcoming tasks</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span>Push notifications on desktop</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span>SMS alerts for urgent tasks</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span>Daily task summary email</span>
            </label>
          </div>

          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">
            Save Settings
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Today's Tasks</p>
          <p className="text-3xl font-bold text-blue-600">{reminders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Urgent Tasks</p>
          <p className="text-3xl font-bold text-red-600">
            {reminders.filter(t => t.priority === 'urgent').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Due Soon (&lt;2h)</p>
          <p className="text-3xl font-bold text-orange-600">
            {reminders.filter(t => t.hoursUntilDue <= 2).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Completed Today</p>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
