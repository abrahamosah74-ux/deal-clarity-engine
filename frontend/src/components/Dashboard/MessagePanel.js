import React, { useState } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const MessagePanel = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sarah Johnson', text: 'Can you review the Acme proposal?', time: '2 min ago', avatar: '👩' },
    { id: 2, sender: 'You', text: 'Sure, I\'ll take a look', time: '1 min ago', avatar: '👨' },
    { id: 3, sender: 'Mike Davis', text: 'Need updates on TechStart deal', time: '30s ago', avatar: '👨‍💼' }
  ]);

  const teamMembers = [
    { id: 1, name: 'Sarah Johnson', status: 'online' },
    { id: 2, name: 'Mike Davis', status: 'online' },
    { id: 3, name: 'Lisa Chen', status: 'away' },
    { id: 4, name: 'John Smith', status: 'offline' }
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      text: message,
      time: 'now',
      avatar: '👨'
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    toast.success('Message sent');
  };

  const handleSelectTeam = (memberId) => {
    if (selectedTeam.includes(memberId)) {
      setSelectedTeam(selectedTeam.filter(id => id !== memberId));
    } else {
      setSelectedTeam([...selectedTeam, memberId]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Team Messages</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Team Members List */}
          <div className="w-48 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Team Members</h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleSelectTeam(member.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTeam.includes(member.id)
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className={`text-xs ${
                          member.status === 'online' ? 'text-green-600' :
                          member.status === 'away' ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          {member.status}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-xs ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}>
                      <div className="text-2xl">{msg.avatar}</div>
                      <div>
                        <div className={`px-4 py-2 rounded-lg ${
                          msg.sender === 'You'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No messages yet. Start a conversation!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <FiSend size={18} />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagePanel;
