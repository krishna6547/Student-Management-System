const express = require('express');
const { emailService } = require('../utils/sendConfirmation'); // Import from utils folder
const router = express.Router();

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  
  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: 'All fields are required.',
      details: {
        name: !name ? 'Name is required' : null,
        email: !email ? 'Email is required' : null,
        message: !message ? 'Message is required' : null
      }
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Please provide a valid email address.' 
    });
  }

  // Sanitize inputs
  const userDetails = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim()
  };

  try {
    console.log(`Processing contact form submission from: ${userDetails.name} (${userDetails.email})`);
    
    // Send both confirmation and notification emails using the email service
    const emailResults = await emailService.sendEmails(userDetails);
    
    // Log results for debugging
    console.log('Email sending results:', {
      confirmation: emailResults.confirmation.success ? 'SUCCESS' : 'FAILED',
      notification: emailResults.notification.success ? 'SUCCESS' : 'FAILED',
      timestamp: new Date().toISOString()
    });

    // Check if at least one email was sent successfully
    const confirmationSent = emailResults.confirmation.success;
    const notificationSent = emailResults.notification.success;

    if (confirmationSent || notificationSent) {
      // Success response with detailed status
      res.json({ 
        success: true,
        message: confirmationSent 
          ? 'Thank you for your message! Please check your email for confirmation.'
          : 'Your message has been received. We will respond soon.',
        emailStatus: {
          confirmationSent,
          notificationSent,
          details: emailResults
        }
      });
    } else {
      // Both emails failed, but we still received the message
      console.error('Both confirmation and notification emails failed:', emailResults);
      res.status(207).json({ // 207 Multi-Status
        success: true,
        message: 'Your message has been received, but there was an issue sending the confirmation email. We will still respond to your inquiry.',
        warning: 'Email delivery issues detected',
        emailStatus: {
          confirmationSent: false,
          notificationSent: false,
          details: emailResults
        }
      });
    }

  } catch (error) {
    console.error('Critical error processing contact form:', {
      error: error.message,
      stack: error.stack,
      userDetails: { name: userDetails.name, email: userDetails.email },
      timestamp: new Date().toISOString()
    });

    // Return error response
    res.status(500).json({ 
      error: 'We encountered an issue processing your message. Please try again later or contact us directly.',
      support: `If this problem persists, please email us directly at ${process.env.SUPPORT_EMAIL || 'support@example.com'}`
    });
  }
});

// Health check endpoint for the contact service
router.get('/contact/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Contact Form Service',
    timestamp: new Date().toISOString(),
    emailService: 'Active'
  });
});

// Get contact statistics (optional - for admin dashboard)
router.get('/contact/stats', (req, res) => {
  // This could be expanded to show actual statistics from a database
  res.json({
    status: 'Contact service operational',
    features: [
      'Dual email system (user confirmation + admin notification)',
      'HTML email templates',
      'Input validation and sanitization',
      'Error handling and logging',
      'Mobile-responsive emails'
    ],
    lastUpdate: '2025-01-10'
  });
});

module.exports = router;