import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiCopy, FiEye, FiDownload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { emailTemplatePresets } from '../utils/emailTemplatePresets';
import './EmailTemplates.css';

const EmailTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewVars, setPreviewVars] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom',
    subject: '',
    body: '',
    variables: [],
    tags: []
  });

  // Fetch templates when user changes OR when filter changes
  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user, filter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { category: filter } : {};
      const response = await api.get('/email-templates', { params });
      setTemplates(response.data?.templates || response.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTemplate) {
        await api.patch(`/email-templates/${selectedTemplate._id}`, formData);
        toast.success('Template updated!');
      } else {
        await api.post('/email-templates', formData);
        toast.success('Template created!');
      }
      fetchTemplates();
      resetForm();
    } catch (error) {
      toast.error(selectedTemplate ? 'Failed to update template' : 'Failed to create template');
    }
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await api.delete(`/email-templates/${templateId}`);
        toast.success('Template deleted');
        fetchTemplates();
      } catch (error) {
        toast.error('Failed to delete template');
      }
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      body: template.body,
      variables: template.variables || [],
      tags: template.tags || []
    });
    setShowForm(true);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
    const vars = {};
    if (Array.isArray(template.variables)) {
      template.variables.forEach(v => {
        if (v && v.name) {
          vars[v.name] = v.example || '';
        }
      });
    }
    setPreviewVars(vars);
  };

  const renderTemplate = (subject, body, variables) => {
    try {
      let rendered = { subject: subject || '', body: body || '' };
      if (!variables || typeof variables !== 'object') {
        return rendered;
      }
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered.subject = rendered.subject.replace(regex, String(value || ''));
        rendered.body = rendered.body.replace(regex, String(value || ''));
      });
      return rendered;
    } catch (err) {
      console.error('Error rendering template:', err);
      return { subject: subject || '', body: body || '' };
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'custom',
      subject: '',
      body: '',
      variables: [],
      tags: []
    });
    setSelectedTemplate(null);
    setShowForm(false);
  };

  const handleUsePreset = (preset) => {
    setFormData({
      name: preset.name,
      category: preset.category,
      subject: preset.subject,
      body: preset.body,
      variables: preset.variables,
      tags: preset.tags
    });
    setShowPresets(false);
    setShowForm(true);
    toast.success(`Loaded "${preset.name}" template!`);
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'meeting_summary', label: 'Meeting Summary' },
    { value: 'commitment_reminder', label: 'Reminders' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'closing', label: 'Closing' },
    { value: 'rejection', label: 'Rejection' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="email-templates-page">
      <div className="templates-header">
        <h1>📧 Email Templates</h1>
        <div className="header-buttons">
          <button onClick={() => setShowPresets(true)} className="btn-secondary">
            <FiDownload /> Use Template
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <FiPlus /> Create Template
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="templates-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`filter-btn ${filter === cat.value ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="loading">Loading templates...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="empty-state">
          <p>No templates found. Create one to get started!</p>
        </div>
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map(template => (
            <div key={template._id} className="template-card">
              <div className="template-header">
                <h3>{template.name}</h3>
                <span className="category-badge">{template.category.replace('_', ' ')}</span>
              </div>
              <p className="template-subject">📌 {template.subject}</p>
              <p className="template-preview">{template.body.substring(0, 80)}...</p>
              <div className="template-meta">
                <span>Used {template.usageCount} times</span>
                <span>{template.variables?.length} variables</span>
              </div>
              <div className="template-actions">
                <button onClick={() => handlePreview(template)} title="Preview">
                  <FiEye />
                </button>
                <button onClick={() => handleEdit(template)} title="Edit">
                  <FiEdit2 />
                </button>
                <button onClick={() => handleDelete(template._id)} title="Delete" className="delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Presets Modal */}
      {showPresets && (
        <div className="modal-overlay" onClick={() => setShowPresets(false)}>
          <div className="modal presets-modal" onClick={(e) => e.stopPropagation()}>
            <h2>📨 Choose a Template Preset</h2>
            <p className="presets-description">Select a pre-built template to get started quickly, then customize it for your needs.</p>
            <div className="presets-grid">
              {emailTemplatePresets.map(preset => (
                <div key={preset.id} className="preset-card">
                  <div className="preset-header">
                    <h3>{preset.name}</h3>
                    <span className="preset-category">{preset.category.replace('_', ' ')}</span>
                  </div>
                  <p className="preset-subject">📌 {preset.subject}</p>
                  <p className="preset-preview">{preset.body.substring(0, 100)}...</p>
                  <div className="preset-meta">
                    <span>{preset.variables.length} variables</span>
                    <span className="preset-tags">
                      {preset.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleUsePreset(preset)} 
                    className="btn-primary btn-use-preset"
                  >
                    <FiDownload /> Use This Template
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPresets(false)} className="btn-secondary btn-close-modal">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedTemplate ? 'Edit Template' : 'Create Email Template'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Follow-up After Call"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.slice(2).map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    placeholder="comma,separated,tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map(t => t.trim())
                    })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Following up on {{dealName}}"
                  required
                />
                <small>Use {{variable}} syntax for dynamic content</small>
              </div>

              <div className="form-group">
                <label>Email Body *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Enter email body here. Use {{variable}} for dynamic content."
                  rows="10"
                  required
                />
                <small>Tip: Use {{contactName}}, {{dealName}}, etc. for personalization</small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {selectedTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Template Preview</h2>
            <div className="preview-controls">
              {Array.isArray(selectedTemplate.variables) && selectedTemplate.variables.length > 0 ? (
                selectedTemplate.variables.map((v, idx) => {
                  const varName = v?.name || `var_${idx}`;
                  return (
                    <div key={varName} className="preview-var">
                      <label>{v?.description || v?.name || 'Variable'}</label>
                      <input
                        type="text"
                        value={previewVars[varName] || ''}
                        onChange={(e) => setPreviewVars({
                          ...previewVars,
                          [varName]: e.target.value
                        })}
                        placeholder={v?.example || ''}
                      />
                    </div>
                  );
                })
              ) : (
                <p className="empty-message">No variables in this template</p>
              )}
            </div>
            {(() => {
              try {
                const rendered = renderTemplate(selectedTemplate.subject, selectedTemplate.body, previewVars);
                return (
                  <div className="preview-output">
                    <div className="preview-subject">
                      <strong>Subject:</strong> {rendered.subject}
                    </div>
                    <div className="preview-body">
                      {(rendered.body || '').split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                );
              } catch (err) {
                console.error('Error in preview:', err);
                return (
                  <div className="preview-output">
                    <p>Error rendering preview. Please check the template.</p>
                  </div>
                );
              }
            })()}
            <button onClick={() => setShowPreview(false)} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
