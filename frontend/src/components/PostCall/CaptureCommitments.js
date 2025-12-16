// frontend/src/components/PostCall/CaptureCommitments.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiClock, FiUser, FiCalendar, FiSend } from 'react-icons/fi';
import api from '../../services/api';
import './CaptureCommitments.css';

const CaptureCommitments = ({ onNext }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(45);
  const [event, setEvent] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [commitments, setCommitments] = useState({
    we: { action: '', owner: '', dueDate: '' },
    they: { action: '', owner: '', dueDate: '' }
  });
  const [nonCommittal, setNonCommittal] = useState(false);

  // Fetch event data
  useEffect(() => {
    fetchEventData();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchEventData = async () => {
    try {
      const [eventRes, transcriptRes] = await Promise.all([
        api.get(`/calendar/events/${eventId}`),
        api.get(`/transcript/${eventId}`).catch(() => ({ data: [] })) // Optional
      ]);
      
      setEvent(eventRes.data);
      setTranscript(transcriptRes.data.snippets || []);
      
      // Auto-fill from transcript if available
      if (transcriptRes.data.snippets?.length > 0) {
        autoFillFromTranscript(transcriptRes.data.snippets);
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load event data');
      setLoading(false);
    }
  };

  const autoFillFromTranscript = (snippets) => {
    const ourStatements = snippets.filter(s => s.speaker === 'rep');
    const theirStatements = snippets.filter(s => s.speaker === 'prospect');
    
    if (ourStatements.length > 0) {
      setCommitments(prev => ({
        ...prev,
        we: { 
          ...prev.we, 
          action: extractAction(ourStatements[0].text),
          dueDate: extractDate(ourStatements[0].text) || getDefaultDate()
        }
      }));
    }
    
    if (theirStatements.length > 0) {
      setCommitments(prev => ({
        ...prev,
        they: { 
          ...prev.they, 
          action: extractAction(theirStatements[0].text),
          dueDate: extractDate(theirStatements[0].text) || getDefaultDate(7)
        }
      }));
    }
  };

  const extractAction = (text) => {
    const actionPhrases = ["I'll", "I will", "We'll", "We will", "send", "share", "provide"];
    for (const phrase of actionPhrases) {
      if (text.toLowerCase().includes(phrase)) {
        return text.substring(text.toLowerCase().indexOf(phrase));
      }
    }
    return text;
  };

  const extractDate = (text) => {
    const datePatterns = [
      /\b(today|tomorrow)\b/i,
      /\b(\d{1,2})\/(\d{1,2})\b/,
      /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i,
      /\b(next week|next month)\b/i,
      /\bby\s+(\w+day)\b/i
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return '';
  };

  const getDefaultDate = (daysFromNow = 3) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  };

  const handleTranscriptSnippetClick = (snippet) => {
    if (snippet.speaker === 'rep') {
      setCommitments(prev => ({
        ...prev,
        we: { ...prev.we, action: snippet.text }
      }));
    } else {
      setCommitments(prev => ({
        ...prev,
        they: { ...prev.they, action: snippet.text }
      }));
    }
  };

  const handleNonCommittal = () => {
    setNonCommittal(true);
    setCommitments(prev => ({
      ...prev,
      they: { ...prev.they, action: '', dueDate: '' }
    }));
  };

  const handleNext = async () => {
    // Validate our commitment
    if (!commitments.we.action.trim()) {
      toast.error('Please specify what you will do');
      return;
    }

    if (!commitments.we.dueDate) {
      toast.error('Please set a due date for your commitment');
      return;
    }

    // Prepare payload
    const payload = {
      calendarEventId: eventId,
      meetingTitle: event?.title || 'Discovery Call',
      participants: event?.attendees || [],
      ourCommitments: [{
        action: commitments.we.action,
        owner: commitments.we.owner || 'rep',
        dueDate: commitments.we.dueDate
      }],
      theirCommitments: nonCommittal ? [] : [{
        action: commitments.they.action,
        owner: commitments.they.owner || event?.attendees[0]?.email || 'prospect',
        dueDate: commitments.they.dueDate
      }],
      meetingDate: new Date().toISOString()
    };

    try {
      const response = await api.post('/commitments', payload);
      onNext(response.data);
    } catch (error) {
      toast.error('Failed to save commitments');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading call data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ✅ Capture Commitments
            </h1>
            <p className="text-gray-600 mt-2">Call ended at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex items-center space-x-3 bg-white rounded-xl px-6 py-4 shadow-lg border-2 border-blue-100">
            <FiClock className={`text-2xl ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
            <span className={`font-bold text-2xl ${timeLeft < 10 ? 'text-red-600' : 'text-gray-800'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Transcript Section */}
        {transcript.length > 0 && (
          <div className="mb-10 bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
              <span className="mr-3 text-2xl">📝</span> Transcript Highlights
            </h2>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 max-h-64 overflow-y-auto border border-gray-200">
              {transcript.map((snippet, index) => (
                <div 
                  key={index}
                  className={`mb-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    snippet.speaker === 'rep' 
                      ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500' 
                      : 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500'
                  }`}
                  onClick={() => handleTranscriptSnippetClick(snippet)}
                >
                  <div className="flex justify-between items-start">
                    <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                      snippet.speaker === 'rep' 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {snippet.speaker === 'rep' ? '🎤 You' : '👤 Prospect'}
                    </span>
                    <button 
                      className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTranscriptSnippetClick(snippet);
                      }}
                    >
                      ➜ Use
                    </button>
                  </div>
                  <p className="text-gray-800 mt-3 leading-relaxed">{snippet.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commitment Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Our Commitment */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                <span className="text-white font-bold text-lg">WE</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">What We'll Do</h3>
                <p className="text-sm text-gray-600 mt-1">Set expectations</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📌 Action
                </label>
                <textarea
                  value={commitments.we.action}
                  onChange={(e) => setCommitments(prev => ({
                    ...prev,
                    we: { ...prev.we, action: e.target.value }
                  }))}
                  placeholder="I'll send the proposal by..."
                  className="w-full h-24 p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiUser className="inline mr-2" /> Owner
                  </label>
                  <select
                    value={commitments.we.owner}
                    onChange={(e) => setCommitments(prev => ({
                      ...prev,
                      we: { ...prev.we, owner: e.target.value }
                    }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
                  >
                    <option value="rep">You</option>
                    <option value="team">Team</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiCalendar className="inline mr-2" /> Due Date
                  </label>
                  <input
                    type="date"
                    value={commitments.we.dueDate}
                    onChange={(e) => setCommitments(prev => ({
                      ...prev,
                      we: { ...prev.we, dueDate: e.target.value }
                    }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-medium"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Their Commitment */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                <span className="text-white font-bold text-lg">THEY</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">What They'll Do</h3>
                <p className="text-sm text-gray-600 mt-1">Next steps</p>
              </div>
            </div>
            
            {nonCommittal ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">🚫</div>
                <p className="text-gray-700 font-semibold mb-4">Prospect was non-committal</p>
                <button
                  onClick={() => setNonCommittal(false)}
                  className="text-blue-600 hover:text-blue-800 font-bold text-lg"
                >
                  + Add commitment anyway
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📌 Action
                  </label>
                  <textarea
                    value={commitments.they.action}
                    onChange={(e) => setCommitments(prev => ({
                      ...prev,
                      they: { ...prev.they, action: e.target.value }
                    }))}
                    placeholder="They'll share decision timeline by..."
                    className="w-full h-24 p-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FiUser className="inline mr-2" /> Owner
                    </label>
                    <input
                      type="text"
                      value={commitments.they.owner || event?.attendees[0]?.email || ''}
                      onChange={(e) => setCommitments(prev => ({
                        ...prev,
                        they: { ...prev.they, owner: e.target.value }
                      }))}
                      placeholder="prospect@company.com"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 font-medium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FiCalendar className="inline mr-2" /> Due Date
                    </label>
                    <input
                      type="date"
                      value={commitments.they.dueDate}
                      onChange={(e) => setCommitments(prev => ({
                        ...prev,
                        they: { ...prev.they, dueDate: e.target.value }
                      }))}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 font-medium"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleNonCommittal}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 flex items-center justify-center font-semibold border-2 border-gray-300"
                >
                  <span className="mr-2 text-lg">🚫</span> Prospect was non-committal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/calendar')}
            className="px-8 py-3 text-gray-700 hover:text-gray-900 font-bold transition-colors"
          >
            ← Skip
          </button>
          
          <button
            onClick={handleNext}
            disabled={!commitments.we.action.trim() || !commitments.we.dueDate}
            className={`px-8 py-4 rounded-xl font-bold flex items-center transition-all duration-200 shadow-lg ${
              !commitments.we.action.trim() || !commitments.we.dueDate
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            <FiSend className="mr-2 text-lg" />
            Next: Preview Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureCommitments;