import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    leadScore: 0
  });

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, []);

  useEffect(() => {
    const results = contacts.filter(contact =>
      contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.company.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredContacts(results);
  }, [search, contacts]);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts');
      setContacts(response.data.contacts || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/contacts/stats/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingContact) {
        await api.put(`/contacts/${editingContact._id}`, formData);
      } else {
        await api.post('/contacts', formData);
      }
      
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        leadScore: 0
      });
      setEditingContact(null);
      setShowForm(false);
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Failed to save contact');
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData(contact);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        fetchContacts();
        fetchStats();
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <button
          onClick={() => {
            setEditingContact(null);
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              company: '',
              jobTitle: '',
              leadScore: 0
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FiPlus /> New Contact
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Total Contacts</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalContacts}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Avg Lead Score</div>
            <div className="text-3xl font-bold text-gray-900">{stats.avgLeadScore}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">High Priority</div>
            <div className="text-3xl font-bold text-blue-600">{stats.highPriorityLeads}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-gray-600 text-sm">Companies</div>
            <div className="text-3xl font-bold text-gray-900">{stats.uniqueCompanies}</div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {editingContact ? 'Edit Contact' : 'New Contact'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name *"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Job Title"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Lead Score (0-100)"
              min="0"
              max="100"
              value={formData.leadScore}
              onChange={(e) => setFormData({ ...formData, leadScore: parseInt(e.target.value) || 0 })}
              className="p-2 border border-gray-300 rounded"
            />
            <div className="flex gap-2 col-span-1 md:col-span-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {editingContact ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingContact(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No contacts found. Create your first contact!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContacts.map((contact) => (
            <div key={contact._id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  <div className="text-gray-600 text-sm space-y-1 mt-2">
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <FiMail size={16} /> {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2">
                        <FiPhone size={16} /> {contact.phone}
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center gap-2">
                        <FiMapPin size={16} /> {contact.company}
                      </div>
                    )}
                    {contact.jobTitle && (
                      <div className="text-sm">{contact.jobTitle}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <div className="text-2xl font-bold text-blue-600">{contact.leadScore}</div>
                    <div className="text-xs text-gray-500">Lead Score</div>
                  </div>
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(contact._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contacts;
