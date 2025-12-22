// backend/src/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'noreply@dealclarity.com',
    pass: process.env.EMAIL_PASSWORD || ''
  }
});

// Send verification email
const sendVerificationEmail = async (email, name, verificationCode) => {
  try {
    // Log the verification code to console for testing
    console.log('\n' + '='.repeat(70));
    console.log('📧 VERIFICATION EMAIL');
    console.log('='.repeat(70));
    console.log(`📬 To: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔐 VERIFICATION CODE: ${verificationCode}`);
    console.log(`⏰ Valid for: 24 hours`);
    console.log('='.repeat(70));
    console.log('💡 TIP: Copy and paste the verification code above into the app\n');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@dealclarity.com',
      to: email,
      subject: 'Email Verification - Deal Clarity',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Deal Clarity</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Welcome, ${name}!</h2>
            <p style="color: #666; font-size: 16px;">Thank you for signing up for Deal Clarity. To get started, please verify your email address using the code below:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px solid #3b82f6;">
              <p style="margin: 0; color: #999; font-size: 12px;">VERIFICATION CODE</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 3px;">${verificationCode}</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">This code will expire in 24 hours.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
              <p>If you didn't create this account, please ignore this email.</p>
              <p style="margin-bottom: 0;">© 2025 Deal Clarity. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    };

    // Try to send email with a 5-second timeout, but continue if it fails (for development/testing)
    try {
      // Wrap sendMail in a timeout promise to prevent hanging
      const emailPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 5000)
      );
      
      await Promise.race([emailPromise, timeoutPromise]);
      console.log('✅ Email sent successfully\n');
    } catch (emailError) {
      console.log('⚠️  Email service unavailable');
      console.log(`Error: ${emailError.message}`);
      if (emailError.response) console.log(`SMTP Response: ${emailError.response}`);
      console.log('✅ BUT: Verification code is ready to use above!\n');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Critical error in sendVerificationEmail:', error);
    return { success: true }; // Still return success so user can verify
  }
};

// Send welcome email (after verification)
const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@dealclarity.com',
      to: email,
      subject: 'Welcome to Deal Clarity!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Deal Clarity</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Welcome to Deal Clarity, ${name}!</h2>
            <p style="color: #666; font-size: 16px;">Your email has been verified successfully. You can now log in and start managing your deals.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://dealclarity.vercel.app'}/login" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 30px 0; font-weight: bold;">Go to Dashboard</a>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
              <p>© 2025 Deal Clarity. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    // Don't block user from proceeding if welcome email fails
    return { success: true };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetCode) => {
  try {
    // Log the reset code to console for testing
    console.log('\n' + '='.repeat(70));
    console.log('🔐 PASSWORD RESET EMAIL');
    console.log('='.repeat(70));
    console.log(`📬 To: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🔑 RESET CODE: ${resetCode}`);
    console.log(`⏰ Valid for: 1 hour`);
    console.log('='.repeat(70));
    console.log('💡 TIP: Copy and paste the reset code above into the app\n');
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@dealclarity.com',
      to: email,
      subject: 'Password Reset - Deal Clarity',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Deal Clarity</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #666; font-size: 16px;">We received a request to reset your password. Use the code below to create a new password:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px solid #ef4444;">
              <p style="margin: 0; color: #999; font-size: 12px;">RESET CODE</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #ef4444; letter-spacing: 3px;">${resetCode}</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">This code will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
              <p>© 2025 Deal Clarity. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    };

    // Try to send email with a 5-second timeout, but continue if it fails (for development/testing)
    try {
      // Wrap sendMail in a timeout promise to prevent hanging
      const emailPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 5000)
      );
      
      await Promise.race([emailPromise, timeoutPromise]);
      console.log('✅ Email sent successfully\n');
    } catch (emailError) {
      console.log('⚠️  Email service unavailable');
      console.log(`Error: ${emailError.message}`);
      if (emailError.response) console.log(`SMTP Response: ${emailError.response}`);
      console.log('✅ BUT: Reset code is ready to use above!\n');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Critical error in sendPasswordResetEmail:', error);
    return { success: true }; // Still return success so user can reset
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};
