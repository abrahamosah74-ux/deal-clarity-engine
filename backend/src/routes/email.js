const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const axios = require('axios');

// Send test email
router.post('/test', auth, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    
    const result = await sendEmail(req.user, {
      to,
      subject,
      body,
      isTest: true
    });
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Get email templates
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = [
      {
        id: 'standard',
        name: 'Standard Follow-up',
        subject: 'Following up on our call - {{company}}',
        body: `Hi {{name}},

Great conversation earlier. To keep momentum:

{{our_commitments}}

{{their_commitments}}

Let me know if anything changes.

Best,
{{sender_name}}`
      },
      {
        id: 'brief',
        name: 'Brief & Direct',
        subject: 'Next steps from our call',
        body: `{{name}},

As discussed:

{{our_commitments}}

{{their_commitments}}

Thanks,
{{sender_name}}`
      },
      {
        id: 'friendly',
        name: 'Friendly & Collaborative',
        subject: 'Great chatting! Next steps',
        body: `Hi {{name}},

Really enjoyed our conversation! Here's what we agreed to:

{{our_commitments}}

{{their_commitments}}

Looking forward to continuing our partnership.

Best regards,
{{sender_name}}`
      }
    ];
    
    res.json(templates);
  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Update user email settings
router.post('/settings', auth, async (req, res) => {
  try {
    const { defaultTemplate, signature, autoSend } = req.body;
    
    req.user.settings.defaultEmailTemplate = defaultTemplate;
    req.user.settings.emailSignature = signature;
    req.user.settings.autoSendFollowUp = autoSend;
    
    await req.user.save();
    
    res.json({ 
      success: true, 
      message: 'Email settings updated' 
    });
  } catch (error) {
    console.error('Email settings error:', error);
    res.status(500).json({ error: 'Failed to update email settings' });
  }
});

// Helper function to send email
async function sendEmail(user, emailData) {
  const { to, subject, body, isTest = false } = emailData;
  
  let transporter;
  const { email: emailConfig } = user.integrations || {};
  
  if (emailConfig?.provider === 'gmail' && emailConfig.accessToken) {
    // Use Gmail OAuth
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: emailConfig.accessToken,
      refresh_token: emailConfig.refreshToken
    });
    
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: user.email,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: emailConfig.refreshToken,
        accessToken: emailConfig.accessToken
      }
    });
  } else if (emailConfig?.provider === 'outlook' && emailConfig.accessToken) {
    // Use Outlook OAuth
    transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        type: 'OAuth2',
        user: user.email,
        accessToken: emailConfig.accessToken,
        clientId: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET
      }
    });
  } else {
    // Fallback to SMTP (requires SMTP credentials in env)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  const mailOptions = {
    from: {
      name: user.name || 'Deal Clarity',
      address: process.env.SMTP_FROM || user.email
    },
    to: isTest ? process.env.TEST_EMAIL || user.email : to,
    subject: isTest ? `[TEST] ${subject}` : subject,
    text: body,
    html: convertToHtml(body)
  };
  
  const info = await transporter.sendMail(mailOptions);
  return info;
}

function convertToHtml(text) {
  // Simple text to HTML conversion
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^•\s+(.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
}

module.exports = router;