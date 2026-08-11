const nodemailer = require("nodemailer");

// Single shared transporter — lazy-initialised once, reused by all controllers.
// Port 465 with secure:true uses SSL directly instead of port 587 STARTTLS,
// which avoids timeouts on cloud providers like Render.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️  SMTP credentials not set — emails will be skipped.");
    return null;
  }
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for port 465 (SSL)
    family: 4,    // Force IPv4
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

module.exports = { getTransporter };
