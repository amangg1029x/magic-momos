const nodemailer = require("nodemailer");
const Contact    = require("../models/Contact");

// ── Nodemailer transporter (lazy-initialised so missing env vars don't crash) ─
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️  SMTP credentials not set — contact emails will be skipped.");
    return null;
  }
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

// ── POST /api/contact ─────────────────────────────────────────────────────────
const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // 1. Save to DB
    const contact = await Contact.create({ name, email, phone, subject, message });

    // 2. Send notification email (non-blocking — we don't fail the request if email fails)
    const mail = getTransporter();
    if (mail) {
      mail
        .sendMail({
          from:    `"Magic Momos Website" <${process.env.SMTP_USER}>`,
          to:      process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
          replyTo: email,
          subject: `[Magic Momos] ${subject || "New Contact Message"} — from ${name}`,
          html: `
            <h2>New contact form submission</h2>
            <table cellpadding="8" style="border-collapse:collapse;">
              <tr><td><b>Name</b></td><td>${name}</td></tr>
              <tr><td><b>Email</b></td><td>${email}</td></tr>
              <tr><td><b>Phone</b></td><td>${phone || "—"}</td></tr>
              <tr><td><b>Subject</b></td><td>${subject || "General Enquiry"}</td></tr>
              <tr><td valign="top"><b>Message</b></td><td>${message.replace(/\n/g, "<br>")}</td></tr>
            </table>
          `,
        })
        .catch((err) => console.error("Contact email error:", err.message));

      // 3. Auto-reply to the customer
      mail
        .sendMail({
          from:    `"Magic Momos" <${process.env.SMTP_USER}>`,
          to:      email,
          subject: "We received your message! 🥟 — Magic Momos",
          html: `
            <p>Hi ${name},</p>
            <p>Thank you for reaching out to Magic Momos! 🥟</p>
            <p>We've received your message and will get back to you within <b>4 hours</b> during business hours (10 AM – 11 PM).</p>
            <p>Your reference: <b>#${contact._id}</b></p>
            <hr>
            <p style="color:#666;font-size:13px;">Magic Momos · 42 Food Street, Lajpat Nagar, New Delhi</p>
          `,
        })
        .catch((err) => console.error("Auto-reply email error:", err.message));
    }

    res.status(201).json({
      success: true,
      message: "Your message has been received! We'll reply within 4 hours.",
      id:      contact._id,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/admin/contacts ───────────────────────────────────────────────────
const adminGetContacts = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Contact.countDocuments(filter),
    ]);

    res.json({
      success: true,
      contacts,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/admin/contacts/:id ─────────────────────────────────────────────
const adminUpdateContact = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true, runValidators: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: "Contact not found." });
    res.json({ success: true, contact });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContact, adminGetContacts, adminUpdateContact };
