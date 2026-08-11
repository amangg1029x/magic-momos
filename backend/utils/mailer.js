// mailer.js — Uses Brevo REST API (HTTPS) to send emails.
// This bypasses all Render SMTP port blocks (25, 465, 587) & IPv6 issues.

const sendEmail = async ({ to, subject, html, replyTo }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("⚠️  BREVO_API_KEY not set — email skipped.");
    return false;
  }

  const senderEmail = process.env.SMTP_USER || "magicmomos12@gmail.com";

  const payload = {
    sender: { name: "Magic Momos", email: senderEmail },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send email via Brevo");
    }

    console.log(`[Email] Sent successfully to ${to} (MessageId: ${data.messageId})`);
    return true;
  } catch (err) {
    console.error(`[Email] FAILED to ${to}:`, err.message);
    return false;
  }
};

// Backwards-compatible interface matching nodemailer sendMail
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
