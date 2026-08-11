// mailer.js — Uses Node's built-in https module to call Brevo REST API.
const https = require("https");

const sendEmail = async ({ to, subject, html, replyTo }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("⚠️  BREVO_API_KEY not set — email skipped.");
    return false;
  }

  const senderEmail = process.env.SMTP_USER || "magicmomos12@gmail.com";

  const payload = JSON.stringify({
    sender: { name: "Magic Momos", email: senderEmail },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
    ...(replyTo ? { replyTo: { email: replyTo } } : {}),
  });

  return new Promise((resolve) => {
    const req = https.request(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`[Email] Sent successfully to ${to} (MessageId: ${data.messageId})`);
              resolve(true);
            } else {
              console.error(`[Email] Brevo API Error (${res.statusCode}):`, data.message || body);
              resolve(false);
            }
          } catch (e) {
            console.error("[Email] Response parse error:", e.message, body);
            resolve(false);
          }
        });
      }
    );

    req.on("error", (err) => {
      console.error(`[Email] Request error to ${to}:`, err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
};

const getTransporter = () => {
  return {
    sendMail: async (opts) => {
      const toEmail = typeof opts.to === "string" ? opts.to : opts.to?.[0];
      return sendEmail({
        to: toEmail,
        subject: opts.subject,
        html: opts.html,
        replyTo: opts.replyTo,
      });
    },
  };
};

module.exports = { getTransporter, sendEmail };
