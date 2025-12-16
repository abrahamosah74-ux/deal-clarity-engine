const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { google } = require('googleapis');
const axios = require('axios');

// Get calendar events
router.get('/events', auth, async (req, res) => {
  try {
    const { startDate, endDate, maxResults = 50 } = req.query;
    
    if (!req.user.integrations?.calendar?.accessToken) {
      return res.status(400).json({ error: 'Calendar not connected' });
    }
    
    const events = await fetchCalendarEvents(
      req.user.integrations.calendar,
      startDate,
      endDate,
      maxResults
    );
    
    // Enrich with commitments data
    const enrichedEvents = await enrichEventsWithCommitments(req.user.id, events);
    
    res.json(enrichedEvents);
  } catch (error) {
    console.error('Calendar fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get specific event with commitments
router.get('/events/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    if (!req.user.integrations?.calendar?.accessToken) {
      return res.status(400).json({ error: 'Calendar not connected' });
    }
    
    // Fetch event from calendar
    const event = await fetchCalendarEvent(
      req.user.integrations.calendar,
      eventId
    );
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get previous commitments with same participants
    const previousCommitments = await getPreviousCommitments(
      req.user.id,
      event.attendees
    );
    
    // Get today's goal from CRM if deal exists
    const todayGoal = await getTodayGoalFromCRM(req.user, event);
    
    res.json({
      ...event,
      lastCommitments: previousCommitments,
      todayGoal
    });
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Connect calendar (OAuth callback)
router.post('/connect', auth, async (req, res) => {
  try {
    const { provider, code, redirectUri } = req.body;
    
    let tokens;
    if (provider === 'google') {
      tokens = await exchangeGoogleAuthCode(code, redirectUri);
    } else if (provider === 'microsoft') {
      tokens = await exchangeMicrosoftAuthCode(code, redirectUri);
    } else {
      return res.status(400).json({ error: 'Unsupported provider' });
    }
    
    // Update user with calendar integration
    req.user.integrations.calendar = {
      provider,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      connectedAt: new Date()
    };
    
    await req.user.save();
    
    res.json({ success: true, message: 'Calendar connected successfully' });
  } catch (error) {
    console.error('Calendar connect error:', error);
    res.status(500).json({ error: 'Failed to connect calendar' });
  }
});

// Helper functions
async function fetchCalendarEvents(calendarConfig, startDate, endDate, maxResults) {
  if (calendarConfig.provider === 'google') {
    return await fetchGoogleCalendarEvents(calendarConfig, startDate, endDate, maxResults);
  } else if (calendarConfig.provider === 'microsoft') {
    return await fetchMicrosoftCalendarEvents(calendarConfig, startDate, endDate, maxResults);
  }
  throw new Error('Unsupported calendar provider');
}

async function fetchGoogleCalendarEvents(calendarConfig, startDate, endDate, maxResults) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: calendarConfig.accessToken,
    refresh_token: calendarConfig.refreshToken
  });
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDate || new Date().toISOString(),
    timeMax: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime'
  });
  
  return response.data.items.map(event => ({
    id: event.id,
    title: event.summary,
    description: event.description,
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    attendees: event.attendees?.map(attendee => ({
      email: attendee.email,
      name: attendee.displayName
    })) || [],
    location: event.location,
    hangoutLink: event.hangoutLink,
    conferenceData: event.conferenceData
  }));
}

async function fetchMicrosoftCalendarEvents(calendarConfig, startDate, endDate, maxResults) {
  const response = await axios.get('https://graph.microsoft.com/v1.0/me/calendar/events', {
    headers: {
      Authorization: `Bearer ${calendarConfig.accessToken}`
    },
    params: {
      $filter: `start/dateTime ge '${startDate || new Date().toISOString()}'`,
      $top: maxResults,
      $orderby: 'start/dateTime'
    }
  });
  
  return response.data.value.map(event => ({
    id: event.id,
    title: event.subject,
    description: event.bodyPreview,
    start: event.start.dateTime,
    end: event.end.dateTime,
    attendees: event.attendees?.map(attendee => ({
      email: attendee.emailAddress.address,
      name: attendee.emailAddress.name
    })) || [],
    location: event.location.displayName,
    onlineMeeting: event.onlineMeeting
  }));
}

async function enrichEventsWithCommitments(userId, events) {
  const Commitment = require('../models/Commitment');
  
  const eventIds = events.map(e => e.id);
  const commitments = await Commitment.find({
    userId,
    calendarEventId: { $in: eventIds }
  });
  
  const commitmentMap = new Map();
  commitments.forEach(c => commitmentMap.set(c.calendarEventId, c));
  
  return events.map(event => ({
    ...event,
    hasCommitments: commitmentMap.has(event.id),
    commitment: commitmentMap.get(event.id)
  }));
}

async function getPreviousCommitments(userId, attendees) {
  const Commitment = require('../models/Commitment');
  
  if (!attendees || attendees.length === 0) {
    return { we: [], they: [] };
  }
  
  const attendeeEmails = attendees.map(a => a.email);
  
  const previousCommitments = await Commitment.findOne({
    userId,
    'participants.email': { $in: attendeeEmails },
    meetingDate: { $lt: new Date() }
  }).sort({ meetingDate: -1 });
  
  if (!previousCommitments) {
    return { we: [], they: [] };
  }
  
  return {
    we: previousCommitments.ourCommitments
      .filter(c => !c.completed)
      .map(c => ({
        action: c.action,
        owner: c.owner,
        due: c.dueDate
      })),
    they: previousCommitments.theirCommitments
      .filter(c => c.status === 'pending')
      .map(c => ({
        action: c.action,
        owner: c.owner,
        due: c.dueDate
      }))
  };
}

async function getTodayGoalFromCRM(user, event) {
  // This would query CRM for deal associated with these participants
  // For now, return default based on event title
  if (event.title?.toLowerCase().includes('discovery')) {
    return 'Qualify prospect and schedule demo';
  } else if (event.title?.toLowerCase().includes('demo')) {
    return 'Show value and get commitment to next steps';
  } else if (event.title?.toLowerCase().includes('negotiation')) {
    return 'Close deal and get signature';
  }
  return 'Advance deal to next stage';
}

async function exchangeGoogleAuthCode(code, redirectUri) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
  
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

async function exchangeMicrosoftAuthCode(code, redirectUri) {
  const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    client_id: process.env.MICROSOFT_CLIENT_ID,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });
  
  return response.data;
}

module.exports = router;