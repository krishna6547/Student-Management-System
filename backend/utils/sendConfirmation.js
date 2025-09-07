const nodemailer = require('nodemailer');

/**
 * Email Service for Student Management System
 * Handles confirmation emails to users and notification emails to admins
 */
class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create nodemailer transporter with Gmail configuration
   */
  createTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL_USER,
        pass: process.env.CONTACT_EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Generate beautiful HTML email template for user confirmation
   */
  generateConfirmationTemplate(userDetails) {
    const { name, email, message } = userDetails;
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message Received - Student Management System</title>
        <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; line-height: 1.6; }
            .email-container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%); position: relative; overflow: hidden; }
            .email-header { background: rgba(255, 255, 255, 0.1); padding: 30px 40px; text-align: center; position: relative; }
            .email-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>'); opacity: 0.3; }
            .logo { position: relative; z-index: 2; font-size: 28px; font-weight: 700; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 10px; }
            .tagline { position: relative; z-index: 2; color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0; }
            .email-content { background: white; padding: 40px; margin: 0; }
            .greeting { font-size: 24px; font-weight: 600; color: #1E293B; margin-bottom: 20px; }
            .message-text { color: #64748B; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
            .highlight-box { background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #8B5CF6; margin: 25px 0; }
            .highlight-text { color: #1E293B; font-weight: 500; margin: 0; }
            .user-message-box { background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #6366F1; margin: 25px 0; }
            .user-message-title { font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 10px; }
            .user-message-content { color: #64748B; font-style: italic; line-height: 1.6; }
            .cta-button { display: inline-block; background: linear-gradient(45deg, #8B5CF6, #6366F1); color: white !important; text-decoration: none; padding: 15px 35px; font-size: 16px; font-weight: 600; border-radius: 50px; text-align: center; margin: 20px 0; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
            .email-footer { background: #1E293B; color: rgba(255, 255, 255, 0.8); padding: 30px 40px; text-align: center; }
            .footer-text { margin: 0; font-size: 14px; line-height: 1.5; }
            .footer-links { margin: 15px 0 0 0; }
            .footer-link { color: #8B5CF6; text-decoration: none; margin: 0 15px; font-size: 14px; }
            @media only screen and (max-width: 600px) {
                .email-container { width: 100% !important; margin: 0 !important; }
                .email-header, .email-content, .email-footer { padding: 20px !important; }
                .logo { font-size: 24px; }
                .greeting { font-size: 20px; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <div class="logo">Student Management System</div>
                <p class="tagline">Streamlined Education Management</p>
            </div>
            
            <div class="email-content">
                <h1 class="greeting">Hi ${name}! 👋</h1>
                
                <p class="message-text">
                    Thank you for reaching out to the Student Management System. We've successfully 
                    received your message on ${currentDate} and appreciate you taking the time to contact us.
                </p>
                
                <div class="highlight-box">
                    <p class="highlight-text">
                        <strong>✅ Your message has been received!</strong> Our support team will review your 
                        inquiry and respond within 24 hours during business hours (Mon-Fri, 9 AM - 6 PM).
                    </p>
                </div>
                
                <div class="user-message-box">
                    <div class="user-message-title">📝 Your Message:</div>
                    <div class="user-message-content">"${message}"</div>
                </div>
                
                <p class="message-text">
                    In the meantime, feel free to explore our system features or check out our latest updates. 
                    If you have any urgent questions, don't hesitate to reach out directly.
                </p>
                
                <div style="text-align: center;">
                    <a href="#" class="cta-button">🚀 Visit Website</a>
                </div>
                
                <p class="message-text">
                    Best regards,<br>
                    <strong>The Student Management System Team</strong><br>
                    <small style="color: #94a3b8;">Email: ${process.env.SUPPORT_EMAIL || 'support@example.com'}</small>
                </p>
            </div>
            
            <div class="email-footer">
                <p class="footer-text">
                    © 2025 Student Management System. All rights reserved.<br>
                    You're receiving this email because you contacted us through our website.
                </p>
      
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Send confirmation email to the user
   */
  async sendConfirmationEmail(userDetails) {
    const { name, email } = userDetails;
    
    try {
      const htmlContent = this.generateConfirmationTemplate(userDetails);
      
      const mailOptions = {
        from: {
          name: 'Student Management System',
          address: process.env.CONTACT_EMAIL_USER
        },
        to: email,
        subject: `✅ Message Received - Student Management System`,
        html: htmlContent,
        text: `Hi ${name},

Thank you for contacting Student Management System. We've received your message and will respond within 24 hours during business hours.

Your message: "${userDetails.message}"

Best regards,
The Student Management System Team
Email: ${process.env.SUPPORT_EMAIL || 'support@example.com'}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Confirmation email sent to ${email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error(`❌ Error sending confirmation email to ${email}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification email to admin
   */
  async sendNotificationEmail(userDetails) {
    const { name, email, message } = userDetails;
    const currentDate = new Date().toLocaleString();
    
    try {
      const mailOptions = {
        from: {
          name: 'Student Management System - Contact Form',
          address: process.env.CONTACT_EMAIL_USER
        },
        to: process.env.ADMIN_EMAIL,
        subject: `🔔 New Contact: ${name} - Student Management System`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; padding: 25px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">📬 New Contact Form Submission</h2>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Student Management System</p>
          </div>
          
          <div style="background: white; padding: 30px;">
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #8B5CF6;">
              <h3 style="color: #1E293B; margin: 0 0 15px 0; font-size: 18px;">👤 Contact Information</h3>
              <p style="margin: 5px 0; color: #64748B;"><strong style="color: #1E293B;">Name:</strong> ${name}</p>
              <p style="margin: 5px 0; color: #64748B;"><strong style="color: #1E293B;">Email:</strong> <a href="mailto:${email}" style="color: #8B5CF6;">${email}</a></p>
              <p style="margin: 5px 0; color: #64748B;"><strong style="color: #1E293B;">Received:</strong> ${currentDate}</p>
            </div>
            
            <h3 style="color: #1E293B; margin: 0 0 15px 0; font-size: 18px;">💬 Message Content</h3>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #6366F1;">
              <p style="margin: 0; line-height: 1.6; color: #334155;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="mailto:${email}?subject=Re: Your message to Student Management System&body=Hi ${name},%0D%0A%0D%0AThank you for contacting Student Management System.%0D%0A%0D%0A" 
                 style="background: linear-gradient(45deg, #8B5CF6, #6366F1); color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                📧 Reply to ${name}
              </a>
            </div>
          </div>
          
          <div style="background: #1E293B; color: rgba(255,255,255,0.8); padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0;">Student Management System - Contact Form Notification</p>
          </div>
        </div>`,
        text: `New Contact Form Submission - Student Management System

Contact Details:
Name: ${name}
Email: ${email}
Date: ${currentDate}

Message:
${message}

Reply directly to: ${email}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Admin notification sent:`, result.messageId);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error(`❌ Error sending admin notification:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send both confirmation and notification emails
   */
  async sendEmails(userDetails) {
    console.log(`📧 Sending emails for contact from: ${userDetails.name} (${userDetails.email})`);
    
    try {
      // Send both emails concurrently for better performance
      const [confirmationResult, notificationResult] = await Promise.allSettled([
        this.sendConfirmationEmail(userDetails),
        this.sendNotificationEmail(userDetails)
      ]);

      return {
        confirmation: confirmationResult.status === 'fulfilled' 
          ? confirmationResult.value 
          : { success: false, error: confirmationResult.reason?.message || 'Unknown error' },
        notification: notificationResult.status === 'fulfilled' 
          ? notificationResult.value 
          : { success: false, error: notificationResult.reason?.message || 'Unknown error' }
      };
    } catch (error) {
      console.error('Critical error in sendEmails:', error);
      throw error;
    }
  }
}

// Create and export email service instance
const emailService = new EmailService();

module.exports = {
  EmailService,
  emailService
};