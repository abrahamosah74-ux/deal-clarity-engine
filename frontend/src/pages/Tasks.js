import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../services/api';
import { FiPlus, FiCheck, FiTrash2, FiFlag, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('open');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other',
    priority: 'medium',
    dueDate: '',
    dealId: '',
    contactId: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks?status=${filter}`);
      setTasks(response.tasks || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/tasks/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/tasks', formData);
      setFormData({
        title: '',
        description: '',
        type: 'other',
        priority: 'medium',
        dueDate: '',
        dealId: '',
        contactId: ''
      });
      setShowForm(false);
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: 'completed' });
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
        fetchStats();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FiPlus /> New Task
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Total Tasks</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalTasks}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Completed</div>
            <div className="text-3xl font-bold text-green-600">{stats.completedTasks}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Open</div>
            <div className="text-3xl font-bold text-blue-600">{stats.openTasks}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Overdue</div>
            <div className="text-3xl font-bold text-red-600">{stats.overdueTasks}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Completion Rate</div>
            <div className="text-3xl font-bold text-purple-600">{stats.completionRate}%</div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Create New Task</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Task Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="p-2 border border-gray-300 rounded"
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              className="p-2 border border-gray-300 rounded"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="follow-up">Follow-up</option>
              <option value="other">Other</option>
            </select>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="p-2 border border-gray-300 rounded col-span-1 md:col-span-2"
              rows="3"
            />
            <div className="flex gap-2 col-span-1 md:col-span-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['open', 'completed', 'in-progress'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No tasks in this status. Great job!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition flex items-center gap-4">
              <button
                onClick={() => handleComplete(task._id)}
                className={`p-2 rounded ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <FiCheck />
              </button>
              <div className="flex-1">
                <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                <div className="flex gap-2 items-center mt-2 text-xs text-gray-500">
                  <FiCalendar size={12} /> {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  <span className={`px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{task.type}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(task._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;
