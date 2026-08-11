const dns      = require("dns");
dns.setDefaultResultOrder("ipv4first"); // Render can't reach Gmail over IPv6 — force IPv4
const nodemailer = require("nodemailer");


// Single shared transporter — lazy-initialised once, reused by all controllers
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
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

module.exports = { getTransporter };
