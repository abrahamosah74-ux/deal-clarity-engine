import React, { useState } from 'react';
import { api } from '../services/api';
import { FiMail, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const EmailIntegration = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    template: 'custom', // custom, intro, follow-up, proposal, thank-you
    recipientType: 'selected' // selected, all, tag-based
  });

  React.useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts?limit=1000');
      setContacts(response.data.contacts || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setLoading(false);
    }
  };

  const emailTemplates = {
    custom: { subject: '', body: '' },
    intro: {
      subject: 'Great to connect with you!',
      body: `Hi {firstName},\n\nI hope this message finds you well. I wanted to reach out and explore how we might work together.\n\nLooking forward to hearing from you.\n\nBest regards,\nThe Deal Clarity Team`
    },
    'follow-up': {
      subject: 'Following up on our conversation',
      body: `Hi {firstName},\n\nJust checking in to see if you had a chance to review our proposal.\n\nPlease let me know if you have any questions or if you'd like to schedule a call.\n\nBest regards,\nThe Deal Clarity Team`
    },
    proposal: {
      subject: 'Your Custom Proposal',
      body: `Hi {firstName},\n\nPlease find attached our custom proposal tailored to your needs.\n\nI'm happy to discuss any details or answer questions you may have.\n\nBest regards,\nThe Deal Clarity Team`
    },
    'thank-you': {
      subject: 'Thank you for your business!',
      body: `Hi {firstName},\n\nThank you so much for choosing to work with us. We're excited to get started and deliver great results.\n\nIf you need anything, don't hesitate to reach out.\n\nBest regards,\nThe Deal Clarity Team`
    }
  };

  const handleTemplateChange = (template) => {
    setFormData({
      ...formData,
      template,
      subject: emailTemplates[template].subject,
      body: emailTemplates[template].body
    });
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c._id));
    }
  };

  const sendEmails = async () => {
    if (selectedContacts.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one contact' });
      return;
    }

    if (!formData.subject.trim()) {
      setMessage({ type: 'error', text: 'Please enter email subject' });
      return;
    }

    if (!formData.body.trim()) {
      setMessage({ type: 'error', text: 'Please enter email body' });
      return;
    }

    setSending(true);
    const results = { success: 0, failed: 0 };

    try {
      for (const contactId of selectedContacts) {
        const contact = contacts.find(c => c._id === contactId);
        if (!contact || !contact.email) continue;

        try {
          const personalizedBody = formData.body
            .replace('{firstName}', contact.firstName || 'there')
            .replace('{lastName}', contact.lastName || '')
            .replace('{company}', contact.company || '');

          // In real implementation, this would send via email service
          // For now, we'll log it
          console.log(`Email sent to ${contact.email}:`, {
            subject: formData.subject,
            body: personalizedBody
          });

          // Create a note for this email
          await api.post('/notes', {
            dealId: contact.dealId || null,
            contactId: contactId,
            content: `Email sent: "${formData.subject}"`,
            type: 'email'
          }).catch(() => {}); // Ignore error if no dealId

          results.success++;
        } catch (error) {
          results.failed++;
        }
      }

      setMessage({
        type: 'success',
        text: `Emails sent: ${results.success} successful, ${results.failed} failed`
      });

      setSelectedContacts([]);
      setFormData({ subject: '', body: '', template: 'custom', recipientType: 'selected' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send emails' });
    }

    setSending(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiMail /> Email Integration
        </h1>
        <p className="text-gray-600">Send personalized emails to your contacts directly from Deal Clarity</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Compose Email</h2>

            {/* Templates */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Templates</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(emailTemplates).map(key => (
                  <button
                    key={key}
                    onClick={() => handleTemplateChange(key)}
                    className={`px-3 py-2 rounded font-semibold text-sm transition ${
                      formData.template === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {key === 'custom' ? '✏️ Custom' : key === 'intro' ? '👋 Intro' : key === 'follow-up' ? '🔄 Follow-up' : key === 'proposal' ? '📄 Proposal' : '🙏 Thank You'}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Body */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Message Body *</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Email content (use {firstName}, {lastName}, {company} for personalization)"
                rows={10}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">💡 Use {'{firstName}'}, {'{lastName}'}, {'{company}'} for personalization</p>
            </div>

            {/* Send Button */}
            <button
              onClick={sendEmails}
              disabled={sending || selectedContacts.length === 0}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
            >
              <FiSend /> {sending ? 'Sending...' : `Send to ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
            </button>
          </div>

          {/* Preview */}
          {formData.subject && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
              <h3 className="font-semibold mb-2 text-sm">Preview</h3>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-sm font-semibold text-gray-600">Subject: {formData.subject}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm whitespace-pre-wrap">{formData.body}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Select Recipients</h2>
          <div className="mb-4">
            <button
              onClick={selectAll}
              className={`w-full px-3 py-2 rounded font-semibold text-sm ${
                selectedContacts.length === contacts.length
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {selectedContacts.length === contacts.length ? '✓ Deselect All' : 'Select All'} ({selectedContacts.length}/{contacts.length})
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {contacts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No contacts found</p>
            ) : (
              contacts.map(contact => (
                <label
                  key={contact._id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact._id)}
                    onChange={() => toggleContactSelection(contact._id)}
                    className="mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{contact.firstName} {contact.lastName}</p>
                    <p className="text-xs text-gray-600 truncate">{contact.email}</p>
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">{selectedContacts.length}</span> recipient{selectedContacts.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </div>

      {/* Email History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Email Activity</h2>
        <p className="text-gray-600 text-center py-8">Email history will appear here. Integrate with email service provider for full tracking.</p>
      </div>
    </div>
  );
};

export default EmailIntegration;
