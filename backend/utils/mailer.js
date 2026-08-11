const nodemailer = require("nodemailer");

// Single shared transporter — lazy-initialised once, reused by all controllers.
// family:4 forces a TCP/IPv4 connection at the socket level — bypasses Render's
// IPv6-preferring DNS which causes ENETUNREACH on smtp.gmail.com:587.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️  SMTP credentials not set — emails will be skipped.");
    return null;
  }
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,
    family: 4, // Force IPv4 — Render resolves smtp.gmail.com to IPv6 by default (ENETUNREACH)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

module.exports = { getTransporter };
