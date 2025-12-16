import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiVideo, 
  FiChevronLeft, 
  FiChevronRight,
  FiPlus,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../services/api';

// Helper function to format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('day');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCalendarEvents();
  }, [selectedDate, view]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      // Mock data for testing
      const mockEvents = [
        {
          id: 1,
          title: 'Discovery Call - Acme Corp',
          start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 10, 0).toISOString(),
          end: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 10, 30).toISOString(),
          attendees: [{ name: 'John Smith' }, { name: 'Sarah Johnson' }],
          onlineMeeting: true,
          hasCommitments: true
        },
        {
          id: 2,
          title: 'Demo - TechStart Inc',
          start: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 14, 0).toISOString(),
          end: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 14, 45).toISOString(),
          attendees: [{ name: 'Mike Chen' }],
          onlineMeeting: true,
          hasCommitments: false
        }
      ];
      setEvents(mockEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load calendar events');
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(selectedDate);
    if (view === 'day') {
      date.setHours(0, 0, 0, 0);
    } else if (view === 'week') {
      date.setDate(date.getDate() - date.getDay());
      date.setHours(0, 0, 0, 0);
    } else {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    }
    return date;
  };

  const getEndDate = () => {
    const date = new Date(selectedDate);
    if (view === 'day') {
      date.setHours(23, 59, 59, 999);
    } else if (view === 'week') {
      date.setDate(date.getDate() + (6 - date.getDay()));
      date.setHours(23, 59, 59, 999);
    } else {
      date.setMonth(date.getMonth() + 1);
      date.setDate(0);
      date.setHours(23, 59, 59, 999);
    }
    return date;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEventsForDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === targetDate.getTime();
    }).sort((a, b) => new Date(a.start) - new Date(b.start));
  };

  const handleEventClick = (event) => {
    const now = new Date();
    const eventTime = new Date(event.start);
    
    if (eventTime <= now) {
      navigate(`/post-call/${event.id}`);
    } else {
      toast('Event has not started yet', { icon: '⏰' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            animation: 'spin 1s linear infinite',
            width: '48px',
            height: '48px',
            border: '3px solid #e0e0e0',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#666' }}>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📅 Calendar
            </h1>
            <p className="text-gray-600 mt-2">Upcoming discovery calls and meetings</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-blue-600"
            >
              <FiChevronLeft size={24} />
            </button>
            <span className="text-lg font-bold text-gray-900 min-w-48 text-center">
              {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-blue-600"
            >
              <FiChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-8">
          {['day', 'week', 'month'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg font-bold transition-all capitalize ${
                view === v
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSelectedDate(new Date())}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Today
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: 0 }}>
              {view === 'day' ? formatDate(selectedDate) :
               view === 'week' ? `Week of ${formatDate(getStartDate())}` :
               selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          
          <button
            onClick={() => navigateDate(1)}
            style={{
              padding: '8px',
              color: '#666',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FiChevronRight />
          </button>
        </div>

        {/* View Toggle */}
      <div style={{ display: 'flex', marginBottom: '24px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
        {['day', 'week', 'month'].map((viewOption) => (
          <button
            key={viewOption}
            onClick={() => setView(viewOption)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '500',
              textTransform: 'capitalize',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: view === viewOption ? 'white' : 'transparent',
              color: view === viewOption ? '#2563eb' : '#666',
              boxShadow: view === viewOption ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {viewOption}
          </button>
        ))}
      </div>

      {/* Calendar Content */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {view === 'day' ? (
          <DayView 
            date={selectedDate} 
            events={getEventsForDate(selectedDate)} 
            onEventClick={handleEventClick}
          />
        ) : view === 'week' ? (
          <WeekView 
            startDate={getStartDate()} 
            events={events} 
            onEventClick={handleEventClick}
          />
        ) : (
          <MonthView 
            date={selectedDate} 
            events={events} 
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111', marginBottom: '8px' }}>No calls scheduled</h3>
          <p style={{ color: '#666', marginBottom: '24px' }}>Connect your calendar to see upcoming discovery calls</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={fetchCalendarEvents}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                color: '#374151',
                backgroundColor: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <FiRefreshCw style={{ marginRight: '8px' }} />
              Refresh
            </button>
            <Link
              to="/settings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              <FiPlus style={{ marginRight: '8px' }} />
              Connect Calendar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Day View Component
const DayView = ({ date, events, onEventClick }) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: 0 }}>
          {date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </h3>
        <span style={{ fontSize: '14px', color: '#999' }}>
          {events.length} call{events.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div style={{ position: 'relative' }}>
        {hours.map(hour => {
          const time = new Date(date);
          time.setHours(hour, 0, 0, 0);
          const eventsInHour = events.filter(event => {
            const eventHour = new Date(event.start).getHours();
            return eventHour === hour;
          });
          
          return (
            <div key={hour} style={{ 
              display: 'flex', 
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div style={{ width: '80px', paddingTop: '16px', paddingRight: '16px', paddingBottom: '16px', textAlign: 'right' }}>
                <span style={{ fontSize: '14px', color: '#999' }}>
                  {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                </span>
              </div>
              
              <div style={{ flex: 1, paddingTop: '16px', paddingLeft: '16px', paddingBottom: '16px', paddingRight: '16px', minHeight: '80px' }}>
                {eventsInHour.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => onEventClick(event)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Week View Component
const WeekView = ({ startDate, events, onEventClick }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '16px' }}>
        {days.map(day => (
          <div key={day.toISOString()} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#999' }}>
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() ? '#2563eb' : 'transparent',
              color: day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() ? 'white' : '#111'
            }}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {days.map(day => {
          const dayEvents = events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.getDate() === day.getDate() &&
                   eventDate.getMonth() === day.getMonth();
          });
          
          return (
            <div key={day.toISOString()} style={{ minHeight: '400px' }}>
              {dayEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onClick={() => onEventClick(event)}
                  compact={true}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Month View Component
const MonthView = ({ date, events, onEventClick }) => {
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Get events for a specific day
  const getEventsForDay = (dayNum) => {
    if (!dayNum) return [];
    const dayDate = new Date(year, month, dayNum);
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === month &&
        eventDate.getDate() === dayNum
      );
    });
  };

  const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', margin: 0 }}>{monthName}</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div
            key={dayName}
            style={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              paddingTop: '12px',
              paddingBottom: '12px',
              backgroundColor: '#f9fafb',
              borderBottom: '2px solid #e5e7eb'
            }}
          >
            {dayName}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((dayNum, idx) => {
          const eventsForDay = getEventsForDay(dayNum);
          const isToday = dayNum && new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;
          
          return (
            <div
              key={idx}
              style={{
                minHeight: '120px',
                padding: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: dayNum ? (isToday ? '#f0f4ff' : '#fff') : '#f9fafb',
                cursor: dayNum ? 'pointer' : 'default',
                borderRadius: '6px'
              }}
              className="hover:shadow-md transition-shadow"
            >
              <div style={{
                fontSize: '14px',
                fontWeight: isToday ? 'bold' : '500',
                color: isToday ? '#2563eb' : '#666',
                marginBottom: '4px'
              }}>
                {dayNum || ''}
              </div>
              <div style={{ fontSize: '12px' }}>
                {eventsForDay.map((event, i) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={event.title}
                  >
                    📞 {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onClick, compact = false }) => {
  const now = new Date();
  const eventTime = new Date(event.start);
  const isPast = eventTime < now;
  
  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: '8px',
        padding: '12px',
        borderRadius: '8px',
        border: `1px solid ${isPast ? '#e9ecef' : '#d1dcf1'}`,
        backgroundColor: isPast ? '#f8f9fa' : '#f0f4ff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: compact ? '13px' : '14px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.backgroundColor = isPast ? '#f0f1f3' : '#e8f0ff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.backgroundColor = isPast ? '#f8f9fa' : '#f0f4ff';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {event.onlineMeeting ? (
              <FiVideo size={16} style={{ color: '#667eea', flexShrink: 0 }} />
            ) : (
              <FiUsers size={16} style={{ color: '#667eea', flexShrink: 0 }} />
            )}
            <h4 style={{ 
              fontWeight: '600', 
              color: isPast ? '#6c757d' : '#333',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {event.title}
            </h4>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6c757d', marginBottom: '8px' }}>
            <FiClock size={14} />
            <span style={{ fontSize: compact ? '12px' : '13px' }}>
              {formatTime(event.start)} - {formatTime(event.end)}
            </span>
          </div>
          
          {event.attendees?.length > 0 && !compact && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6c757d', fontSize: '13px' }}>
              <FiUsers size={14} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {event.attendees.map(a => a.name).join(', ')}
              </span>
            </div>
          )}
        </div>
        
        {event.hasCommitments && (
          <div style={{ marginLeft: '8px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              padding: '4px 8px', 
              borderRadius: '9999px', 
              fontSize: '12px', 
              fontWeight: '500',
              backgroundColor: '#dcfce7',
              color: '#166534'
            }}>
              ✓ Has notes
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;