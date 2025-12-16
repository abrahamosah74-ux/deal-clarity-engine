import React, { useState } from 'react';
import { FiX, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const MeetingScheduler = ({ isOpen, onClose }) => {
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    attendees: [],
    description: ''
  });

  const teamMembers = [
    { id: 1, name: 'Sarah Johnson' },
    { id: 2, name: 'Mike Davis' },
    { id: 3, name: 'Lisa Chen' },
    { id: 4, name: 'John Smith' }
  ];

  const handleToggleAttendee = (memberId) => {
    if (meetingData.attendees.includes(memberId)) {
      setMeetingData({
        ...meetingData,
        attendees: meetingData.attendees.filter(id => id !== memberId)
      });
    } else {
      setMeetingData({
        ...meetingData,
        attendees: [...meetingData.attendees, memberId]
      });
    }
  };

  const handleSchedule = () => {
    if (!meetingData.title || !meetingData.date || !meetingData.time || meetingData.attendees.length === 0) {
      toast.error('Please fill in all fields');
      return;
    }

    toast.success(`Meeting "${meetingData.title}" scheduled successfully`);
    setMeetingData({
      title: '',
      date: '',
      time: '',
      attendees: [],
      description: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiCalendar size={24} />
            Schedule Meeting
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Meeting Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
            <input
              type="text"
              value={meetingData.title}
              onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
              placeholder="e.g., Q4 Sales Review"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={meetingData.date}
                onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={meetingData.time}
                onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              value={meetingData.description}
              onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
              placeholder="Add meeting details..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FiUser size={18} />
              Select Attendees
            </label>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleToggleAttendee(member.id)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    meetingData.attendees.includes(member.id)
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={meetingData.attendees.includes(member.id)}
                      onChange={() => {}}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler;
