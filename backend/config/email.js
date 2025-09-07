// Email Configuration
// Uses environment variables only; no hardcoded credentials.

const emailConfig = {
  user: process.env.CONTACT_EMAIL_USER,
  pass: process.env.CONTACT_EMAIL_PASS,
  service: process.env.CONTACT_EMAIL_SERVICE || 'gmail',
};

module.exports = emailConfig;
