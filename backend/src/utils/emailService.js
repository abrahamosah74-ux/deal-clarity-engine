const nodemailer = require('nodemailer');

const emailService = {
  async sendFollowUpEmail(user, emailData) {
    try {
      const { to, subject, body, commitmentId } = emailData;
      
      // Create transporter based on user's email integration
      const transporter = await createTransporter(user);
      
      const mailOptions = {
        from: {
          name: user.name || 'Deal Clarity Engine',
          address: user.email
        },
        to,
        subject: subject || 'Follow-up from our call',
        text: body,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="padding: 20px;">
              ${body.replace(/\n/g, '<br>')}
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <p>Sent via Deal Clarity Engine • <a href="${process.env.FRONTEND_URL}" style="color: #2563eb;">Track commitments</a></p>
            </div>
          </div>
        `,
        headers: {
          'X-Deal-Clarity-ID': commitmentId,
          'X-Deal-Clarity-User': user._id.toString()
        }
      };
      
      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) // For testing
      };
    } catch (error) {
      console.error('Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  },
  
  async validateEmailConfig(user) {
    try {
      const transporter = await createTransporter(user);
      await transporter.verify();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
};

async function createTransporter(user) {
  // Check if user has email integration
  if (user.integrations?.email?.accessToken) {
    const { provider, accessToken } = user.integrations.email;
    
    if (provider === 'gmail') {
      return createGmailTransporter(user.email, accessToken);
    } else if (provider === 'outlook') {
      return createOutlookTransporter(user.email, accessToken);
    }
  }
  
  // Fallback to SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

function createGmailTransporter(userEmail, accessToken) {
  // Note: For production, you'd need to handle OAuth2 refresh tokens
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: userEmail,
      accessToken: accessToken,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET
    }
  });
}

function createOutlookTransporter(userEmail, accessToken) {
  return nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      type: 'OAuth2',
      user: userEmail,
      accessToken: accessToken,
      clientId: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET
    }
  });
}

module.exports = emailService;