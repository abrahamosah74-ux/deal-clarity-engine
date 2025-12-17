import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiDownload, FiUpload, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const BulkImportExport = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [importData, setImportData] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contacts?limit=10000');
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
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

  // Export contacts to CSV
  const handleExport = () => {
    if (contacts.length === 0) {
      alert('No contacts to export');
      return;
    }

    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Job Title', 'Lead Score', 'Tags'];
    const rows = contacts.map(contact => [
      contact.firstName,
      contact.lastName || '',
      contact.email,
      contact.phone || '',
      contact.company || '',
      contact.jobTitle || '',
      contact.leadScore || 0,
      (contact.tags || []).join(';')
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage({ type: 'success', text: `Exported ${contacts.length} contacts` });
    setTimeout(() => setMessage(null), 3000);
  };

  // Parse CSV file
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have header row and data');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      if (row['email']) {
        data.push(row);
      }
    }

    return data;
  };

  // Handle file import
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const parsed = parseCSV(csvText);

        if (parsed.length === 0) {
          setMessage({ type: 'error', text: 'No valid contacts found in CSV' });
          return;
        }

        setImportPreview(parsed.slice(0, 5));
        setImportData(parsed);
        setMessage({ type: 'success', text: `Found ${parsed.length} contacts to import` });
      } catch (error) {
        setMessage({ type: 'error', text: `Error parsing CSV: ${error.message}` });
      }
    };
    reader.readAsText(file);
  };

  // Import contacts
  const handleImportSubmit = async () => {
    if (!importData || importData.length === 0) {
      setMessage({ type: 'error', text: 'No data to import' });
      return;
    }

    setLoading(true);
    const results = { success: 0, failed: 0, errors: [] };

    try {
      for (const row of importData) {
        try {
          await api.post('/contacts', {
            firstName: row['first name'] || row['firstname'] || '',
            lastName: row['last name'] || row['lastname'] || '',
            email: row['email'] || '',
            phone: row['phone'] || '',
            company: row['company'] || '',
            jobTitle: row['job title'] || row['jobtitle'] || '',
            leadScore: parseInt(row['lead score'] || row['leadscore'] || 0)
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Row: ${row.email} - ${error.response?.data?.error || error.message}`);
        }
      }

      setMessage({
        type: 'success',
        text: `Import complete: ${results.success} success, ${results.failed} failed`
      });
      
      setImportData(null);
      setImportPreview([]);
      fetchContacts();
      fetchStats();
    } catch (error) {
      setMessage({ type: 'error', text: 'Import failed' });
    }

    setLoading(false);
  };

  // Download template
  const handleDownloadTemplate = () => {
    const template = 'First Name,Last Name,Email,Phone,Company,Job Title,Lead Score,Tags\nJohn,Doe,john@example.com,555-1234,Acme Corp,Sales Manager,85,vip;prospect\n';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contact_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Import/Export</h1>
        <p className="text-gray-600">Import and export contacts in bulk using CSV files</p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          {message.text}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Contacts</p>
            <p className="text-3xl font-bold">{stats.totalContacts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Companies</p>
            <p className="text-3xl font-bold">{stats.uniqueCompanies}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">High Priority</p>
            <p className="text-3xl font-bold text-blue-600">{stats.highPriorityLeads}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiDownload /> Export Contacts
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Download all {contacts.length} contacts as CSV file for backup or use in other systems.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              disabled={contacts.length === 0}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
            >
              <FiDownload /> Export All Contacts ({contacts.length})
            </button>
            <p className="text-xs text-gray-500 text-center">
              Exports: First Name, Last Name, Email, Phone, Company, Job Title, Lead Score, Tags
            </p>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiUpload /> Import Contacts
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Upload a CSV file with contacts. Required columns: First Name, Email
          </p>
          <div className="space-y-2">
            <button
              onClick={handleDownloadTemplate}
              className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Download Template
            </button>
            <label className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold flex items-center justify-center gap-2 cursor-pointer">
              <FiUpload /> Choose CSV File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Import Preview */}
      {importPreview.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Preview ({importData.length} total)</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">First Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Company</th>
                  <th className="p-2 text-left">Job Title</th>
                  <th className="p-2 text-right">Lead Score</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2">{row['first name'] || row['firstname'] || '-'}</td>
                    <td className="p-2">{row['email'] || '-'}</td>
                    <td className="p-2">{row['company'] || '-'}</td>
                    <td className="p-2">{row['job title'] || row['jobtitle'] || '-'}</td>
                    <td className="p-2 text-right">{row['lead score'] || row['leadscore'] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImportSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? 'Importing...' : `Import ${importData.length} Contacts`}
            </button>
            <button
              onClick={() => {
                setImportData(null);
                setImportPreview([]);
              }}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">CSV Format Requirements</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ First column must be header row</li>
          <li>✓ Required columns: First Name, Email</li>
          <li>✓ Optional columns: Last Name, Phone, Company, Job Title, Lead Score, Tags</li>
          <li>✓ Duplicate emails will be skipped (email is unique per contact)</li>
          <li>✓ Lead Score should be 0-100</li>
          <li>✓ Tags should be separated by semicolon (e.g., vip;prospect;new)</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkImportExport;
