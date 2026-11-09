const { env } = require('../config/env');

class EmailService {
  constructor() {
    this.configured = Boolean(env.SMTP_HOST && env.SMTP_USER);
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.configured) {
      if (env.NODE_ENV === 'development') {
        console.log(`[EMAIL DEV MOCK] To: ${to} | Subject: ${subject}`);
      }
      return { success: true, mocked: true };
    }

    // Nodemailer or SMTP integration when configured
    return { success: true };
  }
}

module.exports = new EmailService();

