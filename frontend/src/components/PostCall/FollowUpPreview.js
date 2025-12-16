// frontend/src/components/PostCall/FollowUpPreview.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiSend, FiEdit2, FiCheck, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import './FollowUpPreview.css';

const FollowUpPreview = ({ commitmentData, onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [warnings, setWarnings] = useState([]);
  const [undoToken, setUndoToken] = useState('');

  useEffect(() => {
    if (commitmentData) {
      generateEmailPreview();
      setUndoToken(commitmentData.undoToken);
    }
  }, [commitmentData]);

  const generateEmailPreview = () => {
    const { ourCommitments, theirCommitments, participants } = commitmentData;
    
    const ourActions = ourCommitments.map(c => 
      `• I'll ${c.action} by ${new Date(c.dueDate).toLocaleDateString()}`
    ).join('\n');
    
    const theirActions = theirCommitments.map(c => 
      `• You'll ${c.action} by ${new Date(c.dueDate).toLocaleDateString()}`
    ).join('\n');
    
    const body = `Hi ${participants[0]?.name || 'there'},

Great conversation earlier. To keep momentum:

${ourActions}

${theirActions}

Let me know if anything changes.

Best,
${localStorage.getItem('userName') || 'Your Name'}`;

    const subject = `Following up on our call - ${commitmentData.meetingTitle}`;
    
    setEmail({
      to: participants[0]?.email || '',
      subject,
      body
    });

    // Check for warnings
    const newWarnings = [];
    if (theirCommitments.length === 0) {
      newWarnings.push('No commitments from prospect');
    }
    if (theirCommitments.some(c => !c.dueDate)) {
      newWarnings.push('Missing due dates for their commitments');
    }
    
    setWarnings(newWarnings);
  };

  const handleSend = async () => {
    setLoading(true);
    
    try {
      const response = await api.post(`/commitments/${commitmentData.commitmentId}/send-email`, email);
      
      if (response.data.success) {
        toast.success('Email sent successfully!');
        
        // Show success screen for 3 seconds then navigate
        setTimeout(() => {
          navigate('/calendar', {
            state: { 
              showSuccess: true,
              undoToken: response.data.undoToken 
            }
          });
        }, 3000);
      }
    } catch (error) {
      toast.error('Failed to send email');
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    try {
      await api.post(`/commitments/${commitmentData.commitmentId}/undo`, {
        token: undoToken,
        action: 'email'
      });
      toast.success('Action undone');
      onBack();
    } catch (error) {
      toast.error('Failed to undo');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Follow-up Ready</h1>
          <p className="text-gray-600">Review and send in one click</p>
        </div>
        
        <button
          onClick={onBack}
          className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          <FiEdit2 className="mr-2" />
          Edit Commitments
        </button>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertCircle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Before sending:</h3>
              <ul className="mt-2 text-yellow-700">
                {warnings.map((warning, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-yellow-600">
                This will appear in manager view
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Email Preview</h2>
            <span className="text-sm text-gray-500">Editable</span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <input
              type="email"
              value={email.to}
              onChange={(e) => setEmail(prev => ({ ...prev, to: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={email.subject}
              onChange={(e) => setEmail(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={email.body}
              onChange={(e) => setEmail(prev => ({ ...prev, body: e.target.value }))}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              rows={12}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between items-center">
        <div>
          <button
            onClick={handleUndo}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            disabled={!undoToken}
          >
            Undo last action
          </button>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={() => {
              navigator.clipboard.writeText(email.body);
              toast.success('Copied to clipboard');
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Copy
          </button>
          
          <button
            onClick={handleSend}
            disabled={loading || !email.to}
            className={`px-8 py-3 rounded-lg font-medium flex items-center ${
              loading || !email.to
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <FiSend className="mr-2" />
                Send & Update CRM
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpPreview;